import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 60;

/** Normaliza um texto para um formato de slug seguro (sem acento, minúsculo, só hífen simples). */
export function normalizeSlug(input) {
    return String(input || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, MAX_LENGTH);
}

export async function reservePublicSlug(businessId, rawSlug) {
    const slug = normalizeSlug(rawSlug);
    if (slug.length < MIN_LENGTH || slug.length > MAX_LENGTH || !SLUG_REGEX.test(slug)) {
        throw new Error(
            `Link inválido. Use apenas letras, números e hífen, entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres.`
        );
    }

    const businessRef = doc(db, COLLECTIONS.BUSINESSES, businessId);
    const businessSnap = await getDoc(businessRef);
    const oldSlug = businessSnap.exists() ? businessSnap.data().publicSlug || null : null;

    if (oldSlug === slug) {
        return { success: true, slug };
    }

    const newSlugRef = doc(db, COLLECTIONS.PUBLIC_SLUGS, slug);

    try {
        await runTransaction(db, async (tx) => {
            const newSlugSnap = await tx.get(newSlugRef);
            if (newSlugSnap.exists() && newSlugSnap.data().businessId !== businessId) {
                throw new Error("TAKEN");
            }

            tx.set(newSlugRef, {
                businessId,
                createdAt: newSlugSnap.exists() ? newSlugSnap.data().createdAt : serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            if (oldSlug) {
                tx.delete(doc(db, COLLECTIONS.PUBLIC_SLUGS, oldSlug));
            }

            tx.update(businessRef, {
                publicSlug: slug,
                updatedAt: serverTimestamp(),
            });
        });
    } catch (err) {
        if (err.message === "TAKEN") {
            throw new Error("Este link já está em uso por outra empresa. Escolha outro.");
        }
        throw err;
    }

    return { success: true, slug };
}

export async function syncBusinessPublicMirror(businessId, business) {
    const ob = business.onlineBooking || {};
    const showContact = ob.showContact !== false;
    const showAddress = ob.showAddress !== false;

    await setDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId), {
        businessName: business.businessName || "",
        logoUrl: business.logoUrl || "",
        description: business.description || "",
        address: showAddress ? business.address || "" : "",
        phone: showContact ? business.whatsapp || business.phone || "" : "",
        publicSlug: business.publicSlug || "",
        businessHours: business.businessHours || null,
        blockedDates: Array.isArray(business.blockedDates) ? business.blockedDates : [],
        timezone: business.timezone || "America/Sao_Paulo",
        onlineBooking: {
            enabled: ob.enabled === true,
            showProducts: ob.showProducts === true,
            showPrices: ob.showPrices === true,
            allowCancellation: ob.allowCancellation !== false,
            minimumAdvanceMinutes: Number.isFinite(ob.minimumAdvanceMinutes) ? ob.minimumAdvanceMinutes : 120,
            maximumAdvanceDays: Number.isFinite(ob.maximumAdvanceDays) ? ob.maximumAdvanceDays : 30,
            slotIntervalMinutes: Number.isFinite(ob.slotIntervalMinutes) ? ob.slotIntervalMinutes : 15,
        },
        updatedAt: serverTimestamp(),
    });
}

/** Lê se a empresa mostra preço publicamente (fonte única de verdade: o espelho já salvo). */
async function getShowPrices(businessId) {
    const snap = await getDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId));
    return snap.exists() && snap.data().onlineBooking?.showPrices === true;
}

/** Re-grava todos os serviços elegíveis de uma empresa no espelho público (usar quando showPrices mudar). */
export async function resyncAllPublicServices(businessId, services) {
    const showPrices = await getShowPrices(businessId);
    const publicServicesRef = collection(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES);

    await Promise.all(
        services.map((s) => {
            const shouldPublish = s.active === true && s.availableOnline === true;
            const ref = doc(publicServicesRef, s.id);
            if (!shouldPublish) return deleteDoc(ref).catch(() => { });
            return setDoc(ref, {
                id: s.id,
                name: s.name || "",
                description: s.description || "",
                duration: Number(s.duration) || 30,
                price: showPrices ? Number(s.price) || 0 : null,
                updatedAt: serverTimestamp(),
            });
        })
    );
}

export async function syncPublicServiceMirror(businessId, service) {
    const ref = doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES, service.id);
    const shouldPublish = service.active === true && service.availableOnline === true;

    if (!shouldPublish) {
        await deleteDoc(ref).catch(() => { });
        return;
    }

    const showPrices = await getShowPrices(businessId);

    await setDoc(ref, {
        id: service.id,
        name: service.name || "",
        description: service.description || "",
        duration: Number(service.duration) || 30,
        price: showPrices ? Number(service.price) || 0 : null,
        updatedAt: serverTimestamp(),
    });
}

/** Remove o espelho público de um serviço (usar quando o serviço for excluído). */
export async function deletePublicServiceMirror(businessId, serviceId) {
    await deleteDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES, serviceId)).catch(
        () => { }
    );
}

/** Busca o businessId a partir de um slug público (usado na página /agendar/:slug). */
export async function getBusinessIdBySlug(slug) {
    const snap = await getDoc(doc(db, COLLECTIONS.PUBLIC_SLUGS, normalizeSlug(slug)));
    return snap.exists() ? snap.data().businessId : null;
}

/** Busca os dados públicos da empresa (para a página /agendar/:slug e o redirect por businessId). */
export async function getPublicBusiness(businessId) {
    const snap = await getDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Lista os serviços públicos (já filtrados) de uma empresa. */
export async function getPublicServices(businessId) {
    const snap = await getDocs(collection(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
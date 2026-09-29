import { doc, updateDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { logActivity } from "./activityLogService";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { syncBusinessPublicMirror, resyncAllPublicServices } from "./customerPortalService";

/** Atualiza os dados cadastrais da empresa (seção "Empresa" das Configurações). */
export async function updateCompanyProfile(businessId, data) {
    assertNotDemoAccount(businessId);
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, businessId), {
        businessName: data.businessName.trim(),
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        address: data.address || "",
        cnpj: data.cnpj || "",
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "company_updated",
        description: "Dados da empresa atualizados",
    });
}

export async function uploadCompanyLogo(businessId, file) {
    assertNotDemoAccount(businessId);
    const path = `businesses/${businessId}/logo-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const logoUrl = await getDownloadURL(storageRef);

    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, businessId), {
        logoUrl,
        updatedAt: serverTimestamp(),
    });

    return logoUrl;
}

/** Atualiza preferências: tema, moeda e fuso horário. */
export async function updatePreferences(businessId, { theme, currency, timezone }) {
    assertNotDemoAccount(businessId);
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, businessId), {
        theme,
        currency,
        timezone,
        updatedAt: serverTimestamp(),
    });
}

export async function updateOnlineBookingSettings(businessId, currentBusiness, settings) {
    assertNotDemoAccount(businessId);

    const merged = {
        ...currentBusiness,
        onlineBooking: settings.onlineBooking,
        businessHours: settings.businessHours,
        blockedDates: settings.blockedDates,
    };

    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, businessId), {
        onlineBooking: settings.onlineBooking,
        businessHours: settings.businessHours,
        blockedDates: settings.blockedDates,
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "online_booking_updated",
        description: "Configurações de agendamento online atualizadas",
    });

    await syncBusinessPublicMirror(businessId, merged);

    const showPricesChanged =
        (currentBusiness.onlineBooking?.showPrices === true) !== (settings.onlineBooking?.showPrices === true);

    if (showPricesChanged) {
        const servicesSnap = await getDocs(
            query(collection(db, COLLECTIONS.SERVICES), where("businessId", "==", businessId))
        );
        const services = servicesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        await resyncAllPublicServices(businessId, services);
    }
}
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { logActivity } from "./activityLogService";

/**
 * Escuta em tempo real a lista de serviços do negócio, ordenada por nome.
 */
export function subscribeServices(businessId, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.SERVICES),
        where("businessId", "==", businessId),
        orderBy("name")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[NexoGestão] Erro ao escutar serviços:", err);
            onError?.(err);
        }
    );
}

export async function createService(businessId, data) {
    await addDoc(collection(db, COLLECTIONS.SERVICES), {
        businessId,
        name: data.name.trim(),
        description: data.description || "",
        category: data.category || "Outros",
        price: Number(data.price) || 0,
        duration: Number(data.duration) || 30,
        active: data.active ?? true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "service_created",
        description: `Serviço "${data.name.trim()}" cadastrado`,
    });
}

export async function updateService(businessId, serviceId, data) {
    await updateDoc(doc(db, COLLECTIONS.SERVICES, serviceId), {
        name: data.name.trim(),
        description: data.description || "",
        category: data.category || "Outros",
        price: Number(data.price) || 0,
        duration: Number(data.duration) || 30,
        active: data.active ?? true,
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "service_updated",
        description: `Serviço "${data.name.trim()}" editado`,
    });
}

export async function toggleServiceActive(businessId, service) {
    await updateDoc(doc(db, COLLECTIONS.SERVICES, service.id), {
        active: !service.active,
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "service_updated",
        description: `Serviço "${service.name}" ${service.active ? "desativado" : "ativado"}`,
    });
}

export async function deleteService(businessId, serviceId, serviceName) {
    assertNotDemoAccount(businessId);
    await deleteDoc(doc(db, COLLECTIONS.SERVICES, serviceId));

    await logActivity(businessId, {
        action: "service_deleted",
        description: `Serviço "${serviceName}" excluído`,
    });
}

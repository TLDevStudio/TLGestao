import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { logActivity } from "./activityLogService";

/**
 * Escuta em tempo real a lista de clientes do negócio, ordenada por nome.
 * Retorna a função de unsubscribe (usar dentro de useEffect).
 */
export function subscribeClients(businessId, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.CLIENTS),
        where("businessId", "==", businessId),
        orderBy("name")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[NexoGestão] Erro ao escutar clientes:", err);
            onError?.(err);
        }
    );
}

export async function getClientById(clientId) {
    const snap = await getDoc(doc(db, COLLECTIONS.CLIENTS, clientId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createClient(businessId, data) {
    const ref = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
        businessId,
        name: data.name.trim(),
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        cpf: data.cpf || "",
        birthDate: data.birthDate || "",
        address: data.address || "",
        notes: data.notes || "",
        totalSpent: 0,
        visitsCount: 0,
        lastVisitAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "client_created",
        description: `Cliente "${data.name.trim()}" cadastrado`,
    });

    return ref.id;
}

export async function updateClient(businessId, clientId, data) {
    await updateDoc(doc(db, COLLECTIONS.CLIENTS, clientId), {
        name: data.name.trim(),
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        cpf: data.cpf || "",
        birthDate: data.birthDate || "",
        address: data.address || "",
        notes: data.notes || "",
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "client_updated",
        description: `Cliente "${data.name.trim()}" editado`,
    });
}

export async function deleteClient(businessId, clientId, clientName) {
    await deleteDoc(doc(db, COLLECTIONS.CLIENTS, clientId));

    await logActivity(businessId, {
        action: "client_deleted",
        description: `Cliente "${clientName}" excluído`,
    });
}

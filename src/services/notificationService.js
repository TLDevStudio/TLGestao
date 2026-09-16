import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const MAX_NOTIFICATIONS = 30;

/** Cria uma notificação. Chamado internamente por outros serviços (não pela UI diretamente). */
export async function createNotification(businessId, { type, title, message }) {
    try {
        await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
            businessId,
            type,
            title,
            message,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        // Notificação é um "extra" — uma falha aqui nunca deve travar a ação principal
        // (criar venda, ajustar estoque, etc.), então só logamos o erro.
        console.error("[NexoGestão] Falha ao criar notificação:", err);
    }
}

export function subscribeNotifications(businessId, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where("businessId", "==", businessId),
        orderBy("createdAt", "desc"),
        limit(MAX_NOTIFICATIONS)
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[NexoGestão] Erro ao escutar notificações:", err);
            onError?.(err);
        }
    );
}

export async function markAsRead(notificationId) {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { read: true });
}

export async function markAllAsRead(businessId, unreadIds) {
    const batch = writeBatch(db);
    unreadIds.forEach((id) => {
        batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, id), { read: true });
    });
    await batch.commit();
}

export async function deleteNotification(notificationId) {
    await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId));
}

export async function clearAllNotifications(businessId) {
    const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), where("businessId", "==", businessId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
}

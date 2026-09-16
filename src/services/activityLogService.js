import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

/**
 * Registra uma ação no histórico geral do negócio.
 * Usado por todos os módulos (Clientes, Vendas, Estoque, Financeiro, Agendamentos...).
 * Nunca deve travar o fluxo principal: falhas aqui são apenas logadas no console.
 */
export async function logActivity(businessId, { action, description }) {
    try {
        await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
            businessId,
            action,
            description,
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        console.error("[NexoGestão] Falha ao registrar histórico:", err);
    }
}
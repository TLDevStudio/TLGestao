import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { logActivity } from "./activityLogService";

export const INCOME_CATEGORIES = ["Venda", "Serviço", "Outros"];

export const EXPENSE_CATEGORIES = [
    "Aluguel",
    "Energia",
    "Internet",
    "Fornecedor",
    "Funcionários",
    "Combustível",
    "Marketing",
    "Outros",
];

export const TRANSACTION_STATUS = {
    paid: "Pago",
    pending: "Pendente",
};

/** Escuta as transações do negócio dentro de um intervalo de datas. */
export function subscribeTransactionsInRange(businessId, start, end, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where("businessId", "==", businessId),
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end)),
        orderBy("date", "desc")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[TLGestão] Erro ao escutar transações:", err);
            onError?.(err);
        }
    );
}

export async function createTransaction(businessId, data) {
    await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        businessId,
        type: data.type,
        category: data.category,
        description: data.description.trim(),
        amount: Number(data.amount) || 0,
        date: Timestamp.fromDate(data.date),
        paymentMethod: data.paymentMethod || "other",
        status: data.status || "paid",
        notes: data.notes || "",
        saleId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: data.type === "expense" ? "expense_created" : "income_created",
        description: `${data.type === "expense" ? "Despesa" : "Receita"} "${data.description.trim()}" lançada`,
    });
}

export async function updateTransaction(businessId, transactionId, data) {
    await updateDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId), {
        type: data.type,
        category: data.category,
        description: data.description.trim(),
        amount: Number(data.amount) || 0,
        date: Timestamp.fromDate(data.date),
        paymentMethod: data.paymentMethod || "other",
        status: data.status || "paid",
        notes: data.notes || "",
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "transaction_updated",
        description: `Lançamento "${data.description.trim()}" editado`,
    });
}

export async function deleteTransaction(businessId, transactionId, description) {
    assertNotDemoAccount(businessId);
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, transactionId));

    await logActivity(businessId, {
        action: "transaction_deleted",
        description: `Lançamento "${description}" excluído`,
    });
}

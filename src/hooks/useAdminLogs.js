import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

/**
 * Escuta em tempo real o histórico de ações administrativas (liberar,
 * bloquear, inativar, reativar, excluir contas), mais recentes primeiro.
 * Só funciona para quem tem role "admin" (regra da Fase 11).
 */
export function useAdminLogs(max = 200) {
    const [logs, setLogs] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, COLLECTIONS.ADMIN_LOGS),
            orderBy("createdAt", "desc"),
            limit(max)
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setError(false);
            },
            (err) => {
                console.error("[TLGestão] Erro ao carregar logs administrativos:", err);
                setError(true);
            }
        );

        return unsubscribe;
    }, [max]);

    return { logs, loading: logs === null && !error, error };
}
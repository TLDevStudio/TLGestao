import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { useAuth } from "../contexts/AuthContext";

const PAGE_SIZE = 25;

export function useActivityLogs() {
    const { user } = useAuth();
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const q = query(
            collection(db, COLLECTIONS.ACTIVITY_LOGS),
            where("businessId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(pageSize)
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setLogs(list);
                setHasMore(list.length === pageSize);
                setLoading(false);
            },
            (err) => {
                console.error("[TLGestão] Erro ao escutar histórico:", err);
                setError("Não foi possível carregar o histórico.");
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [user, pageSize]);

    const loadMore = () => setPageSize((size) => size + PAGE_SIZE);

    return { logs, loading, error, hasMore, loadMore };
}

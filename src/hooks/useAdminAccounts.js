import { useEffect, useState } from "react";
import { subscribeAllBusinesses } from "../services/adminStatsService";

/**
 * Lista em tempo real de todas as contas (businesses) do sistema, para
 * uso nas telas administrativas. `businesses` fica `null` enquanto
 * carrega a primeira vez.
 */
export function useAdminAccounts() {
    const [businesses, setBusinesses] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeAllBusinesses(
            (data) => {
                setBusinesses(data);
                setError(false);
            },
            () => setError(true)
        );
        return unsubscribe;
    }, []);

    return { businesses, loading: businesses === null && !error, error };
}
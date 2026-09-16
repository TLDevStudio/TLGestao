import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeClients } from "../services/clientService";
import { useDebounce } from "./useDebounce";

export function useClients(searchTerm = "") {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeClients(
            user.uid,
            (list) => {
                setClients(list);
                setLoading(false);
            },
            () => {
                setError("Não foi possível carregar os clientes.");
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user]);

    const filteredClients = useMemo(() => {
        const term = debouncedSearch.trim().toLowerCase();
        if (!term) return clients;
        return clients.filter((c) =>
            [c.name, c.phone, c.email, c.cpf].some((field) =>
                (field || "").toLowerCase().includes(term)
            )
        );
    }, [clients, debouncedSearch]);

    return { clients: filteredClients, allClientsCount: clients.length, loading, error };
}

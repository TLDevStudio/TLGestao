import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeServices } from "../services/serviceService";
import { useDebounce } from "./useDebounce";

export function useServices({ search = "", category = "all", status = "all" } = {}) {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeServices(
            user.uid,
            (list) => {
                setServices(list);
                setLoading(false);
            },
            () => {
                setError("Não foi possível carregar os serviços.");
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user]);

    const categories = useMemo(() => {
        const set = new Set(services.map((s) => s.category).filter(Boolean));
        return Array.from(set).sort();
    }, [services]);

    const filteredServices = useMemo(() => {
        const term = debouncedSearch.trim().toLowerCase();
        return services.filter((s) => {
            const matchesTerm = !term || s.name.toLowerCase().includes(term);
            const matchesCategory = category === "all" || s.category === category;
            const matchesStatus =
                status === "all" || (status === "active" ? s.active : !s.active);
            return matchesTerm && matchesCategory && matchesStatus;
        });
    }, [services, debouncedSearch, category, status]);

    return {
        services: filteredServices,
        allServicesCount: services.length,
        categories,
        loading,
        error,
    };
}

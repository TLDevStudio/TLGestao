import { useEffect, useState } from "react";
import { getBusinessIdBySlug, getPublicBusiness, getPublicServices } from "../services/customerPortalService";

export function usePublicBusiness(slug) {
    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        (async () => {
            try {
                const businessId = await getBusinessIdBySlug(slug);
                if (!businessId) {
                    throw new Error("Empresa não encontrada. Confira o link e tente novamente.");
                }

                const [businessData, serviceList] = await Promise.all([
                    getPublicBusiness(businessId),
                    getPublicServices(businessId),
                ]);

                if (cancelled) return;

                if (!businessData || businessData.onlineBooking?.enabled !== true) {
                    throw new Error("Esta empresa não está com o agendamento online disponível no momento.");
                }

                setBusiness({ id: businessId, ...businessData });
                setServices(serviceList);
            } catch (err) {
                if (!cancelled) setError(err.message || "Não foi possível carregar a empresa.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    return { business, services, loading, error };
}
import { useEffect, useState } from "react";
import { getAvailableSlots } from "../services/availabilityService";

/**
 * Recalcula os horários disponíveis sempre que businessId/serviceId/dateStr
 * mudam (ex.: o cliente troca o dia no calendário). "dateStr" é uma string
 * "AAAA-MM-DD" no fuso horário da própria empresa.
 */
export function useAvailableSlots({ businessId, serviceId, dateStr }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!businessId || !serviceId || !dateStr) {
            setSlots([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAvailableSlots({ businessId, serviceId, dateStr })
            .then((result) => {
                if (!cancelled) setSlots(result);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || "Não foi possível carregar os horários disponíveis.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [businessId, serviceId, dateStr]);

    return { slots, loading, error };
}
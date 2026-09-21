import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPeriodRange } from "../utils/periodHelpers";
import {
    getFinancialReport,
    getClientsReport,
    getServicesReport,
    getProductsReport,
} from "../services/reportService";

export function useReports({ period, customStart, customEnd }) {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const { start, end } = getPeriodRange(period, customStart, customEnd);
            const [financial, clients, services, products] = await Promise.all([
                getFinancialReport(user.uid, start, end),
                getClientsReport(user.uid, start, end),
                getServicesReport(user.uid, start, end),
                getProductsReport(user.uid, start, end),
            ]);
            setData({ financial, clients, services, products, range: { start, end } });
        } catch (err) {
            console.error("[TLGestão] Erro ao gerar relatórios:", err);
            setError("Não foi possível carregar os relatórios.");
        } finally {
            setLoading(false);
        }
    }, [user, period, customStart, customEnd]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, reload: load };
}

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { generateInsights } from "../services/insightsService";

export function useInsights() {
    const { user } = useAuth();
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        setLoading(true);
        generateInsights(user.uid)
            .then((result) => {
                if (!cancelled) setInsights(result);
            })
            .catch((err) => {
                console.error("[TLGestão] Erro ao gerar insights:", err);
                if (!cancelled) setError("Não foi possível gerar os insights agora.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [user]);

    return { insights, loading, error };
}

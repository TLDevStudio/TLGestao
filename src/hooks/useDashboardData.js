import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardData } from "../services/dashboardService";

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardData(user.uid);
      setData(result);
    } catch (err) {
      console.error("[NexoGestão] Erro ao carregar dashboard:", err);
      setError("Não foi possível carregar os dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

import { CardSkeleton } from "../ui/Loading";
import EmptyState from "../ui/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ChartCard({ title, subtitle, children, loading, isEmpty }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-ink-soft">{subtitle}</p>}
      </div>

      {loading ? (
        <CardSkeleton />
      ) : isEmpty ? (
        <EmptyState
          icon={BarChart3}
          title="Ainda sem dados suficientes"
          description="Assim que você registrar vendas, este gráfico será preenchido automaticamente."
        />
      ) : (
        <div className="h-64">{children}</div>
      )}
    </div>
  );
}

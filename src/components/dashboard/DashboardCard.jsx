import { CardSkeleton } from "../ui/Loading";

export default function DashboardCard({ label, value, delta, icon: Icon, loading }) {
  if (loading) return <CardSkeleton />;

  const positive = typeof delta === "number" ? delta >= 0 : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 transition hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-soft">{label}</p>
        {Icon && (
          <div className="rounded-lg bg-paper-dim p-2">
            <Icon size={16} className="text-pine-800" />
          </div>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink sm:text-[1.7rem]">
        {value}
      </p>
      {typeof delta === "number" && (
        <p className={`mt-1 text-xs font-medium ${positive ? "text-success" : "text-danger"}`}>
          {positive ? "+" : ""}
          {delta.toFixed(1)}% em relação ao mês anterior
        </p>
      )}
    </div>
  );
}

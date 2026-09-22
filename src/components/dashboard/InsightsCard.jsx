import { TrendingUp, TrendingDown, Scissors, Package, UserX, AlertTriangle, Sparkles } from "lucide-react";
import { useInsights } from "../../hooks/useInsights";
import { Skeleton } from "../ui/Loading";

const ICONS = {
    up: TrendingUp,
    down: TrendingDown,
    scissors: Scissors,
    package: Package,
    user_x: UserX,
    alert: AlertTriangle,
};

const TONE_BG = {
    success: "bg-success-100 text-success",
    danger: "bg-danger-100 text-danger",
    amber: "bg-amber-100 text-amber-600",
    pine: "bg-pine-900/10 text-pine-800",
};

export default function InsightsCard() {
    const { insights, loading, error } = useInsights();

    return (
        <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="font-display text-base font-semibold text-ink">TL Insights</h3>
            </div>

            {loading && (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                            <Skeleton className="h-3.5 w-4/5" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && <p className="text-sm text-danger">{error}</p>}

            {!loading && !error && insights.length === 0 && (
                <p className="text-sm text-ink-soft leading-relaxed">
                    Assim que houver mais vendas, clientes e movimentações de estoque, o TL Insights vai
                    começar a gerar análises automáticas sobre o seu negócio.
                </p>
            )}

            {!loading && !error && insights.length > 0 && (
                <ul className="space-y-3">
                    {insights.map((insight) => {
                        const Icon = ICONS[insight.icon];
                        return (
                            <li key={insight.id} className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_BG[insight.tone]}`}>
                                    <Icon size={15} />
                                </div>
                                <p className="text-sm leading-snug text-ink">{insight.text}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

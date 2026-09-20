import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle2, Ban, PauseCircle, Building2, UserPlus } from "lucide-react";
import { Spinner } from "../../components/ui/Loading";
import { subscribeAllBusinesses, computeAccountStats } from "../../services/adminStatsService";

function MetricCard({ label, value, icon: Icon, tone = "text-ink" }) {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
                <p className="text-sm text-ink-soft">{label}</p>
                <Icon size={16} className={tone} />
            </div>
            <p className={`mt-2 font-display text-2xl font-semibold ${tone}`}>{value}</p>
        </div>
    );
}

/**
 * Dashboard administrativo com indicadores reais, calculados a partir
 * das contas de verdade no Firestore (nenhum número fixo/fictício).
 */
export default function AdminDashboard() {
    const [businesses, setBusinesses] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeAllBusinesses(setBusinesses, () => setError(true));
        return unsubscribe;
    }, []);

    if (error) {
        return (
            <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">
                Não foi possível carregar os dados administrativos. Confirme se
                as regras do Firestore da Fase 8 foram publicadas no Firebase
                Console.
            </p>
        );
    }

    if (!businesses) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Spinner size={26} />
            </div>
        );
    }

    const stats = computeAccountStats(businesses);

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Usuários
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <MetricCard label="Total de contas" value={stats.total} icon={Users} />
                    <MetricCard label="Pendentes" value={stats.pending} icon={Clock} tone="text-amber-600" />
                    <MetricCard label="Ativas" value={stats.active} icon={CheckCircle2} tone="text-success" />
                    <MetricCard label="Bloqueadas" value={stats.blocked} icon={Ban} tone="text-danger" />
                    <MetricCard label="Inativas" value={stats.inactive} icon={PauseCircle} tone="text-ink-soft" />
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Empresas
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetricCard label="Total de empresas cadastradas" value={stats.total} icon={Building2} />
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                    Neste sistema cada conta corresponde a uma empresa (1 dono = 1
                    negócio), por isso o número é igual ao total de contas acima.
                </p>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Atividade
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetricCard
                        label="Novos cadastros (últimos 7 dias)"
                        value={stats.newLast7Days}
                        icon={UserPlus}
                        tone="text-pine-800"
                    />
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                    "Contas liberadas" e "contas bloqueadas" recentes vão aparecer
                    aqui com precisão assim que o log administrativo existir (Fase
                    11) — hoje ainda não há histórico registrado de quando cada
                    mudança de status aconteceu, só o status atual de cada conta.
                </p>
            </section>
        </div>
    );
}
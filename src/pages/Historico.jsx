import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Loading";
import { useActivityLogs } from "../hooks/useActivityLogs";
import { getActionMeta, MODULE_OPTIONS } from "../utils/activityMeta";
import { formatDateTime } from "../utils/formatters";

const TONE_BG = {
    success: "bg-success-100 text-success",
    danger: "bg-danger-100 text-danger",
    amber: "bg-amber-100 text-amber-600",
    pine: "bg-pine-900/10 text-pine-800",
    neutral: "bg-paper-dim text-ink-soft",
};

export default function Historico() {
    const { logs, loading, error, hasMore, loadMore } = useActivityLogs();
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("all");

    const filteredLogs = useMemo(() => {
        const term = search.trim().toLowerCase();
        return logs.filter((log) => {
            const meta = getActionMeta(log.action);
            const matchesModule = moduleFilter === "all" || meta.module === moduleFilter;
            const matchesSearch = !term || (log.description || "").toLowerCase().includes(term);
            return matchesModule && matchesSearch;
        });
    }, [logs, search, moduleFilter]);

    const hasNoLogsAtAll = !loading && logs.length === 0;
    const hasNoFilterResults = !loading && logs.length > 0 && filteredLogs.length === 0;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    icon={Search}
                    placeholder="Pesquisar no histórico..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    containerClassName="w-full sm:max-w-sm"
                />
                <div className="w-full sm:w-56">
                    <Select
                        options={MODULE_OPTIONS}
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {hasNoLogsAtAll ? (
                <EmptyState
                    icon={History}
                    title="Nenhuma atividade registrada ainda."
                    description="Assim que você usar o sistema — cadastrar clientes, fazer vendas, criar agendamentos — tudo aparecerá aqui automaticamente."
                />
            ) : (
                <div className="rounded-2xl border border-line bg-surface">
                    {loading ? (
                        <div className="space-y-4 p-5">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-1/3" />
                                        <Skeleton className="h-3 w-1/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : hasNoFilterResults ? (
                        <div className="p-8">
                            <EmptyState
                                icon={Search}
                                title="Nenhum resultado para esse filtro."
                                description="Tente ajustar a pesquisa ou escolher outro módulo."
                            />
                        </div>
                    ) : (
                        <ul className="divide-y divide-line">
                            {filteredLogs.map((log) => {
                                const meta = getActionMeta(log.action);
                                const Icon = meta.icon;
                                return (
                                    <li key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_BG[meta.tone]}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-ink">{log.description}</p>
                                            <p className="text-xs text-ink-soft">
                                                {meta.label} · {formatDateTime(log.createdAt)}
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {!loading && hasMore && !hasNoFilterResults && (
                        <div className="border-t border-line p-4 text-center">
                            <Button variant="outline" size="sm" onClick={loadMore}>
                                Carregar mais
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

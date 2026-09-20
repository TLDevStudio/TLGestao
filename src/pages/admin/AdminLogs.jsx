import { History } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import { Spinner } from "../../components/ui/Loading";
import { useAdminLogs } from "../../hooks/useAdminLogs";
import { formatDateTime } from "../../utils/formatters";

const ACTION_LABELS = {
    account_released: "Acesso liberado",
    account_blocked: "Conta bloqueada",
    account_deactivated: "Conta desativada",
    account_reactivated: "Conta reativada",
    account_deleted: "Conta excluída",
};

const ACTION_TONE = {
    account_released: "text-success",
    account_blocked: "text-danger",
    account_deactivated: "text-ink-soft",
    account_reactivated: "text-success",
    account_deleted: "text-danger",
};

function toDateSafe(value) {
    return value?.toDate ? value.toDate() : null;
}

/** Histórico permanente de ações administrativas — ver Fase 11. */
export default function AdminLogs() {
    const { logs, loading, error } = useAdminLogs();

    if (error) {
        return (
            <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">
                Não foi possível carregar os logs administrativos. Confirme se
                as regras do Firestore da Fase 11 foram publicadas no Firebase
                Console.
            </p>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Spinner size={26} />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="Nenhuma ação administrativa ainda"
                description="Assim que você liberar, bloquear, inativar, reativar ou excluir uma conta, o registro aparece aqui."
            />
        );
    }

    return (
        <div className="space-y-3">
            {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`text-sm font-semibold ${ACTION_TONE[log.action] || "text-ink"}`}>
                            {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="text-xs text-ink-soft">
                            {toDateSafe(log.createdAt) ? formatDateTime(toDateSafe(log.createdAt)) : "—"}
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">{log.description}</p>
                    <p className="mt-2 text-xs text-ink-soft">
                        Administrador: {log.adminEmail || "—"} · Conta: {log.targetName || log.targetBusinessId}
                    </p>
                </div>
            ))}
        </div>
    );
}
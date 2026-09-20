import { useMemo, useState } from "react";
import { Search, Users, CheckCircle2, Ban, PauseCircle, RotateCcw, Trash2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import { TableRowSkeleton } from "../../components/ui/Loading";
import { useDebounce } from "../../hooks/useDebounce";
import { useAdminAccounts } from "../../hooks/useAdminAccounts";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
    ACCOUNT_STATUS,
    ACCOUNT_STATUS_LABELS,
    getAccountStatus,
} from "../../utils/accountStatus";
import { formatDate } from "../../utils/formatters";
import {
    releaseAccount,
    blockAccount,
    deactivateAccount,
    reactivateAccount,
    deleteAccountData,
} from "../../services/adminAccountActionsService";

const STATUS_BADGE_TONE = {
    [ACCOUNT_STATUS.PENDING]: "amber",
    [ACCOUNT_STATUS.ACTIVE]: "success",
    [ACCOUNT_STATUS.BLOCKED]: "danger",
    [ACCOUNT_STATUS.INACTIVE]: "neutral",
};

const STATUS_DOT = {
    [ACCOUNT_STATUS.PENDING]: "🟡",
    [ACCOUNT_STATUS.ACTIVE]: "🟢",
    [ACCOUNT_STATUS.BLOCKED]: "🔴",
    [ACCOUNT_STATUS.INACTIVE]: "⚪",
};

// Mesmos valores usados em Register.jsx — mantidos aqui também porque
// aquele array não é exportado dali.
const BUSINESS_TYPE_LABELS = {
    barbearia: "Barbearia",
    salao: "Salão de beleza",
    oficina: "Oficina",
    loja: "Loja",
    prestador: "Prestador de serviços",
    outro: "Outro",
};

const FILTERS = [
    { value: "all", label: "Todos" },
    { value: ACCOUNT_STATUS.PENDING, label: "Pendentes" },
    { value: ACCOUNT_STATUS.ACTIVE, label: "Ativos" },
    { value: ACCOUNT_STATUS.BLOCKED, label: "Bloqueados" },
    { value: ACCOUNT_STATUS.INACTIVE, label: "Inativos" },
];

function StatusBadge({ business }) {
    const status = getAccountStatus(business);
    return (
        <Badge tone={STATUS_BADGE_TONE[status]}>
            {STATUS_DOT[status]} {ACCOUNT_STATUS_LABELS[status]}
        </Badge>
    );
}

function toDateSafe(value) {
    return value?.toDate ? value.toDate() : null;
}

/**
 * Lista de contas dos clientes do SaaS, com busca, filtro por status e
 * as ações administrativas (liberar/bloquear/inativar/reativar/excluir).
 */
export default function AdminAccounts() {
    const { businesses, loading, error } = useAdminAccounts();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState(null);

    const filtered = useMemo(() => {
        if (!businesses) return [];
        const term = debouncedSearch.trim().toLowerCase();

        return businesses.filter((business) => {
            const matchesStatus =
                statusFilter === "all" || getAccountStatus(business) === statusFilter;
            if (!matchesStatus) return false;
            if (!term) return true;

            return (
                (business.ownerName || "").toLowerCase().includes(term) ||
                (business.businessName || "").toLowerCase().includes(term) ||
                (business.email || "").toLowerCase().includes(term)
            );
        });
    }, [businesses, debouncedSearch, statusFilter]);

    const columns = [
        { key: "name", label: "Nome" },
        { key: "company", label: "Empresa" },
        { key: "email", label: "E-mail" },
        { key: "phone", label: "Telefone" },
        { key: "type", label: "Tipo" },
        { key: "createdAt", label: "Cadastro" },
        { key: "status", label: "Status" },
    ];

    const showEmpty = !loading && filtered.length === 0;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    icon={Search}
                    placeholder="Pesquisar por nome, empresa ou e-mail..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    containerClassName="w-full sm:max-w-sm"
                />
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setStatusFilter(f.value)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === f.value
                                    ? "bg-ink text-white"
                                    : "bg-paper-dim text-ink-soft hover:bg-line"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">
                    Não foi possível carregar as contas. Confirme se as regras do
                    Firestore da Fase 8/11 foram publicadas no Firebase Console.
                </p>
            )}

            <Table
                columns={columns}
                empty={
                    showEmpty && (
                        <div className="p-8">
                            <EmptyState
                                icon={Users}
                                title="Nenhuma conta encontrada"
                                description="Tente outro termo de busca ou outro filtro de status."
                            />
                        </div>
                    )
                }
            >
                {loading &&
                    Array.from({ length: 4 }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={7} />
                    ))}

                {!loading &&
                    filtered.map((business) => (
                        <tr
                            key={business.id}
                            onClick={() => setSelected(business)}
                            className="cursor-pointer hover:bg-paper-dim/60"
                        >
                            <td className="px-4 py-3 font-medium text-ink">{business.ownerName || "—"}</td>
                            <td className="px-4 py-3 text-ink-soft">{business.businessName || "—"}</td>
                            <td className="px-4 py-3 text-ink-soft">{business.email || "—"}</td>
                            <td className="px-4 py-3 text-ink-soft">{business.phone || "—"}</td>
                            <td className="px-4 py-3 text-ink-soft">
                                {BUSINESS_TYPE_LABELS[business.businessType] || business.businessType || "—"}
                            </td>
                            <td className="px-4 py-3 text-ink-soft">
                                {toDateSafe(business.createdAt) ? formatDate(toDateSafe(business.createdAt)) : "—"}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge business={business} />
                            </td>
                        </tr>
                    ))}
            </Table>

            <AccountDetailsModal business={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
            <span className="text-ink-soft">{label}</span>
            <span className="font-medium text-ink">{value || "—"}</span>
        </div>
    );
}

function AccountDetailsModal({ business, onClose }) {
    const { user } = useAuth();
    const toast = useToast();
    const [busy, setBusy] = useState(false);
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    if (!business) return null;

    const status = getAccountStatus(business);
    const adminEmail = user?.email;

    const runAction = async (actionFn, successMessage) => {
        setBusy(true);
        try {
            await actionFn();
            toast.success(successMessage);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível concluir a ação. Tente novamente.");
        } finally {
            setBusy(false);
        }
    };

    const handleRelease = () => {
        if (!window.confirm("Deseja liberar o acesso desta conta?")) return;
        runAction(() => releaseAccount(business, adminEmail), "Acesso liberado.");
    };

    const handleDeactivate = () => {
        if (!window.confirm("Deseja tornar esta conta inativa?")) return;
        runAction(() => deactivateAccount(business, adminEmail), "Conta desativada.");
    };

    const handleReactivate = () => {
        if (!window.confirm("Deseja reativar esta conta?")) return;
        runAction(() => reactivateAccount(business, adminEmail), "Conta reativada.");
    };

    const handleConfirmBlock = () => {
        runAction(
            () => blockAccount(business, blockReason.trim(), adminEmail),
            "Conta bloqueada."
        );
        setBlockModalOpen(false);
        setBlockReason("");
    };

    return (
        <>
            <Modal open={!!business} onClose={onClose} title="Detalhes da conta" size="lg">
                <div className="space-y-5">
                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                            Usuário
                        </h3>
                        <DetailRow label="Nome" value={business.ownerName} />
                        <DetailRow label="E-mail" value={business.email} />
                        <DetailRow label="Telefone" value={business.phone} />
                        <DetailRow
                            label="Data de cadastro"
                            value={toDateSafe(business.createdAt) ? formatDate(toDateSafe(business.createdAt)) : "—"}
                        />
                    </section>

                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                            Empresa
                        </h3>
                        <DetailRow label="Nome da empresa" value={business.businessName} />
                        <DetailRow
                            label="Tipo de negócio"
                            value={BUSINESS_TYPE_LABELS[business.businessType] || business.businessType}
                        />
                        <DetailRow label="CNPJ" value={business.cnpj} />
                        <DetailRow label="WhatsApp" value={business.whatsapp} />
                        <DetailRow label="Endereço" value={business.address} />
                    </section>

                    <section>
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                            Conta
                        </h3>
                        <div className="flex items-center justify-between border-b border-line py-2 text-sm">
                            <span className="text-ink-soft">Status</span>
                            <StatusBadge business={business} />
                        </div>
                        <DetailRow
                            label="Última atualização"
                            value={toDateSafe(business.updatedAt) ? formatDate(toDateSafe(business.updatedAt)) : "—"}
                        />
                        <DetailRow label="Último acesso" value="—" />
                    </section>

                    <section>
                        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                            Ações
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {status === ACCOUNT_STATUS.PENDING && (
                                <Button icon={CheckCircle2} loading={busy} onClick={handleRelease}>
                                    Liberar acesso
                                </Button>
                            )}

                            {status === ACCOUNT_STATUS.ACTIVE && (
                                <Button
                                    variant="danger"
                                    icon={Ban}
                                    loading={busy}
                                    onClick={() => setBlockModalOpen(true)}
                                >
                                    Bloquear
                                </Button>
                            )}

                            {(status === ACCOUNT_STATUS.ACTIVE || status === ACCOUNT_STATUS.PENDING) && (
                                <Button
                                    variant="outline"
                                    icon={PauseCircle}
                                    loading={busy}
                                    onClick={handleDeactivate}
                                >
                                    Tornar inativa
                                </Button>
                            )}

                            {(status === ACCOUNT_STATUS.BLOCKED || status === ACCOUNT_STATUS.INACTIVE) && (
                                <Button icon={RotateCcw} loading={busy} onClick={handleReactivate}>
                                    Reativar conta
                                </Button>
                            )}

                            <Button
                                variant="danger"
                                icon={Trash2}
                                loading={busy}
                                onClick={() => setDeleteModalOpen(true)}
                            >
                                Excluir conta
                            </Button>
                        </div>
                    </section>
                </div>
            </Modal>

            <BlockReasonModal
                open={blockModalOpen}
                reason={blockReason}
                onChangeReason={setBlockReason}
                onCancel={() => setBlockModalOpen(false)}
                onConfirm={handleConfirmBlock}
                busy={busy}
            />

            <DeleteAccountModal
                open={deleteModalOpen}
                business={business}
                adminEmail={adminEmail}
                onCancel={() => setDeleteModalOpen(false)}
                onDeleted={onClose}
            />
        </>
    );
}

function BlockReasonModal({ open, reason, onChangeReason, onCancel, onConfirm, busy }) {
    return (
        <Modal open={open} onClose={onCancel} title="Bloquear conta">
            <div className="space-y-4">
                <p className="text-sm text-ink-soft">Deseja realmente bloquear esta conta?</p>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-ink">Motivo do bloqueio (opcional)</label>
                    <textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => onChangeReason(e.target.value)}
                        placeholder="Ex: mensalidade em atraso"
                        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 transition focus:border-pine-700 focus:outline-none focus:ring-2 focus:ring-pine-700/20"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button variant="danger" loading={busy} onClick={onConfirm}>
                        Bloquear conta
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

function DeleteAccountModal({ open, business, adminEmail, onCancel, onDeleted }) {
    const toast = useToast();
    const [confirmText, setConfirmText] = useState("");
    const [busy, setBusy] = useState(false);
    const [deletedUid, setDeletedUid] = useState(null);

    if (!business) return null;

    const canConfirm = confirmText.trim() === "EXCLUIR";

    const handleDelete = async () => {
        setBusy(true);
        try {
            const uid = await deleteAccountData(business, adminEmail);
            setDeletedUid(uid);
            toast.success("Dados da conta excluídos do Firestore.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível excluir a conta. Tente novamente.");
        } finally {
            setBusy(false);
        }
    };

    const handleClose = () => {
        setConfirmText("");
        setDeletedUid(null);
        if (deletedUid) onDeleted();
        else onCancel();
    };

    return (
        <Modal open={open} onClose={handleClose} title="Excluir conta">
            {deletedUid ? (
                <div className="space-y-4">
                    <p className="text-sm text-ink">
                        Os dados desta conta foram excluídos do Firestore com sucesso.
                    </p>
                    <div className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-700">
                        <p className="font-medium">Falta um passo manual</p>
                        <p className="mt-1 text-xs leading-relaxed">
                            Por segurança, este app não consegue excluir a conta do
                            Firebase Authentication direto pelo navegador (isso exige
                            um backend com Admin SDK, que este projeto ainda não usa).
                            Abra o Firebase Console → Authentication → procure pelo
                            UID abaixo → exclua manualmente.
                        </p>
                        <p className="mt-2 select-all rounded bg-white/60 px-2 py-1 font-mono text-xs">
                            {deletedUid}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleClose}>Entendi</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-ink">Excluir esta conta?</p>
                    <p className="text-sm text-ink-soft">
                        Esta ação removerá permanentemente o acesso do cliente e os
                        dados associados à conta (clientes, serviços, produtos,
                        agendamentos, vendas, financeiro e histórico). Não pode ser
                        desfeita.
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink">
                            Digite <span className="font-mono">EXCLUIR</span> para confirmar
                        </label>
                        <input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                        <Button
                            variant="danger"
                            disabled={!canConfirm}
                            loading={busy}
                            onClick={handleDelete}
                        >
                            Excluir permanentemente
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
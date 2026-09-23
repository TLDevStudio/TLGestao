import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Lock,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { TableRowSkeleton } from "../components/ui/Loading";
import TransactionFormModal from "../components/finance/TransactionFormModal";
import { useTransactions } from "../hooks/useTransactions";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { deleteTransaction, TRANSACTION_STATUS } from "../services/transactionService";
import useIsDemoAccount from "../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../utils/demoGuard";
import { PAYMENT_METHODS } from "../services/saleService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { PERIOD_OPTIONS } from "../utils/periodHelpers";
import { toDateInputValue } from "../utils/dateHelpers";

const COLUMNS = [
    { key: "date", label: "Data" },
    { key: "description", label: "Descrição" },
    { key: "category", label: "Categoria" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Valor", className: "text-right" },
    { key: "actions", label: "", className: "text-right" },
];

const TYPE_OPTIONS = [
    { value: "all", label: "Receitas e despesas" },
    { value: "income", label: "Somente receitas" },
    { value: "expense", label: "Somente despesas" },
];

export default function Financeiro() {
    const { user } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();

    const [period, setPeriod] = useState("month");
    const [customStart, setCustomStart] = useState(toDateInputValue(new Date()));
    const [customEnd, setCustomEnd] = useState(toDateInputValue(new Date()));
    const [typeFilter, setTypeFilter] = useState("all");

    const { transactions, allCount, totals, expensesByCategory, loading, error } = useTransactions({
        period,
        customStart,
        customEnd,
        typeFilter,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            setToDelete(null);
            return;
        }
        setDeleting(true);
        try {
            await deleteTransaction(user.uid, toDelete.id, toDelete.description);
            toast.success("Lançamento excluído.");
            setToDelete(null);
        } catch {
            toast.error("Não foi possível excluir o lançamento.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="financeiro-page space-y-5">
            {/* Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="w-full sm:w-44">
                        <label className="mb-1.5 block text-sm font-medium text-ink">Período</label>
                        <Select
                            options={PERIOD_OPTIONS}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>

                    {period === "custom" && (
                        <>
                            <Input
                                type="date"
                                label="De"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                containerClassName="w-full sm:w-40"
                            />
                            <Input
                                type="date"
                                label="Até"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                containerClassName="w-full sm:w-40"
                            />
                        </>
                    )}

                    <div className="w-full sm:w-52">
                        <label className="mb-1.5 block text-sm font-medium text-ink">Exibir</label>
                        <Select
                            options={TYPE_OPTIONS}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        />
                    </div>
                </div>

                <Button icon={Plus} onClick={openCreate} className="btn-fx btn-pineshrink-0">
                    Novo lançamento
                </Button>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {/* Resumo */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <SummaryCard
                    label="Receitas"
                    value={totals.income}
                    icon={ArrowUpCircle}
                    tone="text-success"
                />
                <SummaryCard
                    label="Despesas"
                    value={totals.expense}
                    icon={ArrowDownCircle}
                    tone="text-danger"
                />
                <SummaryCard
                    label="Saldo"
                    value={totals.balance}
                    icon={Wallet}
                    tone={totals.balance >= 0 ? "text-ink" : "text-danger"}
                />
                <SummaryCard
                    label="Margem"
                    value={null}
                    customValue={
                        totals.income > 0
                            ? `${((totals.balance / totals.income) * 100).toFixed(1)}%`
                            : "—"
                    }
                    icon={TrendingUp}
                    tone="text-ink"
                />
            </div>

            {/* Despesas por categoria */}
            {expensesByCategory.length > 0 && (
                <div className="rounded-2xl border border-line bg-surface p-5">
                    <h3 className="mb-3 font-display text-base font-semibold text-ink">
                        Despesas por categoria
                    </h3>
                    <div className="space-y-2.5">
                        {expensesByCategory.map(({ category, amount }) => {
                            const percent = totals.expense > 0 ? (amount / totals.expense) * 100 : 0;
                            return (
                                <div key={category}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="text-ink">{category}</span>
                                        <span className="text-ink-soft">
                                            {formatCurrency(amount)} · {percent.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-paper-dim">
                                        <div className="h-full rounded-full bg-pine-700" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Lançamentos */}
            {!loading && allCount === 0 ? (
                <EmptyState
                    icon={Wallet}
                    title="Nenhum lançamento neste período."
                    description="Registre despesas manualmente. As receitas das vendas entram aqui automaticamente."
                    action={
                        <Button className="btn-fx btn-pine rounded-xl w-full sm:w-auto sm:shrink-0" icon={Plus} onClick={openCreate}>
                            Registrar lançamento
                        </Button>
                    }
                />
            ) : (
                <Table columns={COLUMNS}>
                    {loading &&
                        Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} columns={6} />)}

                    {!loading &&
                        transactions.map((t) => {
                            const isIncome = t.type === "income";
                            const fromSale = !!t.saleId;
                            return (
                                <tr key={t.id} className="hover:bg-paper-dim/50">
                                    <td className="px-4 py-3 text-ink-soft">{formatDate(t.date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-ink">{t.description}</span>
                                            {fromSale && (
                                                <span title="Gerado automaticamente por uma venda">
                                                    <Lock size={12} className="text-ink-soft" />
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-ink-soft">
                                            {PAYMENT_METHODS[t.paymentMethod] || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-ink-soft">{t.category}</td>
                                    <td className="px-4 py-3">
                                        <Badge tone={t.status === "paid" ? "success" : "amber"}>
                                            {TRANSACTION_STATUS[t.status] || "—"}
                                        </Badge>
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-medium ${isIncome ? "text-success" : "text-danger"
                                            }`}
                                    >
                                        {isIncome ? "+" : "−"} {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditing(t);
                                                    setModalOpen(true);
                                                }}
                                                className="rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
                                                aria-label="Editar lançamento"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => setToDelete(t)}
                                                className="rounded-lg p-2 text-ink-soft hover:bg-danger-100 hover:text-danger"
                                                aria-label="Excluir lançamento"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                </Table>
            )}

            <TransactionFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                transaction={editing}
            />

            <ConfirmDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Excluir lançamento"
                description={
                    toDelete?.saleId
                        ? `"${toDelete?.description}" foi gerado automaticamente por uma venda. Excluir aqui não desfaz a venda nem devolve o estoque.`
                        : `Tem certeza que deseja excluir "${toDelete?.description}"?`
                }
                confirmLabel="Excluir"
            />
        </div>
    );
}

function SummaryCard({ label, value, customValue, icon: Icon, tone }) {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
                <p className="text-sm text-ink-soft">{label}</p>
                <Icon size={16} className={tone} />
            </div>
            <p className={`mt-2 font-display text-xl font-semibold sm:text-2xl ${tone}`}>
                {customValue ?? formatCurrency(value)}
            </p>
        </div>
    );
}

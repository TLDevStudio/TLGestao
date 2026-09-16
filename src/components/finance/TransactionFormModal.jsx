import { useEffect, useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, FileText, DollarSign, Calendar } from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { maskCurrency, parseCurrencyInput } from "../../utils/masks";
import { toDateInputValue } from "../../utils/dateHelpers";
import {
    createTransaction,
    updateTransaction,
    INCOME_CATEGORIES,
    EXPENSE_CATEGORIES,
    TRANSACTION_STATUS,
} from "../../services/transactionService";
import { PAYMENT_METHODS } from "../../services/saleService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const PAYMENT_OPTIONS = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(TRANSACTION_STATUS).map(([value, label]) => ({ value, label }));

const emptyForm = {
    type: "expense",
    category: "",
    description: "",
    amountDisplay: "",
    date: toDateInputValue(new Date()),
    paymentMethod: "cash",
    status: "paid",
    notes: "",
};

export default function TransactionFormModal({ open, onClose, transaction }) {
    const { user } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEditing = !!transaction;

    useEffect(() => {
        if (!open) return;
        if (transaction) {
            setForm({
                type: transaction.type,
                category: transaction.category || "",
                description: transaction.description || "",
                amountDisplay: transaction.amount
                    ? transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : "",
                date: transaction.dateObj ? toDateInputValue(transaction.dateObj) : emptyForm.date,
                paymentMethod: transaction.paymentMethod || "cash",
                status: transaction.status || "paid",
                notes: transaction.notes || "",
            });
        } else {
            setForm(emptyForm);
        }
        setError("");
    }, [open, transaction]);

    const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const categoryOptions = categories.map((c) => ({ value: c, label: c }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "amountDisplay") {
            setForm((f) => ({ ...f, amountDisplay: maskCurrency(value) }));
            return;
        }
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleTypeChange = (type) => {
        // Ao trocar o tipo, limpa a categoria (as listas são diferentes).
        setForm((f) => ({ ...f, type, category: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.description.trim()) return setError("Informe uma descrição.");
        if (!form.category) return setError("Selecione uma categoria.");

        const amount = parseCurrencyInput(form.amountDisplay || "0");
        if (amount <= 0) return setError("Informe um valor maior que zero.");

        const payload = {
            ...form,
            amount,
            date: new Date(`${form.date}T12:00:00`),
        };

        setSaving(true);
        try {
            if (isEditing) {
                await updateTransaction(user.uid, transaction.id, payload);
                toast.success("Lançamento atualizado.");
            } else {
                await createTransaction(user.uid, payload);
                toast.success("Lançamento registrado.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar o lançamento. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar lançamento" : "Novo lançamento"}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? "Salvar alterações" : "Registrar"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleTypeChange("income")}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${form.type === "income"
                                ? "border-success bg-success-100 text-success"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }`}
                    >
                        <ArrowUpCircle size={16} /> Receita
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTypeChange("expense")}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${form.type === "expense"
                                ? "border-danger bg-danger-100 text-danger"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }`}
                    >
                        <ArrowDownCircle size={16} /> Despesa
                    </button>
                </div>

                <Input
                    id="description"
                    name="description"
                    label="Descrição"
                    icon={FileText}
                    placeholder={form.type === "income" ? "Ex: Serviço avulso" : "Ex: Conta de energia"}
                    value={form.description}
                    onChange={handleChange}
                    autoFocus
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="category" className="text-sm font-medium text-ink">
                        Categoria
                    </label>
                    <Select
                        id="category"
                        name="category"
                        placeholder="Selecione uma categoria"
                        options={categoryOptions}
                        value={form.category}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="amountDisplay"
                        name="amountDisplay"
                        label="Valor"
                        icon={DollarSign}
                        placeholder="0,00"
                        inputMode="numeric"
                        value={form.amountDisplay}
                        onChange={handleChange}
                    />
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        label="Data"
                        icon={Calendar}
                        value={form.date}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="paymentMethod" className="text-sm font-medium text-ink">
                            Forma de pagamento
                        </label>
                        <Select
                            id="paymentMethod"
                            name="paymentMethod"
                            options={PAYMENT_OPTIONS}
                            value={form.paymentMethod}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="status" className="text-sm font-medium text-ink">
                            Status
                        </label>
                        <Select
                            id="status"
                            name="status"
                            options={STATUS_OPTIONS}
                            value={form.status}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-ink">
                        Observação (opcional)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        value={form.notes}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 transition focus:outline-none focus:ring-2 focus:ring-pine-700/20 focus:border-pine-700"
                    />
                </div>

                {error && (
                    <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
                )}
            </form>
        </Modal>
    );
}

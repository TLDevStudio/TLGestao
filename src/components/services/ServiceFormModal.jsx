import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Switch from "../ui/Switch";
import { Scissors, Tag, DollarSign, Clock, FileText } from "lucide-react";
import { maskCurrency, parseCurrencyInput } from "../../utils/masks";
import { createService, updateService } from "../../services/serviceService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const emptyForm = {
    name: "",
    category: "",
    description: "",
    priceDisplay: "",
    duration: "30",
    active: true,
};

export default function ServiceFormModal({ open, onClose, service }) {
    const { user } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEditing = !!service;

    useEffect(() => {
        if (open) {
            setForm(
                service
                    ? {
                        ...emptyForm,
                        ...service,
                        priceDisplay: service.price
                            ? service.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "",
                        duration: String(service.duration ?? 30),
                    }
                    : emptyForm
            );
            setError("");
        }
    }, [open, service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "priceDisplay") {
            setForm((f) => ({ ...f, priceDisplay: maskCurrency(value) }));
            return;
        }
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("O nome do serviço é obrigatório.");
            return;
        }

        const payload = {
            ...form,
            price: parseCurrencyInput(form.priceDisplay || "0"),
            duration: Number(form.duration) || 30,
        };

        setSaving(true);
        try {
            if (isEditing) {
                await updateService(user.uid, service.id, payload);
                toast.success("Serviço atualizado com sucesso.");
            } else {
                await createService(user.uid, payload);
                toast.success("Serviço cadastrado com sucesso.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar o serviço. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar serviço" : "Novo serviço"}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? "Salvar alterações" : "Cadastrar serviço"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="name"
                    name="name"
                    label="Nome do serviço"
                    icon={Scissors}
                    placeholder="Digite o nome do serviço"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                />

                <Input
                    id="category"
                    name="category"
                    label="Categoria"
                    icon={Tag}
                    placeholder="Digite a categoria do serviço"
                    value={form.category}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="priceDisplay"
                        name="priceDisplay"
                        label="Preço"
                        icon={DollarSign}
                        placeholder="0,00"
                        inputMode="numeric"
                        value={form.priceDisplay}
                        onChange={handleChange}
                    />
                    <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="5"
                        step="5"
                        label="Duração (minutos)"
                        icon={Clock}
                        placeholder="30"
                        value={form.duration}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <FileText size={14} /> Descrição (opcional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={2}
                        placeholder="Detalhes sobre o serviço..."
                        value={form.description}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 transition focus:outline-none focus:ring-2 focus:ring-pine-700/20 focus:border-pine-700"
                    />
                </div>

                <Switch
                    checked={form.active}
                    onChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
                    label={form.active ? "Serviço ativo" : "Serviço inativo"}
                />

                {error && (
                    <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
                )}
            </form>
        </Modal>
    );
}

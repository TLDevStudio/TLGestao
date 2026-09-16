import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { User, Phone, MessageCircle, Mail, IdCard, Cake, MapPin, FileText } from "lucide-react";
import { maskPhone, maskCPF } from "../../utils/masks";
import { createClient, updateClient } from "../../services/clientService";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const emptyForm = {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    cpf: "",
    birthDate: "",
    address: "",
    notes: "",
};

export default function ClientFormModal({ open, onClose, client }) {
    const { user } = useAuth();
    const toast = useToast();
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEditing = !!client;

    useEffect(() => {
        if (open) {
            setForm(client ? { ...emptyForm, ...client } : emptyForm);
            setError("");
        }
    }, [open, client]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === "phone" || name === "whatsapp") finalValue = maskPhone(value);
        if (name === "cpf") finalValue = maskCPF(value);
        setForm((f) => ({ ...f, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("O nome do cliente é obrigatório.");
            return;
        }

        setSaving(true);
        try {
            if (isEditing) {
                await updateClient(user.uid, client.id, form);
                toast.success("Cliente atualizado com sucesso.");
            } else {
                await createClient(user.uid, form);
                toast.success("Cliente cadastrado com sucesso.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar o cliente. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar cliente" : "Novo cliente"}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? "Salvar alterações" : "Cadastrar cliente"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="name"
                    name="name"
                    label="Nome"
                    icon={User}
                    placeholder="Nome completo"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="phone"
                        name="phone"
                        label="Telefone"
                        icon={Phone}
                        placeholder="(21) 90000-0000"
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={15}
                    />
                    <Input
                        id="whatsapp"
                        name="whatsapp"
                        label="WhatsApp"
                        icon={MessageCircle}
                        placeholder="(21) 90000-0000"
                        value={form.whatsapp}
                        onChange={handleChange}
                        maxLength={15}
                    />
                </div>

                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="E-mail"
                    icon={Mail}
                    placeholder="cliente@email.com"
                    value={form.email}
                    onChange={handleChange}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        id="cpf"
                        name="cpf"
                        label="CPF (opcional)"
                        icon={IdCard}
                        placeholder="000.000.000-00"
                        value={form.cpf}
                        onChange={handleChange}
                        maxLength={14}
                    />
                    <Input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        label="Data de nascimento (opcional)"
                        icon={Cake}
                        value={form.birthDate}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    id="address"
                    name="address"
                    label="Endereço (opcional)"
                    icon={MapPin}
                    placeholder="Rua, número, bairro"
                    value={form.address}
                    onChange={handleChange}
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <FileText size={14} /> Observações
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Observações gerais..."
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
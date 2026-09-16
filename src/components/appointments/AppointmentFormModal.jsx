import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { User, Scissors, Calendar, Clock, UserCog, FileText } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import { useServices } from "../../hooks/useServices";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
    createAppointment,
    updateAppointment,
    APPOINTMENT_STATUS,
    updateAppointmentStatus,
} from "../../services/appointmentService";
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from "../../utils/dateHelpers";

const emptyForm = {
    clientId: "",
    serviceId: "",
    date: toDateInputValue(new Date()),
    time: "09:00",
    duration: "30",
    professional: "",
    notes: "",
};

export default function AppointmentFormModal({ open, onClose, appointment, defaultDate }) {
    const { user } = useAuth();
    const toast = useToast();
    const { clients } = useClients();
    const { services } = useServices({ status: "active" });

    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const isEditing = !!appointment;

    useEffect(() => {
        if (!open) return;
        if (appointment) {
            setForm({
                clientId: appointment.clientId,
                serviceId: appointment.serviceId,
                date: toDateInputValue(appointment.dateObj),
                time: toTimeInputValue(appointment.dateObj),
                duration: String(appointment.duration ?? 30),
                professional: appointment.professional || "",
                notes: appointment.notes || "",
            });
        } else {
            setForm({
                ...emptyForm,
                date: defaultDate ? toDateInputValue(defaultDate) : toDateInputValue(new Date()),
            });
        }
        setError("");
    }, [open, appointment, defaultDate]);

    const clientOptions = useMemo(
        () => clients.map((c) => ({ value: c.id, label: c.name })),
        [clients]
    );
    const serviceOptions = useMemo(
        () => services.map((s) => ({ value: s.id, label: `${s.name} (${s.duration} min)` })),
        [services]
    );

    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const service = services.find((s) => s.id === serviceId);
        setForm((f) => ({
            ...f,
            serviceId,
            duration: service ? String(service.duration) : f.duration,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleStatusChange = async (newStatus) => {
        if (!appointment) return;
        try {
            await updateAppointmentStatus(user.uid, appointment, newStatus);
            toast.success("Status atualizado.");
        } catch {
            toast.error("Não foi possível atualizar o status.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.clientId) return setError("Selecione um cliente.");
        if (!form.serviceId) return setError("Selecione um serviço.");
        if (!form.date || !form.time) return setError("Informe a data e o horário.");

        const client = clients.find((c) => c.id === form.clientId);
        const service = services.find((s) => s.id === form.serviceId);

        const payload = {
            clientId: form.clientId,
            clientName: client?.name || "",
            serviceId: form.serviceId,
            serviceName: service?.name || "",
            date: combineDateAndTime(form.date, form.time),
            duration: form.duration,
            professional: form.professional,
            notes: form.notes,
        };

        setSaving(true);
        try {
            if (isEditing) {
                await updateAppointment(user.uid, appointment.id, payload);
                toast.success("Agendamento atualizado.");
            } else {
                await createAppointment(user.uid, payload);
                toast.success("Agendamento criado.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar o agendamento. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Editar agendamento" : "Novo agendamento"}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} loading={saving}>
                        {isEditing ? "Salvar alterações" : "Criar agendamento"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {isEditing && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(APPOINTMENT_STATUS).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleStatusChange(value)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${appointment.status === value
                                            ? "border-pine-800 bg-pine-900 text-white"
                                            : "border-line text-ink-soft hover:bg-paper-dim"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="clientId" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <User size={14} /> Cliente
                    </label>
                    <Select
                        id="clientId"
                        name="clientId"
                        placeholder="Selecione um cliente"
                        options={clientOptions}
                        value={form.clientId}
                        onChange={handleChange}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="serviceId" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <Scissors size={14} /> Serviço
                    </label>
                    <Select
                        id="serviceId"
                        name="serviceId"
                        placeholder="Selecione um serviço"
                        options={serviceOptions}
                        value={form.serviceId}
                        onChange={handleServiceChange}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        label="Data"
                        icon={Calendar}
                        value={form.date}
                        onChange={handleChange}
                    />
                    <Input
                        id="time"
                        name="time"
                        type="time"
                        label="Horário"
                        icon={Clock}
                        value={form.time}
                        onChange={handleChange}
                    />
                    <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min="5"
                        step="5"
                        label="Duração (min)"
                        value={form.duration}
                        onChange={handleChange}
                    />
                </div>

                <Input
                    id="professional"
                    name="professional"
                    label="Profissional (opcional)"
                    icon={UserCog}
                    placeholder="Quem vai atender"
                    value={form.professional}
                    onChange={handleChange}
                />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes" className="text-sm font-medium text-ink flex items-center gap-1.5">
                        <FileText size={14} /> Observação
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        placeholder="Observações sobre o atendimento..."
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

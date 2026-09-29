import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import { useCustomerBookings } from "../../hooks/useCustomerBookings";
import { cancelOnlineAppointment } from "../../services/customerBookingService";
import { Spinner } from "../../components/ui/Loading";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../contexts/ToastContext";

const STATUS_LABELS = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    in_progress: "Em atendimento",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
};

const STATUS_STYLES = {
    scheduled: "bg-pine-900/10 text-pine-900",
    confirmed: "bg-pine-900/10 text-pine-900",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-paper-dim text-ink-soft",
    cancelled: "bg-danger-100 text-danger",
    no_show: "bg-danger-100 text-danger",
};

function AppointmentCard({ appointment, onCancelClick, faded }) {
    const canCancel = ["scheduled", "confirmed"].includes(appointment.status) && appointment.source === "online";

    return (
        <li className={`rounded-xl border border-line bg-surface px-4 py-3 ${faded ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-ink">{appointment.serviceName}</p>
                    <p className="text-xs text-ink-soft">
                        {appointment.date?.toDate().toLocaleDateString("pt-BR")} às{" "}
                        {appointment.date?.toDate().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[appointment.status] || "bg-paper-dim text-ink-soft"}`}>
                    {STATUS_LABELS[appointment.status] || appointment.status}
                </span>
            </div>

            {canCancel && (
                <button
                    onClick={() => onCancelClick(appointment)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-danger hover:underline"
                >
                    <CalendarX2 size={14} /> Cancelar agendamento
                </button>
            )}
        </li>
    );
}

export default function CustomerAppointments() {
    const { upcoming, history, loading } = useCustomerBookings();
    const toast = useToast();
    const [toCancel, setToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    async function handleConfirmCancel() {
        if (!toCancel) return;
        setCancelling(true);
        try {
            await cancelOnlineAppointment(toCancel.id);
            toast.success("Agendamento cancelado.");
            setToCancel(null);
        } catch (err) {
            toast.error(err.message || "Não foi possível cancelar o agendamento.");
        } finally {
            setCancelling(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section>
                <h1 className="font-display text-xl font-semibold text-ink">Próximos agendamentos</h1>
                {upcoming.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">Você não tem agendamentos futuros.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {upcoming.map((a) => (
                            <AppointmentCard key={a.id} appointment={a} onCancelClick={setToCancel} />
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="font-display text-base font-semibold text-ink">Histórico</h2>
                {history.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-soft">Nenhum agendamento no histórico ainda.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {history.map((a) => (
                            <AppointmentCard key={a.id} appointment={a} onCancelClick={setToCancel} faded />
                        ))}
                    </ul>
                )}
            </section>

            <ConfirmDialog
                open={!!toCancel}
                onClose={() => setToCancel(null)}
                onConfirm={handleConfirmCancel}
                title="Cancelar agendamento"
                description={
                    toCancel
                        ? `Tem certeza que deseja cancelar o agendamento de "${toCancel.serviceName}"? Essa ação não pode ser desfeita.`
                        : ""
                }
                confirmLabel="Cancelar agendamento"
                loading={cancelling}
            />
        </div>
    );
}
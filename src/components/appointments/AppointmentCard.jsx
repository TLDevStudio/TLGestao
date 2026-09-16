import { User, Scissors, Pencil, Trash2 } from "lucide-react";
import Badge from "../ui/Badge";
import { APPOINTMENT_STATUS } from "../../services/appointmentService";
import { formatTime } from "../../utils/dateHelpers";

const STATUS_TONE = {
    scheduled: "neutral",
    confirmed: "pine",
    in_progress: "amber",
    completed: "success",
    cancelled: "danger",
    no_show: "danger",
};

export function statusTone(status) {
    return STATUS_TONE[status] || "neutral";
}

export default function AppointmentCard({ appointment, onEdit, onDelete, compact = false }) {
    if (compact) {
        return (
            <button
                onClick={onEdit}
                className="w-full rounded-lg border border-line bg-surface px-2 py-1.5 text-left text-xs hover:border-pine-700 hover:shadow-sm"
            >
                <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-ink">{formatTime(appointment.dateObj)}</span>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(appointment.status)}`} />
                </div>
                <p className="truncate text-ink-soft">{appointment.clientName}</p>
            </button>
        );
    }

    return (
        <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-4">
            <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-paper-dim py-2 text-center">
                <span className="font-display text-base font-semibold text-ink">
                    {formatTime(appointment.dateObj)}
                </span>
                <span className="text-[11px] text-ink-soft">{appointment.duration} min</span>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 font-medium text-ink">
                        <User size={14} className="text-ink-soft" /> {appointment.clientName}
                    </p>
                    <Badge tone={statusTone(appointment.status)}>{APPOINTMENT_STATUS[appointment.status]}</Badge>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-ink-soft">
                    <Scissors size={13} /> {appointment.serviceName}
                    {appointment.professional && ` · ${appointment.professional}`}
                </p>
                {appointment.notes && (
                    <p className="text-xs text-ink-soft italic">"{appointment.notes}"</p>
                )}
            </div>

            <div className="flex shrink-0 gap-1">
                <button
                    onClick={onEdit}
                    className="rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
                    aria-label="Editar agendamento"
                >
                    <Pencil size={15} />
                </button>
                <button
                    onClick={onDelete}
                    className="rounded-lg p-2 text-ink-soft hover:bg-danger-100 hover:text-danger"
                    aria-label="Excluir agendamento"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

function dotColor(status) {
    const map = {
        scheduled: "bg-ink-soft",
        confirmed: "bg-pine-700",
        in_progress: "bg-amber-500",
        completed: "bg-success",
        cancelled: "bg-danger",
        no_show: "bg-danger",
    };
    return map[status] || "bg-ink-soft";
}

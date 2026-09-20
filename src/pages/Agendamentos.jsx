import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarClock } from "lucide-react";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { Spinner } from "../components/ui/Loading";
import AppointmentFormModal from "../components/appointments/AppointmentFormModal";
import AppointmentCard, { statusTone } from "../components/appointments/AppointmentCard";
import { useAppointments, useCalendarNavigation } from "../hooks/useAppointments";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { deleteAppointment } from "../services/appointmentService";
import useIsDemoAccount from "../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../utils/demoGuard";
import {
    formatHeaderLabel,
    formatWeekdayShort,
    formatDayNumber,
    isSameDay,
    isSameMonth,
} from "../utils/dateHelpers";

const VIEW_OPTIONS = [
    { value: "day", label: "Dia" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mês" },
];

export default function Agendamentos() {
    const { user } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();
    const { view, setView, referenceDate, goToday, goNext, goPrev, goToDate } =
        useCalendarNavigation("day");
    const { appointments, days, loading, error } = useAppointments(view, referenceDate);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [defaultDate, setDefaultDate] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const openCreateModal = (date) => {
        setEditingAppointment(null);
        setDefaultDate(date || referenceDate);
        setModalOpen(true);
    };

    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
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
            await deleteAppointment(user.uid, toDelete.id, toDelete.clientName);
            toast.success("Agendamento excluído.");
            setToDelete(null);
        } catch {
            toast.error("Não foi possível excluir o agendamento.");
        } finally {
            setDeleting(false);
        }
    };

    const appointmentsForDay = (day) =>
        appointments
            .filter((a) => a.dateObj && isSameDay(a.dateObj, day))
            .sort((a, b) => a.dateObj - b.dateObj);

    return (
        <div className="space-y-5">
            {/* Controles */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goPrev}
                        className="rounded-lg border border-line bg-surface p-2 text-ink-soft hover:bg-paper-dim"
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={goNext}
                        className="rounded-lg border border-line bg-surface p-2 text-ink-soft hover:bg-paper-dim"
                        aria-label="Próximo"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <Button variant="outline" size="sm" onClick={goToday}>
                        Hoje
                    </Button>
                    <h2 className="ml-2 font-display text-base font-semibold capitalize text-ink sm:text-lg">
                        {formatHeaderLabel(view, referenceDate)}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-xl border border-line bg-surface p-1">
                        {VIEW_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setView(opt.value)}
                                className={`btn-fx btn-pine rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === opt.value ? "bg-pine-900 text-white" : "text-ink-soft hover:bg-paper-dim"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <Button icon={Plus} onClick={() => openCreateModal()} className="btn-fx btn-pine rounded-xl">
                        Novo agendamento
                    </Button>
                </div>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size={28} />
                </div>
            ) : (
                <>
                    {view === "day" && (
                        <DayView
                            day={referenceDate}
                            appointments={appointmentsForDay(referenceDate)}
                            onEdit={openEditModal}
                            onDelete={setToDelete}
                            onCreate={() => openCreateModal(referenceDate)}
                        />
                    )}

                    {view === "week" && (
                        <WeekView
                            days={days}
                            appointmentsForDay={appointmentsForDay}
                            onSelectDay={(day) => {
                                goToDate(day);
                                setView("day");
                            }}
                            onEdit={openEditModal}
                        />
                    )}

                    {view === "month" && (
                        <MonthView
                            days={days}
                            referenceDate={referenceDate}
                            appointmentsForDay={appointmentsForDay}
                            onSelectDay={(day) => {
                                goToDate(day);
                                setView("day");
                            }}
                        />
                    )}
                </>
            )}

            <AppointmentFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                appointment={editingAppointment}
                defaultDate={defaultDate}
            />

            <ConfirmDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Excluir agendamento"
                description={`Tem certeza que deseja excluir o agendamento de "${toDelete?.clientName}"?`}
                confirmLabel="Excluir"
            />
        </div>
    );
}

function DayView({ day, appointments, onEdit, onDelete, onCreate }) {
    if (appointments.length === 0) {
        return (
            <EmptyState
                icon={CalendarClock}
                title="Nenhum agendamento para este dia."
                description="Que tal criar o primeiro agendamento?"
                action={
                    <Button icon={Plus} onClick={onCreate}>
                        Novo agendamento
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-3">
            {appointments.map((a) => (
                <AppointmentCard
                    key={a.id}
                    appointment={a}
                    onEdit={() => onEdit(a)}
                    onDelete={() => onDelete(a)}
                />
            ))}
        </div>
    );
}

function WeekView({ days, appointmentsForDay, onSelectDay, onEdit }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            {days.map((day) => {
                const dayAppointments = appointmentsForDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                    <div key={day.toISOString()} className="rounded-2xl border border-line bg-surface p-3">
                        <button
                            onClick={() => onSelectDay(day)}
                            className="mb-2 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left hover:bg-paper-dim"
                        >
                            <span className="text-xs font-medium uppercase text-ink-soft">
                                {formatWeekdayShort(day)}
                            </span>
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-pine-900 text-white" : "text-ink"
                                    }`}
                            >
                                {formatDayNumber(day)}
                            </span>
                        </button>
                        <div className="space-y-1.5">
                            {dayAppointments.length === 0 ? (
                                <p className="py-2 text-center text-xs text-ink-soft">—</p>
                            ) : (
                                dayAppointments.map((a) => (
                                    <AppointmentCard key={a.id} appointment={a} onEdit={() => onEdit(a)} compact />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function MonthView({ days, referenceDate, appointmentsForDay, onSelectDay }) {
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid grid-cols-7 border-b border-line bg-paper-dim/60">
                {weekdays.map((w) => (
                    <div key={w} className="px-2 py-2 text-center text-xs font-medium text-ink-soft">
                        {w}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">
                {days.map((day) => {
                    const dayAppointments = appointmentsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const inMonth = isSameMonth(day, referenceDate);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDay(day)}
                            className={`flex min-h-[84px] flex-col items-start gap-1 border-b border-r border-line p-2 text-left hover:bg-paper-dim/50 ${inMonth ? "bg-surface" : "bg-paper-dim/30"
                                }`}
                        >
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-pine-900 text-white" : inMonth ? "text-ink" : "text-ink-soft/50"
                                    }`}
                            >
                                {formatDayNumber(day)}
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {dayAppointments.slice(0, 4).map((a) => (
                                    <span
                                        key={a.id}
                                        className={`h-1.5 w-1.5 rounded-full ${dotBg(statusTone(a.status))}`}
                                    />
                                ))}
                                {dayAppointments.length > 4 && (
                                    <span className="text-[10px] text-ink-soft">+{dayAppointments.length - 4}</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function dotBg(tone) {
    const map = {
        neutral: "bg-ink-soft",
        pine: "bg-pine-700",
        amber: "bg-amber-500",
        success: "bg-success",
        danger: "bg-danger",
    };
    return map[tone] || "bg-ink-soft";
}

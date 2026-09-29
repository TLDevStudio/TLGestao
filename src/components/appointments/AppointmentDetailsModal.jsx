import { addMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Scissors, Calendar, Clock, UserCog, FileText, Phone, Mail, Globe, Pencil } from "lucide-react";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { statusTone } from "./AppointmentCard";
import { APPOINTMENT_STATUS } from "../../services/appointmentService";
import { useClients } from "../../hooks/useClients";
import { formatDateTime } from "../../utils/formatters";

function Row({ icon: Icon, label, children }) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <Icon size={15} className="mt-0.5 shrink-0 text-ink-soft" />
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">{label}</p>
                <div className="break-words text-sm text-ink">{children}</div>
            </div>
        </div>
    );
}

/** Visualização somente leitura de todos os dados de um agendamento. */
export default function AppointmentDetailsModal({ appointment, onClose, onEdit }) {
    const { clients } = useClients();
    if (!appointment) return null;

    const client = clients.find((c) => c.id === appointment.clientId);
    const start = appointment.dateObj;
    const end = start ? addMinutes(start, Number(appointment.duration) || 0) : null;
    const isOnline = appointment.source === "online";

    return (
        <Modal
            open
            onClose={onClose}
            title="Detalhes do agendamento"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Fechar
                    </Button>
                    <Button icon={Pencil} onClick={() => onEdit(appointment)}>
                        Editar
                    </Button>
                </>
            }
        >
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={statusTone(appointment.status)}>
                    {APPOINTMENT_STATUS[appointment.status] || appointment.status}
                </Badge>
                <Badge tone={isOnline ? "pine" : "neutral"}>
                    <Globe size={11} />
                    {isOnline ? "Agendado online pelo cliente" : "Agendado manualmente"}
                </Badge>
            </div>

            <div className="divide-y divide-line">
                <Row icon={User} label="Cliente">
                    <p className="font-medium">{appointment.clientName || "—"}</p>
                    {client?.phone && <p className="text-ink-soft">{client.phone}</p>}
                </Row>

                {(client?.whatsapp || client?.email) && (
                    <Row icon={client?.whatsapp ? Phone : Mail} label="Contato">
                        {client?.whatsapp && <p>WhatsApp: {client.whatsapp}</p>}
                        {client?.email && <p>{client.email}</p>}
                    </Row>
                )}

                <Row icon={Scissors} label="Serviço">
                    {appointment.serviceName || "—"}
                </Row>

                <Row icon={Calendar} label="Data">
                    <span className="capitalize">
                        {start ? format(start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                    </span>
                </Row>

                <Row icon={Clock} label="Horário">
                    {start ? format(start, "HH:mm") : "—"}
                    {end && ` às ${format(end, "HH:mm")}`}
                    {appointment.duration ? ` (${appointment.duration} min)` : ""}
                </Row>

                {appointment.professional && (
                    <Row icon={UserCog} label="Profissional">
                        {appointment.professional}
                    </Row>
                )}

                {appointment.notes && (
                    <Row icon={FileText} label="Observações">
                        <span className="italic">"{appointment.notes}"</span>
                    </Row>
                )}
            </div>

            {appointment.createdAt && (
                <p className="mt-3 text-[11px] text-ink-soft/70">
                    Solicitado em {formatDateTime(appointment.createdAt)}
                </p>
            )}
        </Modal>
    );
}

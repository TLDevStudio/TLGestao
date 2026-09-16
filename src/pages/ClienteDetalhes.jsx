import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Pencil,
    Phone,
    MessageCircle,
    Mail,
    IdCard,
    Cake,
    MapPin,
    FileText,
    Wallet,
    CalendarClock,
    Repeat,
    PlusCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import { FullPageLoading } from "../components/ui/Loading";
import ClientFormModal from "../components/clients/ClientFormModal";
import { getClientById } from "../services/clientService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { useToast } from "../contexts/ToastContext";

const INFO_ROWS = [
    { key: "phone", label: "Telefone", icon: Phone },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { key: "email", label: "E-mail", icon: Mail },
    { key: "cpf", label: "CPF", icon: IdCard },
    { key: "birthDate", label: "Nascimento", icon: Cake },
    { key: "address", label: "Endereço", icon: MapPin },
];

export default function ClienteDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getClientById(id);
            if (!data) {
                toast.error("Cliente não encontrado.");
                navigate("/app/clientes");
                return;
            }
            setClient(data);
        } catch {
            toast.error("Não foi possível carregar o cliente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) return <FullPageLoading label="Carregando cliente..." />;
    if (!client) return null;

    return (
        <div className="space-y-5">
            <button
                onClick={() => navigate("/app/clientes")}
                className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
            >
                <ArrowLeft size={15} /> Voltar para clientes
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-900 font-display text-lg font-semibold text-white">
                        {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-display text-xl font-semibold text-ink">{client.name}</h2>
                        <p className="text-sm text-ink-soft">
                            Cliente desde {formatDate(client.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={Pencil} onClick={() => setEditOpen(true)}>
                        Editar
                    </Button>
                    <Button
                        icon={PlusCircle}
                        onClick={() =>
                            toast.info("O módulo de Vendas/Agendamentos será implementado na próxima etapa.")
                        }
                    >
                        Novo atendimento
                    </Button>
                </div>
            </div>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center gap-2 text-ink-soft">
                        <Wallet size={15} />
                        <span className="text-xs">Total gasto</span>
                    </div>
                    <p className="mt-1.5 font-display text-lg font-semibold text-ink">
                        {formatCurrency(client.totalSpent)}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center gap-2 text-ink-soft">
                        <CalendarClock size={15} />
                        <span className="text-xs">Última visita</span>
                    </div>
                    <p className="mt-1.5 font-display text-lg font-semibold text-ink">
                        {client.lastVisitAt ? formatDate(client.lastVisitAt) : "—"}
                    </p>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center gap-2 text-ink-soft">
                        <Repeat size={15} />
                        <span className="text-xs">Atendimentos</span>
                    </div>
                    <p className="mt-1.5 font-display text-lg font-semibold text-ink">
                        {client.visitsCount ?? 0}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Dados pessoais */}
                <div className="rounded-2xl border border-line bg-surface p-5">
                    <h3 className="mb-4 font-display text-base font-semibold text-ink">Dados pessoais</h3>
                    <dl className="space-y-3">
                        {INFO_ROWS.map(({ key, label, icon: Icon }) => (
                            <div key={key} className="flex items-start gap-2.5 text-sm">
                                <Icon size={15} className="mt-0.5 shrink-0 text-ink-soft" />
                                <div>
                                    <dt className="text-xs text-ink-soft">{label}</dt>
                                    <dd className="text-ink">{client[key] || "—"}</dd>
                                </div>
                            </div>
                        ))}
                    </dl>

                    {client.notes && (
                        <div className="mt-4 border-t border-line pt-4">
                            <div className="flex items-start gap-2.5 text-sm">
                                <FileText size={15} className="mt-0.5 shrink-0 text-ink-soft" />
                                <div>
                                    <dt className="text-xs text-ink-soft">Observações</dt>
                                    <dd className="text-ink leading-relaxed">{client.notes}</dd>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Históricos — placeholders até Vendas/Agendamentos existirem */}
                <div className="space-y-4">
                    <div className="rounded-2xl border border-line bg-surface p-5">
                        <h3 className="mb-3 font-display text-base font-semibold text-ink">
                            Histórico de serviços
                        </h3>
                        <p className="text-sm text-ink-soft">
                            Nenhum serviço registrado ainda. Este histórico será preenchido automaticamente
                            quando o módulo de Agendamentos/Vendas estiver disponível.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-line bg-surface p-5">
                        <h3 className="mb-3 font-display text-base font-semibold text-ink">
                            Histórico de compras
                        </h3>
                        <p className="text-sm text-ink-soft">
                            Nenhuma compra registrada ainda. Este histórico será preenchido automaticamente
                            quando o módulo de Vendas estiver disponível.
                        </p>
                    </div>
                </div>
            </div>

            <ClientFormModal
                open={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    load();
                }}
                client={client}
            />
        </div>
    );
}

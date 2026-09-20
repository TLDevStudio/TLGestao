import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Users, Phone, Mail, Calendar } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { TableRowSkeleton } from "../components/ui/Loading";
import ClientFormModal from "../components/clients/ClientFormModal";
import { useClients } from "../hooks/useClients";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { deleteClient } from "../services/clientService";
import { formatDate } from "../utils/formatters";
import useIsDemoAccount from "../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../utils/demoGuard";

const COLUMNS = [
    { key: "name", label: "Nome" },
    { key: "contact", label: "Contato" },
    { key: "createdAt", label: "Cadastro" },
    { key: "actions", label: "", className: "text-right" },
];

export default function Clientes() {
    const { user } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();
    const [search, setSearch] = useState("");
    const { clients, allClientsCount, loading, error } = useClients(search);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    const openCreateModal = () => {
        setEditingClient(null);
        setModalOpen(true);
    };

    const openEditModal = (client) => {
        setEditingClient(client);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!clientToDelete) return;
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            setClientToDelete(null);
            return;
        }
        setDeleting(true);
        try {
            await deleteClient(user.uid, clientToDelete.id, clientToDelete.name);
            toast.success("Cliente excluído.");
            setClientToDelete(null);
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível excluir o cliente.");
        } finally {
            setDeleting(false);
        }
    };

    const hasNoClientsAtAll = !loading && allClientsCount === 0;
    const hasNoSearchResults = !loading && allClientsCount > 0 && clients.length === 0;

    const searchEmptyState = (
        <EmptyState
            icon={Search}
            title="Nenhum cliente encontrado"
            description="Tente pesquisar com outro nome, telefone ou e-mail."
        />
    );

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                    icon={Search}
                    placeholder="Pesquisar por nome, telefone, e-mail ou CPF..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    containerClassName="w-full sm:max-w-sm"
                />
                <Button icon={Plus} onClick={openCreateModal} className="btn-fx btn-pine rounded-xlw-full sm:w-auto sm:shrink-0">
                    Novo cliente
                </Button>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {hasNoClientsAtAll ? (
                <EmptyState
                    icon={Users}
                    title="Você ainda não possui clientes cadastrados."
                    description="Cadastre seu primeiro cliente para começar a acompanhar atendimentos, compras e histórico."
                    action={
                        <Button icon={Plus} onClick={openCreateModal}>
                            Cadastrar primeiro cliente
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* ---------- MOBILE: lista de cartões ---------- */}
                    <div className="space-y-3 md:hidden">
                        {loading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-line bg-surface p-4">
                                    <div className="skeleton h-4 w-2/5" />
                                    <div className="skeleton mt-3 h-3 w-3/5" />
                                    <div className="skeleton mt-2 h-3 w-1/2" />
                                </div>
                            ))}

                        {hasNoSearchResults && (
                            <div className="rounded-2xl border border-line bg-surface p-6">
                                {searchEmptyState}
                            </div>
                        )}

                        {!loading &&
                            clients.map((client) => (
                                <div
                                    key={client.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => navigate(`/app/clientes/${client.id}`)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            navigate(`/app/clientes/${client.id}`);
                                        }
                                    }}
                                    className="w-full rounded-2xl border border-line bg-surface p-4 text-left active:bg-paper-dim/60"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="min-w-0 flex-1 font-medium text-ink break-words">
                                            {client.name}
                                        </p>

                                        <div
                                            className="flex shrink-0 gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => openEditModal(client)}
                                                className="rounded-lg p-2 text-ink-soft active:bg-paper-dim active:text-ink"
                                                aria-label={`Editar ${client.name}`}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => setClientToDelete(client)}
                                                className="rounded-lg p-2 text-ink-soft active:bg-danger-100 active:text-danger"
                                                aria-label={`Excluir ${client.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-col gap-1 text-xs text-ink-soft">
                                        {client.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone size={12} className="shrink-0" />
                                                <span className="break-all">{client.phone}</span>
                                            </span>
                                        )}
                                        {client.email && (
                                            <span className="flex items-center gap-1.5">
                                                <Mail size={12} className="shrink-0" />
                                                <span className="break-all">{client.email}</span>
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={12} className="shrink-0" />
                                            Cadastro em {formatDate(client.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* ---------- DESKTOP: tabela ---------- */}
                    <div className="hidden md:block">
                        <Table
                            columns={COLUMNS}
                            empty={hasNoSearchResults && <div className="p-8">{searchEmptyState}</div>}
                        >
                            {loading &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRowSkeleton key={i} columns={4} />
                                ))}

                            {!loading &&
                                clients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="cursor-pointer hover:bg-paper-dim/50"
                                        onClick={() => navigate(`/app/clientes/${client.id}`)}
                                    >
                                        <td className="px-4 py-3 font-medium text-ink">{client.name}</td>
                                        <td className="px-4 py-3 text-ink-soft">
                                            <div className="flex flex-col gap-0.5 text-xs">
                                                {client.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone size={12} /> {client.phone}
                                                    </span>
                                                )}
                                                {client.email && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail size={12} /> {client.email}
                                                    </span>
                                                )}
                                                {!client.phone && !client.email && "—"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-ink-soft">
                                            {formatDate(client.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div
                                                className="flex justify-end gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => openEditModal(client)}
                                                    className="rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
                                                    aria-label="Editar cliente"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setClientToDelete(client)}
                                                    className="rounded-lg p-2 text-ink-soft hover:bg-danger-100 hover:text-danger"
                                                    aria-label="Excluir cliente"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </Table>
                    </div>
                </>
            )}

            <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} client={editingClient} />

            <ConfirmDialog
                open={!!clientToDelete}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleDelete}
                loading={deleting}
                title="Excluir cliente"
                description={`Tem certeza que deseja excluir "${clientToDelete?.name}"? Essa ação não pode ser desfeita.`}
                confirmLabel="Excluir"
            />
        </div>
    );
}
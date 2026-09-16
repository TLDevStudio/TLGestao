import { useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Scissors,
    Clock,
    Power,
    Tag,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { TableRowSkeleton } from "../components/ui/Loading";
import ServiceFormModal from "../components/services/ServiceFormModal";
import { useServices } from "../hooks/useServices";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
    deleteService,
    toggleServiceActive,
} from "../services/serviceService";
import { formatCurrency } from "../utils/formatters";

const COLUMNS = [
    { key: "name", label: "Serviço" },
    { key: "category", label: "Categoria" },
    { key: "price", label: "Preço" },
    { key: "duration", label: "Duração" },
    { key: "status", label: "Status" },
    { key: "actions", label: "", className: "text-right" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "Todos os status" },
    { value: "active", label: "Ativos" },
    { value: "inactive", label: "Inativos" },
];

/* ============================================================================
   CONTROLE DE STATUS DO SERVIÇO
   ============================================================================
   Mantém a mesma função de ativar/desativar, alterando apenas a apresentação.
   ============================================================================ */

function ServiceStatusToggle({ service, onToggle }) {
    const isActive = service.active;

    return (
        <button
            type="button"
            onClick={() => onToggle(service)}
            role="switch"
            aria-checked={isActive}
            aria-label={
                isActive
                    ? "Desativar serviço"
                    : "Ativar serviço"
            }
            title={
                isActive
                    ? "Clique para desativar"
                    : "Clique para ativar"
            }
            className={`
                group
                inline-flex
                min-h-[36px]
                items-center
                gap-2
                rounded-full
                border
                px-2.5
                py-1.5
                text-xs
                font-semibold
                transition-all
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-pine-800/20
                active:scale-[0.97]

                ${isActive
                    ? `
                            border-success/20
                            bg-success-100
                            text-success
                            hover:border-success/30
                            hover:bg-success-100/80
                          `
                    : `
                            border-line
                            bg-paper-dim
                            text-ink-soft
                            hover:border-ink-soft/30
                            hover:bg-paper-dim/80
                          `
                }
            `}
        >
            {/* Indicador */}
            <span
                className={`
                    relative
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    transition-all
                    duration-200

                    ${isActive
                        ? "bg-success text-white shadow-sm"
                        : "bg-surface text-ink-soft border border-line"
                    }
                `}
            >
                <Power
                    size={11}
                    strokeWidth={2.5}
                    className={`
                        transition-transform
                        duration-200
                        ${isActive
                            ? "scale-100"
                            : "scale-90 opacity-70"
                        }
                    `}
                />
            </span>

            {/* Texto */}
            <span className="leading-none">
                {isActive ? "Ativo" : "Inativo"}
            </span>
        </button>
    );
}

export default function Servicos() {
    const { user } = useAuth();
    const toast = useToast();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");

    const {
        services,
        allServicesCount,
        categories,
        loading,
        error,
    } = useServices({
        search,
        category,
        status,
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const categoryOptions = [
        { value: "all", label: "Todas as categorias" },
        ...categories.map((c) => ({
            value: c,
            label: c,
        })),
    ];

    const openCreateModal = () => {
        setEditingService(null);
        setModalOpen(true);
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setModalOpen(true);
    };

    const handleToggleActive = async (service) => {
        try {
            await toggleServiceActive(user.uid, service);

            toast.success(
                service.active
                    ? "Serviço desativado."
                    : "Serviço ativado."
            );
        } catch (err) {
            console.error(err);

            toast.error(
                "Não foi possível atualizar o status."
            );
        }
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;

        setDeleting(true);

        try {
            await deleteService(
                user.uid,
                serviceToDelete.id,
                serviceToDelete.name
            );

            toast.success("Serviço excluído.");

            setServiceToDelete(null);
        } catch (err) {
            console.error(err);

            toast.error(
                "Não foi possível excluir o serviço."
            );
        } finally {
            setDeleting(false);
        }
    };

    const hasNoServicesAtAll =
        !loading && allServicesCount === 0;

    const hasNoResults =
        !loading &&
        allServicesCount > 0 &&
        services.length === 0;

    const searchEmptyState = (
        <EmptyState
            icon={Search}
            title="Nenhum serviço encontrado"
            description="Tente ajustar a busca ou os filtros selecionados."
        />
    );

    return (
        <div className="space-y-5">
            {/* =================================================================
                BUSCA + FILTROS
                ================================================================= */}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Input
                        icon={Search}
                        placeholder="Pesquisar serviço..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        containerClassName="w-full sm:max-w-xs"
                    />

                    <div className="w-full sm:w-48">
                        <Select
                            options={categoryOptions}
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value)
                            }
                        />
                    </div>

                    <div className="w-full sm:w-40">
                        <Select
                            options={STATUS_OPTIONS}
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                        />
                    </div>
                </div>

                <Button
                    icon={Plus}
                    onClick={openCreateModal}
                    className="w-full sm:w-auto sm:shrink-0"
                >
                    Novo serviço
                </Button>
            </div>

            {/* =================================================================
                ERRO
                ================================================================= */}

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">
                    {error}
                </p>
            )}

            {/* =================================================================
                ESTADO SEM SERVIÇOS
                ================================================================= */}

            {hasNoServicesAtAll ? (
                <EmptyState
                    icon={Scissors}
                    title="Você ainda não possui serviços cadastrados."
                    description="Cadastre os serviços oferecidos pelo seu negócio para usá-los em agendamentos e vendas."
                    action={
                        <Button
                            icon={Plus}
                            onClick={openCreateModal}
                        >
                            Cadastrar primeiro serviço
                        </Button>
                    }
                />
            ) : (
                <>
                    {/* =========================================================
                        MOBILE — LISTA DE CARTÕES
                        ========================================================= */}

                    <div className="space-y-3 md:hidden">
                        {loading &&
                            Array.from({ length: 4 }).map(
                                (_, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-line bg-surface p-4"
                                    >
                                        <div className="skeleton h-4 w-2/5" />
                                        <div className="skeleton mt-3 h-3 w-1/3" />
                                        <div className="skeleton mt-2 h-3 w-1/2" />
                                    </div>
                                )
                            )}

                        {hasNoResults && (
                            <div className="rounded-2xl border border-line bg-surface p-6">
                                {searchEmptyState}
                            </div>
                        )}

                        {!loading &&
                            services.map((service) => (
                                <div
                                    key={service.id}
                                    className="
                                        rounded-2xl
                                        border
                                        border-line
                                        bg-surface
                                        p-4
                                        shadow-sm
                                        transition-shadow
                                        hover:shadow-md
                                    "
                                >
                                    {/* =================================================
                                        NOME + CATEGORIA
                                        ================================================= */}

                                    <div className="flex min-w-0 items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="break-words font-medium text-ink">
                                                {service.name}
                                            </p>

                                            {service.category && (
                                                <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                                                    <Tag
                                                        size={12}
                                                        className="shrink-0"
                                                    />

                                                    <span className="break-words">
                                                        {service.category}
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        <Badge
                                            tone={
                                                service.active
                                                    ? "success"
                                                    : "neutral"
                                            }
                                            className="shrink-0"
                                        >
                                            {service.active
                                                ? "Ativo"
                                                : "Inativo"}
                                        </Badge>
                                    </div>

                                    {/* =================================================
                                        PREÇO + DURAÇÃO
                                        ================================================= */}

                                    <div className="mt-4 flex items-end justify-between gap-3">
                                        <div className="flex min-w-0 flex-col gap-1">
                                            <span className="text-base font-semibold text-ink">
                                                {formatCurrency(
                                                    service.price
                                                )}
                                            </span>

                                            <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                                                <Clock
                                                    size={12}
                                                    className="shrink-0"
                                                />

                                                {service.duration} min
                                            </span>
                                        </div>

                                        {/* =================================================
                                            AÇÕES MOBILE
                                            ================================================= */}

                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <ServiceStatusToggle
                                                service={service}
                                                onToggle={
                                                    handleToggleActive
                                                }
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        service
                                                    )
                                                }
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-line
                                                    bg-surface
                                                    text-ink-soft
                                                    transition
                                                    hover:bg-paper-dim
                                                    hover:text-ink
                                                    active:scale-95
                                                "
                                                aria-label="Editar serviço"
                                                title="Editar"
                                            >
                                                <Pencil size={15} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setServiceToDelete(
                                                        service
                                                    )
                                                }
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-line
                                                    bg-surface
                                                    text-ink-soft
                                                    transition
                                                    hover:border-danger/20
                                                    hover:bg-danger-100
                                                    hover:text-danger
                                                    active:scale-95
                                                "
                                                aria-label="Excluir serviço"
                                                title="Excluir"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* =========================================================
                        DESKTOP — TABELA
                        ========================================================= */}

                    <div className="hidden md:block">
                        <Table
                            columns={COLUMNS}
                            empty={
                                hasNoResults && (
                                    <div className="p-8">
                                        {searchEmptyState}
                                    </div>
                                )
                            }
                        >
                            {loading &&
                                Array.from({ length: 4 }).map(
                                    (_, i) => (
                                        <TableRowSkeleton
                                            key={i}
                                            columns={6}
                                        />
                                    )
                                )}

                            {!loading &&
                                services.map((service) => (
                                    <tr
                                        key={service.id}
                                        className="transition-colors hover:bg-paper-dim/50"
                                    >
                                        {/* Serviço */}
                                        <td className="px-4 py-3 font-medium text-ink">
                                            {service.name}
                                        </td>

                                        {/* Categoria */}
                                        <td className="px-4 py-3 text-ink-soft">
                                            {service.category || "—"}
                                        </td>

                                        {/* Preço */}
                                        <td className="px-4 py-3 text-ink">
                                            {formatCurrency(
                                                service.price
                                            )}
                                        </td>

                                        {/* Duração */}
                                        <td className="px-4 py-3 text-ink-soft">
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} />

                                                {service.duration} min
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <ServiceStatusToggle
                                                service={service}
                                                onToggle={
                                                    handleToggleActive
                                                }
                                            />
                                        </td>

                                        {/* Ações */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            service
                                                        )
                                                    }
                                                    className="
                                                        rounded-lg
                                                        p-2
                                                        text-ink-soft
                                                        transition
                                                        hover:bg-paper-dim
                                                        hover:text-ink
                                                    "
                                                    aria-label="Editar serviço"
                                                    title="Editar"
                                                >
                                                    <Pencil size={15} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setServiceToDelete(
                                                            service
                                                        )
                                                    }
                                                    className="
                                                        rounded-lg
                                                        p-2
                                                        text-ink-soft
                                                        transition
                                                        hover:bg-danger-100
                                                        hover:text-danger
                                                    "
                                                    aria-label="Excluir serviço"
                                                    title="Excluir"
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

            {/* =================================================================
                MODAL DE SERVIÇO
                ================================================================= */}

            <ServiceFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                service={editingService}
            />

            {/* =================================================================
                CONFIRMAÇÃO DE EXCLUSÃO
                ================================================================= */}

            <ConfirmDialog
                open={!!serviceToDelete}
                onClose={() =>
                    setServiceToDelete(null)
                }
                onConfirm={handleDelete}
                loading={deleting}
                title="Excluir serviço"
                description={`Tem certeza que deseja excluir "${serviceToDelete?.name}"? Essa ação não pode ser desfeita.`}
                confirmLabel="Excluir"
            />
        </div>
    );
}
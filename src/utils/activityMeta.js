import {
    UserPlus,
    UserCog,
    UserMinus,
    Scissors,
    Package,
    Boxes,
    CalendarPlus,
    CalendarClock,
    CalendarX,
    ShoppingCart,
    ArrowUpCircle,
    ArrowDownCircle,
    FileEdit,
    Trash2,
} from "lucide-react";

/**
 * Mapa central: cada ação registrada por logActivity() ganha aqui um rótulo,
 * um módulo (usado no filtro) e um ícone/tom visual para a linha do tempo.
 */
export const ACTION_META = {
    client_created: { label: "Cliente cadastrado", module: "clientes", icon: UserPlus, tone: "success" },
    client_updated: { label: "Cliente editado", module: "clientes", icon: UserCog, tone: "neutral" },
    client_deleted: { label: "Cliente excluído", module: "clientes", icon: UserMinus, tone: "danger" },

    service_created: { label: "Serviço cadastrado", module: "servicos", icon: Scissors, tone: "success" },
    service_updated: { label: "Serviço editado", module: "servicos", icon: Scissors, tone: "neutral" },
    service_deleted: { label: "Serviço excluído", module: "servicos", icon: Trash2, tone: "danger" },

    product_created: { label: "Produto cadastrado", module: "produtos", icon: Package, tone: "success" },
    product_updated: { label: "Produto editado", module: "produtos", icon: Package, tone: "neutral" },
    product_deleted: { label: "Produto excluído", module: "produtos", icon: Trash2, tone: "danger" },
    stock_adjusted: { label: "Estoque alterado", module: "produtos", icon: Boxes, tone: "amber" },

    appointment_created: { label: "Agendamento criado", module: "agendamentos", icon: CalendarPlus, tone: "success" },
    appointment_updated: { label: "Agendamento editado", module: "agendamentos", icon: CalendarClock, tone: "neutral" },
    appointment_status_changed: { label: "Status do agendamento alterado", module: "agendamentos", icon: CalendarClock, tone: "pine" },
    appointment_deleted: { label: "Agendamento excluído", module: "agendamentos", icon: CalendarX, tone: "danger" },

    sale_completed: { label: "Venda realizada", module: "vendas", icon: ShoppingCart, tone: "success" },

    income_created: { label: "Receita lançada", module: "financeiro", icon: ArrowUpCircle, tone: "success" },
    expense_created: { label: "Despesa lançada", module: "financeiro", icon: ArrowDownCircle, tone: "danger" },
    transaction_updated: { label: "Lançamento editado", module: "financeiro", icon: FileEdit, tone: "neutral" },
    transaction_deleted: { label: "Lançamento excluído", module: "financeiro", icon: Trash2, tone: "danger" },
};

export const MODULE_OPTIONS = [
    { value: "all", label: "Todos os módulos" },
    { value: "clientes", label: "Clientes" },
    { value: "servicos", label: "Serviços" },
    { value: "produtos", label: "Produtos" },
    { value: "agendamentos", label: "Agendamentos" },
    { value: "vendas", label: "Vendas" },
    { value: "financeiro", label: "Financeiro" },
];

export function getActionMeta(action) {
    return (
        ACTION_META[action] || { label: action, module: "outros", icon: FileEdit, tone: "neutral" }
    );
}

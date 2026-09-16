import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Receipt, ShoppingCart } from "lucide-react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import ItemPicker from "../components/sales/ItemPicker";
import CartPanel from "../components/sales/CartPanel";
import { useCart } from "../hooks/useCart";
import { useClients } from "../hooks/useClients";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { finalizeSale, subscribeSales, PAYMENT_METHODS } from "../services/saleService";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { maskCurrency, parseCurrencyInput } from "../utils/masks";

const HISTORY_COLUMNS = [
    { key: "date", label: "Data" },
    { key: "client", label: "Cliente" },
    { key: "items", label: "Itens" },
    { key: "payment", label: "Pagamento" },
    { key: "total", label: "Total", className: "text-right" },
];

export default function Vendas() {
    const { user } = useAuth();
    const toast = useToast();
    const cart = useCart();
    const { clients } = useClients();

    const [tab, setTab] = useState("pdv");
    const [selectedClientId, setSelectedClientId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [discountDisplay, setDiscountDisplay] = useState("");
    const [finalizing, setFinalizing] = useState(false);
    const [successSale, setSuccessSale] = useState(null);

    const [sales, setSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeSales(
            user.uid,
            (list) => {
                setSales(list);
                setLoadingSales(false);
            },
            () => setLoadingSales(false)
        );
        return unsubscribe;
    }, [user]);

    const clientOptions = useMemo(
        () => clients.map((c) => ({ value: c.id, label: c.name })),
        [clients]
    );

    const handleDiscountChange = (e) => {
        const masked = maskCurrency(e.target.value);
        setDiscountDisplay(masked);
        cart.setDiscount(parseCurrencyInput(masked || "0"));
    };

    const handleFinalize = async () => {
        if (cart.isEmpty) return;

        const client = clients.find((c) => c.id === selectedClientId) || null;

        setFinalizing(true);
        try {
            const result = await finalizeSale(user.uid, {
                client,
                products: cart.products,
                services: cart.services,
                discount: cart.discount,
                paymentMethod,
            });

            setSuccessSale({ total: result.total, clientName: client?.name || "Consumidor final" });
            cart.clearCart();
            setDiscountDisplay("");
            setSelectedClientId("");
            setPaymentMethod("cash");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível finalizar a venda. Tente novamente.");
        } finally {
            setFinalizing(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex rounded-xl border border-line bg-surface p-1 sm:w-fit">
                <button
                    onClick={() => setTab("pdv")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none ${tab === "pdv" ? "bg-pine-900 text-white" : "text-ink-soft hover:bg-paper-dim"
                        }`}
                >
                    <ShoppingCart size={15} /> Nova venda
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none ${tab === "history" ? "bg-pine-900 text-white" : "text-ink-soft hover:bg-paper-dim"
                        }`}
                >
                    <Receipt size={15} /> Histórico
                </button>
            </div>

            {tab === "pdv" ? (
                <div className="grid gap-4 lg:grid-cols-2">
                    <ItemPicker onAddItem={cart.addItem} />
                    <CartPanel
                        cart={cart}
                        clientOptions={clientOptions}
                        selectedClientId={selectedClientId}
                        onSelectClient={setSelectedClientId}
                        paymentMethod={paymentMethod}
                        onSelectPayment={setPaymentMethod}
                        discountDisplay={discountDisplay}
                        onDiscountChange={handleDiscountChange}
                        onFinalize={handleFinalize}
                        finalizing={finalizing}
                    />
                </div>
            ) : (
                <SalesHistory sales={sales} loading={loadingSales} />
            )}

            <Modal
                open={!!successSale}
                onClose={() => setSuccessSale(null)}
                title="Venda finalizada"
                size="sm"
                footer={
                    <Button onClick={() => setSuccessSale(null)} className="w-full">
                        Nova venda
                    </Button>
                }
            >
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                    <div className="rounded-full bg-success-100 p-3">
                        <CheckCircle2 size={26} className="text-success" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-semibold text-ink">
                            {formatCurrency(successSale?.total)}
                        </p>
                        <p className="text-sm text-ink-soft">Venda registrada para {successSale?.clientName}</p>
                    </div>
                    <p className="text-xs text-ink-soft">
                        Estoque atualizado e receita lançada no financeiro automaticamente.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

function SalesHistory({ sales, loading }) {
    if (loading) {
        return <p className="py-10 text-center text-sm text-ink-soft">Carregando vendas...</p>;
    }

    if (sales.length === 0) {
        return (
            <EmptyState
                icon={Receipt}
                title="Nenhuma venda registrada ainda."
                description="Assim que você finalizar a primeira venda, ela aparecerá aqui e no Dashboard."
            />
        );
    }

    return (
        <>
            {/* ---------- MOBILE: lista de cartões ---------- */}
            <div className="space-y-3 md:hidden">
                {sales.map((sale) => {
                    const itemCount = (sale.products?.length || 0) + (sale.services?.length || 0);
                    return (
                        <div key={sale.id} className="rounded-2xl border border-line bg-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-ink break-words">{sale.clientName}</p>
                                    <p className="mt-0.5 text-xs text-ink-soft">
                                        {formatDateTime(sale.createdAt)}
                                    </p>
                                </div>
                                <span className="shrink-0 text-base font-semibold text-ink">
                                    {formatCurrency(sale.total)}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-ink-soft">{itemCount} item(ns)</span>
                                <Badge tone="neutral">{PAYMENT_METHODS[sale.paymentMethod] || "—"}</Badge>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ---------- DESKTOP: tabela ---------- */}
            <div className="hidden md:block">
                <Table columns={HISTORY_COLUMNS}>
                    {sales.map((sale) => {
                        const itemCount = (sale.products?.length || 0) + (sale.services?.length || 0);
                        return (
                            <tr key={sale.id} className="hover:bg-paper-dim/50">
                                <td className="px-4 py-3 text-ink-soft">{formatDateTime(sale.createdAt)}</td>
                                <td className="px-4 py-3 font-medium text-ink">{sale.clientName}</td>
                                <td className="px-4 py-3 text-ink-soft">{itemCount} item(ns)</td>
                                <td className="px-4 py-3">
                                    <Badge tone="neutral">{PAYMENT_METHODS[sale.paymentMethod] || "—"}</Badge>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-ink">
                                    {formatCurrency(sale.total)}
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            </div>
        </>
    );
}
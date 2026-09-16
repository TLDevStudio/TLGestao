import { Minus, Plus, Trash2, ShoppingCart, Package, Scissors } from "lucide-react";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Input from "../ui/Input";
import EmptyState from "../ui/EmptyState";
import { PAYMENT_METHODS } from "../../services/saleService";
import { formatCurrency } from "../../utils/formatters";

const PAYMENT_OPTIONS = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({
    value,
    label,
}));

export default function CartPanel({
    cart,
    clientOptions,
    selectedClientId,
    onSelectClient,
    paymentMethod,
    onSelectPayment,
    discountDisplay,
    onDiscountChange,
    onFinalize,
    finalizing,
}) {
    const { items, subtotal, total, discount, stockError, isEmpty, updateQuantity, removeItem } = cart;

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Cliente</label>
                <Select
                    placeholder="Consumidor final"
                    options={clientOptions}
                    value={selectedClientId}
                    onChange={(e) => onSelectClient(e.target.value)}
                />
            </div>

            <div className="border-t border-line pt-4">
                {isEmpty ? (
                    <EmptyState
                        icon={ShoppingCart}
                        title="Carrinho vazio"
                        description="Selecione serviços ou produtos ao lado para iniciar a venda."
                    />
                ) : (
                    <div className="max-h-[280px] space-y-2 overflow-y-auto">
                        {items.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex items-center gap-2 rounded-xl border border-line px-3 py-2"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                                        {item.type === "product" ? (
                                            <Package size={12} className="shrink-0 text-ink-soft" />
                                        ) : (
                                            <Scissors size={12} className="shrink-0 text-ink-soft" />
                                        )}
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-ink-soft">
                                        {formatCurrency(item.unitPrice)} × {item.quantity} ={" "}
                                        <strong className="text-ink">
                                            {formatCurrency(item.unitPrice * item.quantity)}
                                        </strong>
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                                        className="rounded-lg border border-line p-1 text-ink-soft hover:bg-paper-dim"
                                        aria-label="Diminuir quantidade"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="w-6 text-center text-sm font-medium text-ink">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                                        className="rounded-lg border border-line p-1 text-ink-soft hover:bg-paper-dim"
                                        aria-label="Aumentar quantidade"
                                    >
                                        <Plus size={13} />
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id, item.type)}
                                        className="ml-1 rounded-lg p-1 text-ink-soft hover:bg-danger-100 hover:text-danger"
                                        aria-label="Remover item"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isEmpty && (
                <>
                    <div className="space-y-2 border-t border-line pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-soft">Subtotal</span>
                            <span className="text-ink">{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="shrink-0 text-ink-soft">Desconto</span>
                            <Input
                                placeholder="0,00"
                                inputMode="numeric"
                                value={discountDisplay}
                                onChange={onDiscountChange}
                                containerClassName="w-28"
                                className="py-1.5 text-right"
                            />
                        </div>

                        {discount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-ink-soft">Desconto aplicado</span>
                                <span className="text-danger">− {formatCurrency(discount)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-line pt-2">
                            <span className="font-medium text-ink">Total</span>
                            <span className="font-display text-xl font-semibold text-ink">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Forma de pagamento</label>
                        <Select
                            options={PAYMENT_OPTIONS}
                            value={paymentMethod}
                            onChange={(e) => onSelectPayment(e.target.value)}
                        />
                    </div>

                    {stockError && (
                        <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{stockError}</p>
                    )}

                    <Button
                        size="lg"
                        variant="amber"
                        className="w-full"
                        onClick={onFinalize}
                        loading={finalizing}
                        disabled={!!stockError}
                    >
                        Finalizar venda · {formatCurrency(total)}
                    </Button>
                </>
            )}
        </div>
    );
}

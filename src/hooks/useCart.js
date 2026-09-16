import { useMemo, useState } from "react";

/**
 * Gerencia o carrinho do PDV: itens, quantidades, desconto e totais.
 * Produtos e serviços ficam em listas separadas porque só produtos
 * movimentam estoque na finalização da venda.
 */
export function useCart() {
    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);

    const addItem = (entity, type) => {
        setItems((current) => {
            const existing = current.find((i) => i.id === entity.id && i.type === type);
            if (existing) {
                return current.map((i) =>
                    i.id === entity.id && i.type === type ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...current,
                {
                    id: entity.id,
                    name: entity.name,
                    type,
                    unitPrice: type === "product" ? Number(entity.salePrice) : Number(entity.price),
                    quantity: 1,
                    maxStock: type === "product" ? Number(entity.stock) : null,
                    minStock: type === "product" ? Number(entity.minStock ?? 0) : null,
                },
            ];
        });
    };

    const updateQuantity = (id, type, quantity) => {
        const qty = Number(quantity);
        if (qty <= 0) return removeItem(id, type);
        setItems((current) =>
            current.map((i) => (i.id === id && i.type === type ? { ...i, quantity: qty } : i))
        );
    };

    const removeItem = (id, type) => {
        setItems((current) => current.filter((i) => !(i.id === id && i.type === type)));
    };

    const clearCart = () => {
        setItems([]);
        setDiscount(0);
    };

    const products = useMemo(() => items.filter((i) => i.type === "product"), [items]);
    const services = useMemo(() => items.filter((i) => i.type === "service"), [items]);

    const subtotal = useMemo(
        () => items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
        [items]
    );
    const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount]);

    /** Impede finalizar venda com quantidade acima do estoque disponível. */
    const stockError = useMemo(() => {
        const invalid = products.find((p) => p.maxStock !== null && p.quantity > p.maxStock);
        return invalid
            ? `"${invalid.name}" tem apenas ${invalid.maxStock} unidade(s) em estoque.`
            : null;
    }, [products]);

    return {
        items,
        products,
        services,
        subtotal,
        discount,
        setDiscount,
        total,
        stockError,
        isEmpty: items.length === 0,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };
}

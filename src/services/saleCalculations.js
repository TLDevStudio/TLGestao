/**
 * Regras de cálculo de uma venda — TLGestão.
 *
 * Extraído de saleService.js de propósito: são funções puras (mesma
 * entrada sempre gera a mesma saída, sem tocar em banco de dados), o que
 * torna possível testar as regras de negócio de vendas sem precisar
 * simular o Firestore inteiro. Veja saleCalculations.test.js.
 */

/**
 * Soma o valor total de uma lista de itens (produtos ou serviços).
 * Cada item precisa ter unitPrice e quantity.
 */
export function sumItems(items) {
    return (items || []).reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
}

/**
 * Calcula os totais de uma venda: subtotal (produtos + serviços),
 * desconto aplicado e total final — nunca deixando o total ficar negativo,
 * mesmo se alguém digitar um desconto maior que o subtotal.
 */
export function computeSaleTotals({ products, services, discount }) {
    const productsTotal = sumItems(products);
    const servicesTotal = sumItems(services);
    const subtotal = productsTotal + servicesTotal;
    const safeDiscount = Number(discount) || 0;
    const total = Math.max(subtotal - safeDiscount, 0);

    return { productsTotal, servicesTotal, subtotal, discount: safeDiscount, total };
}

/** Formata um item (produto ou serviço) para gravação no banco. */
export function normalizeItem(item) {
    return {
        id: item.id,
        name: item.name,
        type: item.type,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        total: item.unitPrice * item.quantity,
    };
}

/**
 * Verifica se um produto ficará com estoque baixo após a venda.
 * Regra: estoque baixo quando o estoque restante fica <= o mínimo
 * configurado para o produto. Produtos sem mínimo definido (null) nunca
 * disparam o alerta.
 */
export function willBeLowStock(product) {
    if (product.maxStock == null || product.minStock == null) return false;
    const newStock = product.maxStock - product.quantity;
    return newStock <= product.minStock;
}

export function formatBRL(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

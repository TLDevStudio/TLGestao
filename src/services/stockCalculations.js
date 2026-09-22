/**
 * Regras de cálculo de estoque — TLGestão.
 *
 * Extraído de productService.js de propósito: funções puras, sem tocar
 * no Firestore, para permitir testar as regras de entrada/saída e alerta
 * de estoque baixo isoladamente. Veja stockCalculations.test.js.
 */

/**
 * Converte um ajuste de estoque ("entrada" ou "saída") em um delta
 * numérico (positivo para entrada, negativo para saída).
 */
export function computeStockDelta({ type, quantity }) {
    const qty = Number(quantity) || 0;
    const delta = type === "in" ? qty : -qty;
    // Evita retornar "-0" (tecnicamente diferente de 0 em algumas comparações
    // estritas), que pode confundir gráficos e comparações no restante do app.
    return delta === 0 ? 0 : delta;
}

/**
 * Verifica se um determinado nível de estoque é considerado baixo,
 * comparado ao mínimo configurado para o produto.
 * Produtos sem mínimo definido nunca disparam o alerta.
 */
export function isLowStock(stock, minStock) {
    return stock <= Number(minStock ?? 0);
}

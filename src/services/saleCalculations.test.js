import { describe, it, expect } from "vitest";
import {
    sumItems,
    computeSaleTotals,
    normalizeItem,
    willBeLowStock,
    formatBRL,
} from "./saleCalculations";

describe("sumItems", () => {
    it("soma preço x quantidade de vários itens", () => {
        const items = [
            { unitPrice: 10, quantity: 2 }, // 20
            { unitPrice: 5, quantity: 3 }, // 15
        ];
        expect(sumItems(items)).toBe(35);
    });

    it("retorna 0 para lista vazia ou indefinida", () => {
        expect(sumItems([])).toBe(0);
        expect(sumItems(undefined)).toBe(0);
    });
});

describe("computeSaleTotals", () => {
    it("soma produtos e serviços no subtotal", () => {
        const result = computeSaleTotals({
            products: [{ unitPrice: 50, quantity: 1 }],
            services: [{ unitPrice: 30, quantity: 2 }],
            discount: 0,
        });
        expect(result.subtotal).toBe(110);
        expect(result.total).toBe(110);
    });

    it("aplica o desconto corretamente", () => {
        const result = computeSaleTotals({
            products: [{ unitPrice: 100, quantity: 1 }],
            services: [],
            discount: 20,
        });
        expect(result.total).toBe(80);
    });

    it("nunca deixa o total ficar negativo, mesmo com desconto maior que o subtotal", () => {
        const result = computeSaleTotals({
            products: [{ unitPrice: 50, quantity: 1 }],
            services: [],
            discount: 999,
        });
        expect(result.total).toBe(0);
    });

    it("trata desconto inválido (string vazia, undefined) como zero", () => {
        const result = computeSaleTotals({
            products: [{ unitPrice: 50, quantity: 1 }],
            services: [],
            discount: undefined,
        });
        expect(result.discount).toBe(0);
        expect(result.total).toBe(50);
    });
});

describe("normalizeItem", () => {
    it("calcula o total do item (preço x quantidade)", () => {
        const item = { id: "p1", name: "Shampoo", type: "product", unitPrice: 25, quantity: 3 };
        expect(normalizeItem(item).total).toBe(75);
    });
});

describe("willBeLowStock", () => {
    it("acusa estoque baixo quando o restante fica no mínimo ou abaixo", () => {
        const product = { maxStock: 10, minStock: 3, quantity: 8 }; // restante: 2
        expect(willBeLowStock(product)).toBe(true);
    });

    it("não acusa estoque baixo quando ainda sobra acima do mínimo", () => {
        const product = { maxStock: 10, minStock: 3, quantity: 2 }; // restante: 8
        expect(willBeLowStock(product)).toBe(false);
    });

    it("nunca acusa estoque baixo se o produto não tem mínimo/máximo configurado", () => {
        expect(willBeLowStock({ maxStock: null, minStock: null, quantity: 5 })).toBe(false);
    });
});

describe("formatBRL", () => {
    it("formata número como moeda brasileira", () => {
        expect(formatBRL(1234.5)).toContain("1.234,50");
    });

    it("trata valores nulos/indefinidos como zero", () => {
        expect(formatBRL(null)).toContain("0,00");
        expect(formatBRL(undefined)).toContain("0,00");
    });
});

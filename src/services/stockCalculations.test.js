import { describe, it, expect } from "vitest";
import { computeStockDelta, isLowStock } from "./stockCalculations";

describe("computeStockDelta", () => {
    it("gera delta positivo para entrada de estoque", () => {
        expect(computeStockDelta({ type: "in", quantity: 10 })).toBe(10);
    });

    it("gera delta negativo para saída de estoque", () => {
        expect(computeStockDelta({ type: "out", quantity: 10 })).toBe(-10);
    });

    it("trata quantidade inválida como zero, sem quebrar", () => {
        expect(computeStockDelta({ type: "in", quantity: "abc" })).toBe(0);
        expect(computeStockDelta({ type: "out", quantity: undefined })).toBe(0);
    });
});

describe("isLowStock", () => {
    it("considera baixo quando o estoque é igual ao mínimo", () => {
        expect(isLowStock(5, 5)).toBe(true);
    });

    it("considera baixo quando o estoque é menor que o mínimo", () => {
        expect(isLowStock(2, 5)).toBe(true);
    });

    it("não considera baixo quando o estoque está acima do mínimo", () => {
        expect(isLowStock(10, 5)).toBe(false);
    });

    it("trata mínimo indefinido como zero", () => {
        expect(isLowStock(0, undefined)).toBe(true);
        expect(isLowStock(1, undefined)).toBe(false);
    });
});

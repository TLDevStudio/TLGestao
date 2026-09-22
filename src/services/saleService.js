import {
    collection,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { logActivity } from "./activityLogService";
import { createNotification } from "./notificationService";
import { computeSaleTotals, normalizeItem, willBeLowStock, formatBRL } from "./saleCalculations";

export const PAYMENT_METHODS = {
    cash: "Dinheiro",
    pix: "Pix",
    debit: "Débito",
    credit: "Crédito",
    other: "Outro",
};

/** Escuta as vendas do negócio, das mais recentes para as mais antigas. */
export function subscribeSales(businessId, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.SALES),
        where("businessId", "==", businessId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[TLGestão] Erro ao escutar vendas:", err);
            onError?.(err);
        }
    );
}

/**
 * Finaliza uma venda de forma ATÔMICA usando writeBatch.
 * Em uma única operação o sistema:
 *   1. cria o documento da venda
 *   2. cria um saleItem para cada produto/serviço vendido
 *   3. dá baixa no estoque de cada produto
 *   4. registra a receita em transactions (alimenta o Financeiro)
 *   5. atualiza totalGasto / visitas / última visita do cliente
 * Se qualquer etapa falhar, nada é gravado — evita estoque furado ou venda pela metade.
 *
 * Os cálculos de valores (subtotal, desconto, total) ficam em
 * saleCalculations.js, cobertos por testes automatizados.
 */
export async function finalizeSale(businessId, { client, products, services, discount, paymentMethod }) {
    const batch = writeBatch(db);
    const now = Timestamp.now();

    const { subtotal, total } = computeSaleTotals({ products, services, discount });

    // 1. Venda
    const saleRef = doc(collection(db, COLLECTIONS.SALES));
    batch.set(saleRef, {
        businessId,
        clientId: client?.id || null,
        clientName: client?.name || "Consumidor final",
        products: products.map(normalizeItem),
        services: services.map(normalizeItem),
        subtotal,
        discount: Number(discount) || 0,
        total,
        paymentMethod,
        createdAt: now,
        updatedAt: now,
    });

    // 2. Itens da venda (coleção separada, facilita relatórios por item)
    [...products, ...services].forEach((item) => {
        const itemRef = doc(collection(db, COLLECTIONS.SALE_ITEMS));
        batch.set(itemRef, {
            businessId,
            saleId: saleRef.id,
            itemId: item.id,
            name: item.name,
            type: item.type,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            total: item.unitPrice * item.quantity,
            createdAt: now,
        });
    });

    // 3. Baixa de estoque (somente produtos)
    products.forEach((product) => {
        const productRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
        batch.update(productRef, {
            stock: increment(-product.quantity),
            updatedAt: now,
        });
    });

    // 4. Receita no financeiro
    const transactionRef = doc(collection(db, COLLECTIONS.TRANSACTIONS));
    batch.set(transactionRef, {
        businessId,
        type: "income",
        category: "Venda",
        description: `Venda #${saleRef.id.slice(0, 6).toUpperCase()}`,
        amount: total,
        date: now,
        paymentMethod,
        status: "paid",
        saleId: saleRef.id,
        notes: "",
        createdAt: now,
        updatedAt: now,
    });

    // 5. Atualização do cliente
    if (client?.id) {
        const clientRef = doc(db, COLLECTIONS.CLIENTS, client.id);
        batch.update(clientRef, {
            totalSpent: increment(total),
            visitsCount: increment(1),
            lastVisitAt: now,
            updatedAt: now,
        });
    }

    await batch.commit();

    await logActivity(businessId, {
        action: "sale_completed",
        description: `Venda de ${formatBRL(total)} para "${client?.name || "Consumidor final"}"`,
    });

    // Confere se algum produto vendido ficou com estoque baixo após a baixa.
    for (const product of products) {
        if (willBeLowStock(product)) {
            const newStock = product.maxStock - product.quantity;
            await createNotification(businessId, {
                type: "low_stock",
                title: "Produto com estoque baixo",
                message: `"${product.name}" está com ${newStock} unidade(s) (mínimo: ${product.minStock})`,
            });
        }
    }

    return { saleId: saleRef.id, total };
}

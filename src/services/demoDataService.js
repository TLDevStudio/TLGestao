import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { logActivity } from "./activityLogService";
import { assertNotDemoAccount } from "../utils/demoGuard";

const DEMO_CLIENTS = [
    { name: "Ana Souza", phone: "(11) 98765-4321", email: "ana.souza@email.com" },
    { name: "Carlos Lima", phone: "(11) 91234-5678", email: "carlos.lima@email.com" },
    { name: "Beatriz Rocha", phone: "(11) 99887-6655", email: "beatriz.rocha@email.com" },
    { name: "Diego Alves", phone: "(11) 98221-3344", email: "diego.alves@email.com" },
    { name: "Fernanda Melo", phone: "(11) 97744-5566", email: "fernanda.melo@email.com" },
];

const DEMO_SERVICES = [
    { name: "Corte masculino", category: "Cabelo", price: 45, duration: 30 },
    { name: "Barba", category: "Barba", price: 30, duration: 20 },
    { name: "Corte + Barba", category: "Combo", price: 65, duration: 50 },
    { name: "Coloração", category: "Cabelo", price: 90, duration: 60 },
    { name: "Hidratação", category: "Cabelo", price: 40, duration: 40 },
    { name: "Sobrancelha", category: "Estética", price: 20, duration: 15 },
];

const DEMO_PRODUCTS = [
    { name: "Pomada modeladora", sku: "DEMO-POM01", category: "Cosméticos", costPrice: 15, salePrice: 35, stock: 12, minStock: 5 },
    { name: "Óleo para barba", sku: "DEMO-OLE02", category: "Cosméticos", costPrice: 12, salePrice: 28, stock: 3, minStock: 5 },
    { name: "Shampoo anticaspa", sku: "DEMO-SHA03", category: "Higiene", costPrice: 10, salePrice: 22, stock: 20, minStock: 8 },
    { name: "Cera modeladora", sku: "DEMO-CER04", category: "Cosméticos", costPrice: 14, salePrice: 32, stock: 15, minStock: 5 },
    { name: "Perfume masculino", sku: "DEMO-PER05", category: "Perfumaria", costPrice: 25, salePrice: 60, stock: 2, minStock: 5 },
    { name: "Kit barba completo", sku: "DEMO-KIT06", category: "Cosméticos", costPrice: 40, salePrice: 89, stock: 8, minStock: 3 },
];

const EXPENSE_TEMPLATES = [
    { description: "Aluguel do espaço", category: "Aluguel", amount: 1200, daysAgo: 28 },
    { description: "Conta de energia", category: "Energia", amount: 340, daysAgo: 20 },
    { description: "Internet e telefone", category: "Internet", amount: 150, daysAgo: 18 },
    { description: "Campanha nas redes sociais", category: "Marketing", amount: 200, daysAgo: 12 },
    { description: "Compra de insumos", category: "Fornecedor", amount: 450, daysAgo: 9 },
    { description: "Combustível", category: "Combustível", amount: 180, daysAgo: 3 },
];

const SALE_DAYS_AGO = [0, 1, 2, 4, 6, 9, 13, 17, 22, 27];
const PAYMENT_METHODS = ["cash", "pix", "debit", "credit"];

function daysAgoDate(n, hour = 14) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d;
}

/**
 * Popula a conta com dados fictícios de clientes, serviços, produtos, vendas,
 * despesas e agendamentos — tudo marcado com isDemo: true, para que possa ser
 * identificado e removido depois com removeDemoData().
 * Não é atômico de propósito: se algo falhar no meio, o que já foi criado
 * continua útil, e removeDemoData() limpa tudo de qualquer forma.
 */
export async function loadDemoData(businessId) {
    // 1. Clientes
    const clientRefs = [];
    for (const client of DEMO_CLIENTS) {
        const ref = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
            businessId,
            ...client,
            whatsapp: client.phone,
            cpf: "",
            birthDate: "",
            address: "",
            notes: "Cliente de demonstração.",
            totalSpent: 0,
            visitsCount: 0,
            lastVisitAt: null,
            isDemo: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        clientRefs.push({ id: ref.id, ...client });
    }

    // 2. Serviços
    const serviceRefs = [];
    for (const service of DEMO_SERVICES) {
        const ref = await addDoc(collection(db, COLLECTIONS.SERVICES), {
            businessId,
            ...service,
            description: "",
            active: true,
            isDemo: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        serviceRefs.push({ id: ref.id, ...service });
    }

    // 3. Produtos
    const productRefs = [];
    for (const product of DEMO_PRODUCTS) {
        const ref = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
            businessId,
            ...product,
            supplier: "Fornecedor Demonstração",
            description: "",
            photoUrl: null,
            isDemo: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        productRefs.push({ id: ref.id, ...product });
    }

    // 4. Vendas (associadas a clientes/serviços/produtos criados acima)
    const clientTotals = new Map(clientRefs.map((c) => [c.id, { totalSpent: 0, visitsCount: 0, lastVisitAt: null }]));

    for (let i = 0; i < SALE_DAYS_AGO.length; i++) {
        const client = clientRefs[i % clientRefs.length];
        const service = serviceRefs[i % serviceRefs.length];
        const includeProduct = i % 2 === 0;
        const product = includeProduct ? productRefs[i % productRefs.length] : null;
        const saleDate = daysAgoDate(SALE_DAYS_AGO[i], 10 + (i % 8));

        const services = [
            { id: service.id, name: service.name, type: "service", unitPrice: service.price, quantity: 1, total: service.price },
        ];
        const products = product
            ? [{ id: product.id, name: product.name, type: "product", unitPrice: product.salePrice, quantity: 1, total: product.salePrice }]
            : [];

        const subtotal = service.price + (product ? product.salePrice : 0);

        await addDoc(collection(db, COLLECTIONS.SALES), {
            businessId,
            clientId: client.id,
            clientName: client.name,
            services,
            products,
            subtotal,
            discount: 0,
            total: subtotal,
            paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
            isDemo: true,
            createdAt: Timestamp.fromDate(saleDate),
            updatedAt: Timestamp.fromDate(saleDate),
        });

        await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
            businessId,
            type: "income",
            category: "Venda",
            description: `Venda de demonstração — ${client.name}`,
            amount: subtotal,
            date: Timestamp.fromDate(saleDate),
            paymentMethod: PAYMENT_METHODS[i % PAYMENT_METHODS.length],
            status: "paid",
            notes: "",
            isDemo: true,
            createdAt: Timestamp.fromDate(saleDate),
            updatedAt: Timestamp.fromDate(saleDate),
        });

        const acc = clientTotals.get(client.id);
        acc.totalSpent += subtotal;
        acc.visitsCount += 1;
        if (!acc.lastVisitAt || saleDate > acc.lastVisitAt) acc.lastVisitAt = saleDate;
    }

    // Atualiza os totais dos clientes com base nas vendas de demonstração criadas
    for (const [clientId, totals] of clientTotals.entries()) {
        await updateDoc(doc(db, COLLECTIONS.CLIENTS, clientId), {
            totalSpent: totals.totalSpent,
            visitsCount: totals.visitsCount,
            lastVisitAt: totals.lastVisitAt ? Timestamp.fromDate(totals.lastVisitAt) : null,
            updatedAt: serverTimestamp(),
        });
    }

    // 5. Despesas
    for (const expense of EXPENSE_TEMPLATES) {
        const date = daysAgoDate(expense.daysAgo, 9);
        await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
            businessId,
            type: "expense",
            category: expense.category,
            description: expense.description,
            amount: expense.amount,
            date: Timestamp.fromDate(date),
            paymentMethod: "pix",
            status: "paid",
            notes: "",
            isDemo: true,
            createdAt: Timestamp.fromDate(date),
            updatedAt: Timestamp.fromDate(date),
        });
    }

    // 6. Agendamentos (passados concluídos, hoje, futuros e um cancelado)
    const appointmentPlans = [
        { daysOffset: -3, hour: 11, status: "completed" },
        { daysOffset: -1, hour: 15, status: "completed" },
        { daysOffset: 0, hour: 17, status: "confirmed" },
        { daysOffset: 1, hour: 10, status: "scheduled" },
        { daysOffset: 3, hour: 14, status: "scheduled" },
        { daysOffset: -2, hour: 9, status: "cancelled" },
    ];

    for (let i = 0; i < appointmentPlans.length; i++) {
        const plan = appointmentPlans[i];
        const client = clientRefs[i % clientRefs.length];
        const service = serviceRefs[i % serviceRefs.length];
        const date = daysAgoDate(-plan.daysOffset, plan.hour);

        await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
            businessId,
            clientId: client.id,
            clientName: client.name,
            serviceId: service.id,
            serviceName: service.name,
            date: Timestamp.fromDate(date),
            duration: service.duration,
            professional: "",
            notes: "Agendamento de demonstração.",
            status: plan.status,
            isDemo: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }

    await logActivity(businessId, {
        action: "demo_data_loaded",
        description: "Dados de demonstração carregados",
    });
}

/** Remove todos os documentos marcados com isDemo: true, em todas as coleções. */
export async function removeDemoData(businessId) {
    assertNotDemoAccount(businessId);
    const collectionsToClean = [
        COLLECTIONS.CLIENTS,
        COLLECTIONS.SERVICES,
        COLLECTIONS.PRODUCTS,
        COLLECTIONS.SALES,
        COLLECTIONS.TRANSACTIONS,
        COLLECTIONS.APPOINTMENTS,
    ];

    for (const collectionName of collectionsToClean) {
        const q = query(
            collection(db, collectionName),
            where("businessId", "==", businessId),
            where("isDemo", "==", true)
        );
        const snap = await getDocs(q);
        for (const docSnap of snap.docs) {
            await deleteDoc(docSnap.ref);
        }
    }

    await logActivity(businessId, {
        action: "demo_data_removed",
        description: "Dados de demonstração removidos",
    });
}

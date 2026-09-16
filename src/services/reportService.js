import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { daysAgo } from "../utils/formatters";

async function getSalesInRange(businessId, start, end) {
    const q = query(
        collection(db, COLLECTIONS.SALES),
        where("businessId", "==", businessId),
        where("createdAt", ">=", Timestamp.fromDate(start)),
        where("createdAt", "<=", Timestamp.fromDate(end))
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getTransactionsInRange(businessId, start, end) {
    const q = query(
        collection(db, COLLECTIONS.TRANSACTIONS),
        where("businessId", "==", businessId),
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end))
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getAllClients(businessId) {
    const q = query(collection(db, COLLECTIONS.CLIENTS), where("businessId", "==", businessId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getAllProducts(businessId) {
    const q = query(collection(db, COLLECTIONS.PRODUCTS), where("businessId", "==", businessId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFinancialReport(businessId, start, end) {
    const transactions = await getTransactionsInRange(businessId, start, end);
    const income = sumWhere(transactions, (t) => t.type === "income");
    const expense = sumWhere(transactions, (t) => t.type === "expense");
    const profit = income - expense;
    const margin = income > 0 ? (profit / income) * 100 : 0;
    return { income, expense, profit, margin };
}

export async function getClientsReport(businessId, start, end) {
    const clients = await getAllClients(businessId);

    const newClients = clients.filter((c) => {
        const created = c.createdAt?.toDate?.();
        return created && created >= start && created <= end;
    }).length;

    const recurring = clients.filter((c) => Number(c.visitsCount) >= 2).length;

    const sixtyDaysAgo = daysAgo(60);
    const inactive = clients.filter((c) => {
        const lastVisit = c.lastVisitAt?.toDate?.();
        return lastVisit ? lastVisit < sixtyDaysAgo : Number(c.visitsCount) > 0;
    });

    const topSpenders = [...clients]
        .sort((a, b) => (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0))
        .slice(0, 10)
        .filter((c) => Number(c.totalSpent) > 0);

    return {
        newClients,
        recurringCount: recurring,
        inactiveClients: inactive,
        topSpenders,
        totalClients: clients.length,
    };
}

export async function getServicesReport(businessId, start, end) {
    const sales = await getSalesInRange(businessId, start, end);
    const map = new Map();

    sales.forEach((sale) => {
        (sale.services || []).forEach((item) => {
            const current = map.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
            current.quantity += item.quantity || 0;
            current.revenue += item.total || item.unitPrice * item.quantity || 0;
            map.set(item.name, current);
        });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getProductsReport(businessId, start, end) {
    const [sales, products] = await Promise.all([
        getSalesInRange(businessId, start, end),
        getAllProducts(businessId),
    ]);

    const soldMap = new Map();
    sales.forEach((sale) => {
        (sale.products || []).forEach((item) => {
            const current = soldMap.get(item.name) || { name: item.name, quantity: 0, revenue: 0 };
            current.quantity += item.quantity || 0;
            current.revenue += item.total || item.unitPrice * item.quantity || 0;
            soldMap.set(item.name, current);
        });
    });

    const topSold = Array.from(soldMap.values()).sort((a, b) => b.quantity - a.quantity);

    const lowStock = products.filter((p) => Number(p.stock) <= Number(p.minStock ?? 0));

    const totalStockValue = products.reduce(
        (acc, p) => acc + Number(p.stock || 0) * Number(p.costPrice || 0),
        0
    );

    return { topSold, lowStock, totalStockValue, totalProducts: products.length };
}

function sumWhere(list, predicate) {
    return list.filter(predicate).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
}

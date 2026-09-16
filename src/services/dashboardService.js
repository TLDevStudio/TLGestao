import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { daysAgo, startOfDay, startOfMonth } from "../utils/formatters";

/**
 * Busca as vendas do usuário dentro de um intervalo de datas.
 * Todas as consultas são filtradas por businessId para garantir
 * que cada usuário só acesse os próprios dados (reforçado também
 * pelas Firestore Security Rules).
 */
async function getSalesSince(businessId, since) {
  const q = query(
    collection(db, COLLECTIONS.SALES),
    where("businessId", "==", businessId),
    where("createdAt", ">=", Timestamp.fromDate(since))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getTransactionsSince(businessId, since) {
  const q = query(
    collection(db, COLLECTIONS.TRANSACTIONS),
    where("businessId", "==", businessId),
    where("date", ">=", Timestamp.fromDate(since))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getClientsCount(businessId) {
  const q = query(collection(db, COLLECTIONS.CLIENTS), where("businessId", "==", businessId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getAppointmentsForDay(businessId, day) {
  const start = startOfDay(day);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where("businessId", "==", businessId),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<", Timestamp.fromDate(end))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getLowStockProducts(businessId) {
  const q = query(collection(db, COLLECTIONS.PRODUCTS), where("businessId", "==", businessId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => Number(p.stock) <= Number(p.minStock ?? 0));
}

/**
 * Monta todos os dados necessários para o Dashboard a partir do Firestore.
 * Retorna zeros/listas vazias quando o negócio ainda não tem dados —
 * a UI trata isso com empty states, nunca com dados fictícios.
 */
export async function getDashboardData(businessId) {
  const today = startOfDay();
  const monthStart = startOfMonth();
  const sevenDaysAgo = daysAgo(6); // inclui hoje = 7 dias

  const [salesMonth, salesWeek, expensesMonth, clients, appointmentsToday, lowStock] =
    await Promise.all([
      getSalesSince(businessId, monthStart),
      getSalesSince(businessId, sevenDaysAgo),
      getTransactionsSince(businessId, monthStart),
      getClientsCount(businessId),
      getAppointmentsForDay(businessId, today),
      getLowStockProducts(businessId),
    ]);

  const expensesOnly = expensesMonth.filter((t) => t.type === "expense");

  const revenueToday = sumWhereSameDay(salesMonth, today);
  const revenueMonth = sumField(salesMonth, "total");
  const expensesTotal = sumField(expensesOnly, "amount");
  const profit = revenueMonth - expensesTotal;

  const servicesCount = countLineItems(salesMonth, "services");
  const productsCount = countLineItems(salesMonth, "products");

  return {
    revenueToday,
    revenueMonth,
    expensesMonth: expensesTotal,
    profit,
    clientsCount: clients.length,
    appointmentsToday: appointmentsToday.length,
    servicesCount,
    productsCount,
    lowStockProducts: lowStock,
    charts: {
      revenueLast7Days: buildLast7DaysSeries(salesWeek),
      topServices: buildTopItems(salesMonth, "services"),
      topProducts: buildTopItems(salesMonth, "products"),
    },
  };
}

// ---- helpers de agregação ----

function sumField(list, field) {
  return list.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

function sumWhereSameDay(sales, day) {
  const start = startOfDay(day).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return sales
    .filter((s) => {
      const t = s.createdAt?.toDate ? s.createdAt.toDate().getTime() : null;
      return t !== null && t >= start && t < end;
    })
    .reduce((acc, s) => acc + (Number(s.total) || 0), 0);
}

function countLineItems(sales, key) {
  return sales.reduce((acc, s) => acc + (Array.isArray(s[key]) ? s[key].length : 0), 0);
}

function buildLast7DaysSeries(sales) {
  const days = Array.from({ length: 7 }).map((_, i) => daysAgo(6 - i));
  return days.map((day) => ({
    label: day.toLocaleDateString("pt-BR", { weekday: "short" }),
    total: sumWhereSameDay(sales, day),
  }));
}

function buildTopItems(sales, key) {
  const totals = new Map();
  sales.forEach((sale) => {
    (sale[key] || []).forEach((item) => {
      const name = item.name || "Sem nome";
      totals.set(name, (totals.get(name) || 0) + (Number(item.total) || 0));
    });
  });
  return Array.from(totals.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeTransactionsInRange } from "../services/transactionService";
import { getPeriodRange } from "../utils/periodHelpers";

export function useTransactions({ period = "month", customStart, customEnd, typeFilter = "all" }) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { start, end } = useMemo(
        () => getPeriodRange(period, customStart, customEnd),
        [period, customStart, customEnd]
    );

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeTransactionsInRange(
            user.uid,
            start,
            end,
            (list) => {
                setTransactions(list.map((t) => ({ ...t, dateObj: t.date?.toDate?.() || null })));
                setLoading(false);
            },
            () => {
                setError("Não foi possível carregar os lançamentos.");
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user, start, end]);

    const totals = useMemo(() => {
        const income = transactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const expense = transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        return { income, expense, balance: income - expense };
    }, [transactions]);

    /** Agrupa despesas por categoria — usado no resumo visual. */
    const expensesByCategory = useMemo(() => {
        const map = new Map();
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                map.set(t.category, (map.get(t.category) || 0) + (Number(t.amount) || 0));
            });
        return Array.from(map.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        if (typeFilter === "all") return transactions;
        return transactions.filter((t) => t.type === typeFilter);
    }, [transactions, typeFilter]);

    return {
        transactions: filteredTransactions,
        allCount: transactions.length,
        totals,
        expensesByCategory,
        loading,
        error,
    };
}

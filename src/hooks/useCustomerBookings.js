import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { useCustomerAuth } from "./useCustomerAuth";

export function useCustomerBookings() {
    const { user } = useCustomerAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            setAppointments([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, COLLECTIONS.APPOINTMENTS),
            where("customerUid", "==", user.uid),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (err) => {
                console.error("[TLGestão] Erro ao carregar agendamentos do cliente:", err);
                setError(err);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [user]);

    const now = new Date();
    const upcoming = appointments.filter(
        (a) => a.status !== "cancelled" && a.date?.toDate && a.date.toDate() >= now
    );
    const history = appointments.filter(
        (a) => a.status === "cancelled" || !a.date?.toDate || a.date.toDate() < now
    );

    return { appointments, upcoming, history, loading, error };
}
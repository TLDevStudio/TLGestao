import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeAppointmentsInRange } from "../services/appointmentService";
import { getRangeForView, getDaysInRange, navigateDate } from "../utils/dateHelpers";

export function useAppointments(view, referenceDate) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { start, end } = useMemo(() => getRangeForView(view, referenceDate), [view, referenceDate]);
    const days = useMemo(() => getDaysInRange(start, end), [start, end]);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const unsubscribe = subscribeAppointmentsInRange(
            user.uid,
            start,
            end,
            (list) => {
                // O Firestore armazena Timestamp; convertendo para Date facilita a UI.
                setAppointments(list.map((a) => ({ ...a, dateObj: a.date?.toDate?.() || null })));
                setLoading(false);
            },
            () => {
                setError("Não foi possível carregar os agendamentos.");
                setLoading(false);
            }
        );
        return unsubscribe;
    }, [user, start, end]);

    return { appointments, days, start, end, loading, error };
}

export function useCalendarNavigation(initialView = "day") {
    const [view, setView] = useState(initialView);
    const [referenceDate, setReferenceDate] = useState(new Date());

    const goToday = () => setReferenceDate(new Date());
    const goNext = () => setReferenceDate((d) => navigateDate(view, d, "next"));
    const goPrev = () => setReferenceDate((d) => navigateDate(view, d, "prev"));
    const goToDate = (date) => setReferenceDate(date);

    return { view, setView, referenceDate, goToday, goNext, goPrev, goToDate };
}

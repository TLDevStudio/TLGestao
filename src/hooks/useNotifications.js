import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { subscribeNotifications } from "../services/notificationService";

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeNotifications(
            user.uid,
            (list) => {
                setNotifications(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return unsubscribe;
    }, [user]);

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
    const unreadIds = useMemo(() => notifications.filter((n) => !n.read).map((n) => n.id), [notifications]);

    return { notifications, unreadCount, unreadIds, loading };
}

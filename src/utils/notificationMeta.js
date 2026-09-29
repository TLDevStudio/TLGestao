import { AlertTriangle, CalendarCheck, CalendarPlus, CalendarX, Bell } from "lucide-react";

export const NOTIFICATION_META = {
    low_stock: { icon: AlertTriangle, tone: "amber", emoji: "⚠️" },
    appointment_today: { icon: CalendarCheck, tone: "pine", emoji: "📅" },
    appointment_cancelled: { icon: CalendarX, tone: "danger", emoji: "❌" },
    appointment_online: { icon: CalendarPlus, tone: "pine", emoji: "🗓️" },
};

export function getNotificationMeta(type) {
    return NOTIFICATION_META[type] || { icon: Bell, tone: "neutral", emoji: "🔔" };
}

import { AlertTriangle, CalendarCheck, CalendarX, Bell } from "lucide-react";

/**
 * Tipos de notificação geradas automaticamente pelo sistema.
 * "Meta mensal atingida" e "Agendamento próximo" (lembrete por horário) ficam
 * de fora por enquanto: a primeira depende de uma funcionalidade de metas que
 * ainda não existe, e a segunda exigiria um agendador em segundo plano
 * (Cloud Functions), que foge do escopo de um app 100% frontend + Firestore.
 */
export const NOTIFICATION_META = {
    low_stock: { icon: AlertTriangle, tone: "amber", emoji: "⚠️" },
    appointment_today: { icon: CalendarCheck, tone: "pine", emoji: "📅" },
    appointment_cancelled: { icon: CalendarX, tone: "danger", emoji: "❌" },
};

export function getNotificationMeta(type) {
    return NOTIFICATION_META[type] || { icon: Bell, tone: "neutral", emoji: "🔔" };
}

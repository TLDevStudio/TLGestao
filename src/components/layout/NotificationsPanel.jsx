import { useEffect, useRef } from "react";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../contexts/AuthContext";
import {
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../../services/notificationService";
import { getNotificationMeta } from "../../utils/notificationMeta";
import { formatDateTime } from "../../utils/formatters";

const TONE_BG = {
    amber: "bg-amber-100 text-amber-600",
    pine: "bg-pine-900/10 text-pine-800",
    danger: "bg-danger-100 text-danger",
    neutral: "bg-paper-dim text-ink-soft",
};

export default function NotificationsPanel({ open, onClose }) {
    const { user } = useAuth();
    const { notifications, unreadIds, loading } = useNotifications();
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, [open, onClose]);

    if (!open) return null;

    const handleMarkAllRead = () => {
        if (unreadIds.length > 0) {
            markAllAsRead(user.uid, unreadIds);
        }
    };

    return (
        <div
            ref={panelRef}
            className="
                notifications-panel
                absolute
                right-0
                top-full
                z-40
                mt-2
                w-[340px]
                max-w-[90vw]
                overflow-hidden
                rounded-2xl
                border
                border-line
                bg-surface
                shadow-xl
            "
        >
            {/* Cabeçalho */}
            <div
                className="
                    notifications-panel-header
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-line
                    px-4
                    py-3
                "
            >
                <h3 className="min-w-0 truncate font-display text-sm font-semibold text-ink">
                    Notificações
                </h3>

                {unreadIds.length > 0 && (
                    <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="
                            notifications-mark-all
                            flex
                            min-w-0
                            shrink
                            items-center
                            gap-1
                            rounded-lg
                            px-1
                            text-xs
                            font-medium
                            text-pine-800
                            transition
                            hover:underline
                        "
                    >
                        <CheckCheck
                            size={13}
                            className="shrink-0"
                        />

                        <span className="truncate">
                            Marcar todas como lidas
                        </span>
                    </button>
                )}
            </div>

            {/* Lista */}
            <div className="notifications-list max-h-[360px] overflow-y-auto">
                {loading && (
                    <p className="px-4 py-8 text-center text-sm text-ink-soft">
                        Carregando...
                    </p>
                )}

                {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                        <Bell
                            size={22}
                            className="text-ink-soft"
                        />

                        <p className="text-sm text-ink-soft">
                            Nenhuma notificação por aqui.
                        </p>
                    </div>
                )}

                {!loading &&
                    notifications.map((n) => {
                        const meta = getNotificationMeta(n.type);
                        const Icon = meta.icon;

                        return (
                            <div
                                key={n.id}
                                className={`
                                    notification-item
                                    flex
                                    min-w-0
                                    items-start
                                    gap-3
                                    border-b
                                    border-line
                                    px-4
                                    py-3
                                    last:border-0
                                    ${!n.read
                                        ? "bg-pine-900/[0.03]"
                                        : ""
                                    }
                                `}
                            >
                                {/* Ícone */}
                                <div
                                    className={`
                                        mt-0.5
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        ${TONE_BG[meta.tone]}
                                    `}
                                >
                                    <Icon size={14} />
                                </div>

                                {/* Conteúdo */}
                                <div className="notification-content min-w-0 flex-1">
                                    <p className="break-words text-sm font-medium text-ink">
                                        {n.title}
                                    </p>

                                    <p className="break-words text-xs text-ink-soft">
                                        {n.message}
                                    </p>

                                    <p className="mt-0.5 break-words text-[11px] text-ink-soft/70">
                                        {formatDateTime(n.createdAt)}
                                    </p>
                                </div>

                                {/* Ações */}
                                <div className="notification-actions flex shrink-0 flex-col gap-1">
                                    {!n.read && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                markAsRead(n.id)
                                            }
                                            className="
                                                rounded-lg
                                                p-1.5
                                                text-ink-soft
                                                transition
                                                hover:bg-paper-dim
                                                hover:text-ink
                                            "
                                            aria-label="Marcar como lida"
                                            title="Marcar como lida"
                                        >
                                            <Check size={13} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteNotification(n.id)
                                        }
                                        className="
                                            rounded-lg
                                            p-1.5
                                            text-ink-soft
                                            transition
                                            hover:bg-danger-100
                                            hover:text-danger
                                        "
                                        aria-label="Excluir notificação"
                                        title="Excluir"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
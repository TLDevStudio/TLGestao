import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import NotificationsPanel from "./NotificationsPanel";

export default function Header({ title, onMenuClick }) {
  const { business, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const initials = (business?.ownerName || user?.displayName || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-ink hover:bg-paper-dim lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((v) => !v)}
            className="relative rounded-lg p-2 text-ink-soft hover:bg-paper-dim hover:text-ink"
            aria-label="Notificações"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-pine-950">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pine-900 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium leading-tight text-ink">
              {business?.ownerName || user?.displayName || "Usuário"}
            </p>
            <p className="text-[11px] leading-tight text-ink-soft">
              {business?.businessName || "Meu negócio"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

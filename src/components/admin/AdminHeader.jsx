import { Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminHeader({ title, onMenuClick }) {
    const { user } = useAuth();

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

            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface py-1.5 pl-3 pr-3">
                <span className="text-xs font-medium text-ink-soft">{user?.email}</span>
            </div>
        </header>
    );
}
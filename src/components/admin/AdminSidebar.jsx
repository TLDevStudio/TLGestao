import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, History, ShieldAlert, LogOut, ShieldCheck, X } from "lucide-react";
import { logout } from "../../services/authService";
import { useToast } from "../../contexts/ToastContext";

const ADMIN_NAV_ITEMS = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/contas", label: "Contas", icon: Users },
    { to: "/admin/logs", label: "Logs administrativos", icon: History },
    { to: "/admin/seguranca", label: "Segurança", icon: ShieldAlert },
];

/**
 * Sidebar exclusiva do painel administrativo. Não importa nada do
 * Sidebar do cliente e não aparece em nenhuma rota de /app/* — são
 * áreas completamente separadas visualmente, para não haver confusão
 * sobre em qual ambiente a pessoa está.
 */
export default function AdminSidebar({ open, onClose }) {
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Mesma ordem usada na área do cliente (Fase 6): navega antes de
        // encerrar a sessão, para não disputar redirecionamento com o AdminGuard.
        navigate("/", { replace: true });
        try {
            await logout();
        } catch {
            toast.error("Não foi possível sair. Tente novamente.");
        }
    };

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed lg:sticky top-0 z-50 flex h-screen w-[248px] shrink-0 flex-col bg-ink text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between px-5 py-6">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger text-white">
                            <ShieldCheck size={18} />
                        </div>
                        <div className="leading-tight">
                            <span className="block font-display text-base font-semibold tracking-tight">
                                TLGestão
                            </span>
                            <span className="block text-[11px] uppercase tracking-wider text-amber-400">
                                Painel admin
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white lg:hidden"
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
                    {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/65 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-3">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <LogOut size={18} />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
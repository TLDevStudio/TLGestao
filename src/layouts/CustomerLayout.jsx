import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CalendarCheck, LogOut, User } from "lucide-react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { logoutCustomer } from "../services/customerAuthService";

const NAV_ITEMS = [
    { to: "/cliente/meus-agendamentos", label: "Meus agendamentos", icon: CalendarCheck },
    { to: "/cliente/perfil", label: "Meu perfil", icon: User },
];

/**
 * Layout próprio do Portal do Cliente. De propósito NÃO reaproveita
 * <Sidebar>/<Header> do empreendedor (seção 3 do documento original pede
 * uma experiência visual separada) — só os átomos de UI (cores, tipografia
 * via classes já existentes no projeto) para manter consistência visual
 * sem herdar a estrutura de navegação do painel administrativo.
 */
export default function CustomerLayout() {
    const { customerProfile } = useCustomerAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logoutCustomer();
        navigate("/cliente/entrar", { replace: true });
    };

    return (
        <div className="flex min-h-screen flex-col bg-paper">
            <header className="border-b border-line bg-surface">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
                    <Link to="/cliente/meus-agendamentos" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine-900 font-display text-sm font-bold text-white">
                            TL
                        </div>
                        <span className="font-display text-base font-semibold text-ink">Portal do Cliente</span>
                    </Link>

                    <nav className="hidden items-center gap-1 sm:flex">
                        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                            const active = location.pathname === to;
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-pine-900/10 text-pine-900" : "text-ink-soft hover:bg-paper-dim"
                                        }`}
                                >
                                    <Icon size={16} />
                                    {label}
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-dim"
                        >
                            <LogOut size={16} />
                            Sair
                        </button>
                    </nav>

                    {customerProfile && (
                        <div className="hidden text-right sm:block">
                            <p className="text-xs text-ink-soft">Olá,</p>
                            <p className="max-w-[140px] truncate text-sm font-medium text-ink">
                                {customerProfile.name?.split(" ")[0]}
                            </p>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
                <Outlet />
            </main>

            {/* Navegação inferior fixa no celular — evita depender só do menu de cima */}
            <nav className="sticky bottom-0 flex border-t border-line bg-surface sm:hidden">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                    const active = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${active ? "text-pine-900" : "text-ink-soft"
                                }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    );
                })}
                <button onClick={handleLogout} className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-ink-soft">
                    <LogOut size={18} />
                    Sair
                </button>
            </nav>
        </div>
    );
}
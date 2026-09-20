import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Scissors,
  Package,
  ShoppingCart,
  Wallet,
  BarChart3,
  History,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "../../services/authService";
import { useToast } from "../../contexts/ToastContext";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/agendamentos", label: "Agendamentos", icon: CalendarClock },
  { to: "/app/servicos", label: "Serviços", icon: Scissors },
  { to: "/app/produtos", label: "Produtos", icon: Package },
  { to: "/app/vendas", label: "Vendas", icon: ShoppingCart },
  { to: "/app/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Navega para a Landing ANTES de encerrar a sessão. Se fizéssemos
    // ao contrário, o PrivateRoute detecta a troca de estado de auth
    // (via onAuthStateChanged) e pode redirecionar para "/entrar" antes
    // do nosso navigate("/") ser processado — uma corrida entre dois
    // redirecionamentos que, dependendo do timing, deixava a pessoa no
    // login em vez da Landing Page. Saindo primeiro da rota protegida,
    // esse redirecionamento concorrente nunca chega a disparar.
    navigate("/", { replace: true });
    try {
      await logout();
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  };

  return (
    <>
      {/* overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 flex h-screen w-[248px] shrink-0 flex-col bg-pine-900 text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-display font-bold text-pine-950">
              TL
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              TLGestão
            </span>
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
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-surface/10 text-white"
                  : "text-white/65 hover:bg-surface/5 hover:text-white"
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-surface/5 hover:text-white"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

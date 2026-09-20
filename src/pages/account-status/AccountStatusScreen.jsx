import { LogOut, Clock, ShieldAlert, PauseCircle, AlertTriangle } from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../contexts/AuthContext";
import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const ICONS = {
    warning: Clock,
    danger: ShieldAlert,
    neutral: PauseCircle,
    error: AlertTriangle,
};

const ICON_TONES = {
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-danger-100 text-danger",
    neutral: "bg-paper-dim text-ink-soft",
    error: "bg-danger-100 text-danger",
};

const BADGE_TONES = {
    warning: "amber",
    danger: "danger",
    neutral: "neutral",
    error: "danger",
};

/**
 * Tela genérica usada por PendingAccount, BlockedAccount e InactiveAccount.
 * Mantém uma única estrutura visual — cada tela específica só passa
 * título, mensagem e tom.
 */
export default function AccountStatusScreen({
    icon,
    tone = "neutral",
    title,
    message,
    statusLabel,
    showBusinessInfo = true,
}) {
    const { business } = useAuth();
    const navigate = useNavigate();
    const Icon = icon || ICONS[tone] || ICONS.neutral;

    async function handleLogout() {
        // Mesma ordem usada no Sidebar e em Configurações: navega antes de
        // encerrar a sessão, para não disputar redirecionamento com o
        // PrivateRoute/AccountStatusGuard.
        navigate("/", { replace: true });
        await logout();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
            <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
                <div
                    className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${ICON_TONES[tone]}`}
                >
                    <Icon size={26} />
                </div>

                <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>

                {showBusinessInfo && business && (
                    <div className="mt-6 space-y-2 rounded-xl bg-paper-dim p-4 text-left text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-ink-soft">Empresa</span>
                            <span className="font-medium text-ink">{business.businessName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-ink-soft">E-mail</span>
                            <span className="font-medium text-ink">{business.email}</span>
                        </div>
                        {statusLabel && (
                            <div className="flex items-center justify-between">
                                <span className="text-ink-soft">Status</span>
                                <Badge tone={BADGE_TONES[tone]}>{statusLabel}</Badge>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    variant="outline"
                    className="mt-6 w-full"
                    icon={LogOut}
                    onClick={handleLogout}
                >
                    Sair
                </Button>
            </div>
        </div>
    );
}

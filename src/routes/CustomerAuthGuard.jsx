import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { FullPageLoading } from "../components/ui/Loading";
import Button from "../components/ui/Button";

export default function CustomerAuthGuard({ children }) {
    const { isAuthenticated, isBusinessAccount, hasCompletedProfile, loading } = useCustomerAuth();
    const location = useLocation();

    if (loading) return <FullPageLoading label="Carregando sua conta..." />;

    if (!isAuthenticated) {
        return <Navigate to="/cliente/entrar" state={{ from: location }} replace />;
    }

    if (isBusinessAccount) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper px-6">
                <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
                    <h1 className="font-display text-lg font-semibold text-ink">Esta é uma conta de empresa</h1>
                    <p className="mt-2 text-sm text-ink-soft">
                        O e-mail logado neste navegador pertence a uma conta de empresa do TLGestão, não a uma
                        conta de cliente. Para agendar como cliente, saia e entre com outro e-mail.
                    </p>
                    <div className="mt-6 flex flex-col gap-2">
                        <a href="/app/dashboard">
                            <Button variant="primary" className="w-full">
                                Ir para o painel da empresa
                            </Button>
                        </a>
                        <a href="/cliente/entrar">
                            <Button variant="outline" className="w-full">
                                Entrar com outra conta
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasCompletedProfile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper px-6">
                <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
                    <h1 className="font-display text-lg font-semibold text-ink">Cadastro incompleto</h1>
                    <p className="mt-2 text-sm text-ink-soft">
                        Não encontramos seus dados de cliente. Isso pode acontecer se o cadastro foi
                        interrompido no meio do caminho — tente criar a conta novamente.
                    </p>
                    <a href="/cliente/criar-conta">
                        <Button variant="primary" className="mt-6 w-full">
                            Completar cadastro
                        </Button>
                    </a>
                </div>
            </div>
        );
    }

    return children;
}
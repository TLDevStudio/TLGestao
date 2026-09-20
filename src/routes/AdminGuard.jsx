import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageLoading } from "../components/ui/Loading";
import { isAdmin } from "../utils/accountStatus";
import { subscribeAdminAccess } from "../services/adminAccessService";

/**
 * Protege as rotas /admin/*.
 *
 * Camadas, nesta ordem:
 * 1. Precisa estar autenticado (senão -> /admin/login).
 * 2. Precisa ter role "admin" no documento businesses/{uid} (Fase 1).
 * 3. O interruptor global (systemConfig/adminAccess.enabled) precisa
 *    estar ligado — esse é o controle manual criado na Fase 8: só uma
 *    conta admin consegue ligá-lo/desligá-lo (tela em /admin/seguranca),
 *    e a regra do Firestore garante que mais ninguém consegue escrever
 *    nesse documento.
 *
 * IMPORTANTE: isto é só a camada de UX (evita renderizar a tela pra
 * quem não deveria ver). A garantia de verdade contra alguém lendo
 * dados administrativos direto do Firestore vem das regras de
 * segurança — nunca confiar só nisso aqui.
 */
export default function AdminGuard({ children }) {
    const { user, business, loading } = useAuth();
    const location = useLocation();
    const admin = isAdmin(business);

    // null = ainda não sabemos (carregando); só começamos a escutar
    // depois de confirmar que é admin, pra não gerar leituras negadas
    // desnecessárias no console para contas comuns.
    const [access, setAccess] = useState(null);

    useEffect(() => {
        if (!admin) return undefined;
        const unsubscribe = subscribeAdminAccess(setAccess);
        return unsubscribe;
    }, [admin]);

    if (loading) return <FullPageLoading label="Verificando permissões..." />;

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (!admin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper px-6">
                <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
                    <h1 className="font-display text-lg font-semibold text-ink">Acesso restrito</h1>
                    <p className="mt-2 text-sm text-ink-soft">
                        Esta conta não tem permissão para acessar o painel administrativo.
                    </p>
                    <a
                        href="/"
                        className="mt-6 inline-block rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-dim"
                    >
                        Voltar ao início
                    </a>
                </div>
            </div >
        );
    }

    if (access === null) {
        return <FullPageLoading label="Verificando acesso administrativo..." />;
    }

    if (access.enabled === false) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-paper px-6">
                <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
                    <h1 className="font-display text-lg font-semibold text-ink">
                        Painel administrativo desativado
                    </h1>
                    <p className="mt-2 text-sm text-ink-soft">
                        O acesso ao painel foi desligado manualmente. Isso bloqueia
                        até quem é administrador — inclusive você, agora. Para
                        reativar, abra o Firestore Console e mude o campo{" "}
                        <code className="rounded bg-paper-dim px-1">enabled</code> para{" "}
                        <code className="rounded bg-paper-dim px-1">true</code> no
                        documento <code className="rounded bg-paper-dim px-1">systemConfig/adminAccess</code>.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
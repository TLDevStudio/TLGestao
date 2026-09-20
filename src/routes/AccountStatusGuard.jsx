import { useAuth } from "../contexts/AuthContext";
import { FullPageLoading } from "../components/ui/Loading";
import {
    isAccountActive,
    isAccountPending,
    isAccountBlocked,
    isAccountInactive,
} from "../utils/accountStatus";
import PendingAccount from "../pages/account-status/PendingAccount";
import BlockedAccount from "../pages/account-status/BlockedAccount";
import InactiveAccount from "../pages/account-status/InactiveAccount";
import AccountStatusScreen from "../pages/account-status/AccountStatusScreen";

/**
 * Decide o que renderizar dentro da área logada com base no `accountStatus`
 * do documento em `businesses/{uid}`.
 *
 * Deve ficar DENTRO de <PrivateRoute> (que já garante usuário autenticado).
 * O `business` vem do AuthContext, que escuta o documento em tempo real
 * (onSnapshot) — então se o administrador mudar o status enquanto a pessoa
 * está com o sistema aberto, esta tela reage sozinha, sem precisar de F5.
 */
export default function AccountStatusGuard({ children }) {
    const { business, loading } = useAuth();

    if (loading) return <FullPageLoading label="Verificando sua conta..." />;

    // Caso raro: usuário autenticado mas sem documento de negócio (ex: conta
    // excluída administrativamente enquanto a sessão ainda estava aberta).
    if (!business) {
        return (
            <AccountStatusScreen
                tone="error"
                title="Não encontramos sua conta"
                message="Não localizamos os dados da sua conta. Se você acredita que isso é um engano, entre em contato com o administrador."
                showBusinessInfo={false}
            />
        );
    }

    if (isAccountPending(business)) return <PendingAccount />;
    if (isAccountBlocked(business)) return <BlockedAccount />;
    if (isAccountInactive(business)) return <InactiveAccount />;

    if (isAccountActive(business)) return children;

    // Fallback de segurança: qualquer status não reconhecido não libera acesso.
    return (
        <AccountStatusScreen
            tone="error"
            title="Não foi possível verificar sua conta"
            message="Ocorreu um problema ao verificar o status da sua conta. Tente novamente ou contate o administrador."
        />
    );
}

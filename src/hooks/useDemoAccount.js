import { useAuth } from "../contexts/AuthContext";
import { isDemoBusinessId } from "../utils/demoGuard";

/**
 * true quando o usuário logado é a conta de demonstração pública.
 * Usado nas telas para desabilitar/ocultar ações destrutivas ou
 * críticas antes mesmo de chamar o service (a proteção real fica nas
 * regras do Firestore — isso aqui é só UX).
 */
export default function useIsDemoAccount() {
    const { user } = useAuth();
    return isDemoBusinessId(user?.uid);
}

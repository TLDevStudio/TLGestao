import { DEMO_CONFIG } from "../config/demo";

export const DEMO_DISABLED_MESSAGE =
    "Esta ação está desabilitada no modo demonstração.";

/**
 * true quando o id de negócio informado é o da conta de demonstração
 * pública (ver src/config/demo.js).
 *
 * Como neste projeto o documento de `businesses` usa o próprio uid do
 * Firebase Auth como id, basta comparar o businessId/uid com
 * DEMO_CONFIG.uid — não precisa carregar o documento inteiro.
 */
export function isDemoBusinessId(businessId) {
    return !!businessId && !!DEMO_CONFIG.uid && businessId === DEMO_CONFIG.uid;
}

/**
 * Lança um erro amigável quando uma ação destrutiva/crítica é tentada
 * na conta de demonstração. Os services chamam isso logo no início de
 * qualquer delete ou alteração crítica.
 *
 * IMPORTANTE: isso é só a camada de UX (evita a chamada e mostra uma
 * mensagem clara). A proteção de verdade contra alguém tentando burlar
 * isso pelo DevTools/console vem das regras do Firestore (Fase 12).
 */
export function assertNotDemoAccount(businessId) {
    if (isDemoBusinessId(businessId)) {
        const error = new Error(DEMO_DISABLED_MESSAGE);
        error.code = "demo/action-disabled";
        throw error;
    }
}

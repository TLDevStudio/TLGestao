import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN;
const ENABLED = Boolean(DSN) && import.meta.env.PROD;

export function initSentry() {
    if (!ENABLED) {
        if (import.meta.env.DEV) {
            console.info("[TLGestão] Sentry desativado em desenvolvimento.");
        }
        return;
    }

    Sentry.init({
        dsn: DSN,
        environment: import.meta.env.MODE,
        // Amostragem baixa de performance para não estourar o limite mensal
        // gratuito (5k erros / 10k transações por mês no plano Free).
        tracesSampleRate: 0.1,
        integrations: [],
    });
}

/**
 * Envia um erro capturado manualmente (ex.: pelo ErrorBoundary) para o
 * Sentry. Não faz nada se o Sentry não estiver habilitado — assim o
 * ErrorBoundary pode sempre chamar essa função sem se preocupar se a
 * variável de ambiente foi configurada ou não.
 */
export function reportError(error, extra) {
    if (!ENABLED) return;
    Sentry.captureException(error, { extra });
}

/**
 * Identifica o usuário logado nos relatórios de erro (ajuda a saber
 * "quem" sofreu o problema, sem precisar guardar dados sensíveis).
 * Chame isso a partir do AuthContext quando o usuário logar/deslogar.
 */
export function setSentryUser(user) {
    if (!ENABLED) return;
    Sentry.setUser(
        user ? { id: user.uid, email: user.email ?? undefined } : null
    );
}

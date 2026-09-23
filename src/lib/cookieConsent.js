const STORAGE_KEY = "tlgestao_cookie_consent";

export function getCookieConsent() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function setCookieConsent(analyticsAllowed) {
    const value = {
        analytics: analyticsAllowed,
        decidedAt: new Date().toISOString(),
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
        // Se não conseguir salvar, a pessoa só vai ver o aviso de novo
        // na próxima visita — não quebra o site.
    }

    return value;
}
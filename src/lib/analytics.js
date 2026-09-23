const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const ENABLED = Boolean(MEASUREMENT_ID) && import.meta.env.PROD;

let initialized = false;

export function initAnalytics() {
    if (!ENABLED || initialized) return;
    initialized = true;

    // Carrega o gtag.js sob demanda — só baixa esse script quando o
    // analytics está de fato configurado e em produção.
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    // send_page_view desligado: cada troca de rota já é reportada
    // manualmente por trackPageview(), evitando pageview duplicado.
    gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

/** Registra uma visualização de página (chamado a cada troca de rota). */
export function trackPageview(path) {
    if (!ENABLED || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.href,
    });
}

/** Registra um evento customizado (ex.: clique no botão de um plano). */
export function trackEvent(name, params = {}) {
    if (!ENABLED || typeof window.gtag !== "function") return;
    window.gtag("event", name, params);
}

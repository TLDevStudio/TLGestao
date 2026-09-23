import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { getCookieConsent, setCookieConsent } from "../lib/cookieConsent";
import { initAnalytics } from "../lib/analytics";

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (getCookieConsent() !== null) return;

        const timer = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(timer);
    }, []);

    function handleAccept() {
        setCookieConsent(true);
        initAnalytics();
        setVisible(false);
    }

    function handleReject() {
        setCookieConsent(false);
        setVisible(false);
    }

    if (!visible) return null;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Aviso de cookies"
            className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
        >
            <div className="cookie-consent-enter mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-xl sm:flex-row sm:items-center">
                <div className="flex items-start gap-3 sm:flex-1">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pine-900/5">
                        <Cookie size={18} className="text-pine-700" />
                    </div>
                    <p className="text-sm leading-6 text-ink-soft">
                        Usamos cookies essenciais para manter sua sessão, e o Google
                        Analytics (opcional) para entender como o site é usado. Você
                        pode aceitar ou recusar os cookies não essenciais a qualquer
                        momento.{" "}
                        <Link
                            to="/privacidade"
                            className="link-fx font-medium text-ink hover:text-pine-800"
                        >
                            Saiba mais
                        </Link>
                    </p>
                </div>

                <div className="flex shrink-0 gap-2.5 sm:flex-col">
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="btn-fx btn-pine flex-1 rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-pine-800 sm:flex-none"
                    >
                        Aceitar todos
                    </button>
                    <button
                        type="button"
                        onClick={handleReject}
                        className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper-dim sm:flex-none"
                    >
                        Somente essenciais
                    </button>
                </div>
            </div>
        </div>
    );
}
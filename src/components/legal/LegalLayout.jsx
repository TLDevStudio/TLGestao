import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ title, updatedAt, children }) {
    return (
        <div className="min-h-screen bg-paper">
            <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-display font-bold text-pine-950">
                        TL
                    </div>
                    <span className="font-display text-lg font-semibold text-ink">TLGestão</span>
                </Link>
                <Link
                    to="/"
                    className="link-fx flex items-center gap-1.5 text-sm font-medium text-ink hover:text-pine-800"
                >
                    <ArrowLeft size={15} /> Voltar
                </Link>
            </header>

            <main className="mx-auto max-w-3xl px-6 pb-20 pt-4">
                <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
                {updatedAt && (
                    <p className="mt-2 text-sm text-ink-soft">Última atualização: {updatedAt}</p>
                )}

                <div className="mt-10 space-y-8">{children}</div>
            </main>

            <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
                © {new Date().getFullYear()} TLGestão — Seu negócio organizado em um só lugar.
            </footer>
        </div>
    );
}

/**
 * Bloco de seção padronizado (título + conteúdo), pra usar dentro das
 * páginas de Termos e Privacidade sem repetir classes toda hora.
 */
export function LegalSection({ id, title, children }) {
    return (
        <section id={id} className="scroll-mt-6">
            <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h2>
            <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-ink-soft [&_a]:text-pine-700 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-pine-800 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {children}
            </div>
        </section>
    );
}

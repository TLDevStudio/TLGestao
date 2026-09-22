import { CheckCircle2, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import { PLANS, buildWhatsAppLink } from "../../config/plans";

/**
 * Seção "Planos" da Landing.
 * Cada card monta um link wa.me com mensagem pré-preenchida — ao clicar,
 * o visitante vai direto para uma conversa no WhatsApp já dizendo qual
 * plano quer assinar. Não há checkout/pagamento automático (de propósito,
 * por enquanto): quem libera o acesso é o admin, depois de falar com o
 * cliente.
 */
export default function PlansSection() {
    return (
        <section id="planos" className="mx-auto max-w-4xl px-6 py-16">
            <Reveal as="h2" className="text-center font-display text-2xl font-semibold text-ink">
                Plano Mensal Único
            </Reveal>
            <Reveal as="p" delay={80} className="mx-auto mt-2 max-w-md text-center text-sm text-ink-soft">
                Um plano único, simples, sem letras miúdas. Fale comigo pelo WhatsApp para assinar.
            </Reveal>

            <div className="mt-10 flex justify-center">
                {PLANS.map((plan, i) => (
                    <Reveal
                        key={plan.id}
                        variant="scale"
                        delay={i * 90}
                        className="w-full max-w-sm"
                    >
                        <div
                            className={`flex h-full flex-col rounded-2xl border p-7 ${plan.highlight
                                    ? "border-pine-900 bg-pine-900 text-white shadow-sm"
                                    : "border-line bg-white text-ink"
                                }`}
                        >
                            <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                            <p
                                className={`mt-1 text-sm ${plan.highlight ? "text-white/70" : "text-ink-soft"
                                    }`}
                            >
                                {plan.tagline}
                            </p>

                            <div className="mt-5 flex items-baseline gap-1">
                                <span className="font-display text-3xl font-semibold">
                                    {plan.priceLabel}
                                </span>
                                <span
                                    className={`text-sm ${plan.highlight ? "text-white/70" : "text-ink-soft"
                                        }`}
                                >
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="mt-6 flex-1 space-y-2.5">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm">
                                        <CheckCircle2
                                            size={17}
                                            className={`mt-0.5 shrink-0 ${plan.highlight ? "text-amber-400" : "text-pine-700"
                                                }`}
                                        />
                                        <span className={plan.highlight ? "text-white/90" : "text-ink"}>
                                            {f}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={buildWhatsAppLink(plan.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`btn-fx mt-7 flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold ${plan.highlight
                                        ? "btn-amber bg-amber-500 text-pine-950 hover:bg-amber-600"
                                        : "btn-pine bg-pine-900 text-white hover:bg-pine-800"
                                    }`}
                            >
                                <MessageCircle size={16} />
                                Assinar plano {plan.name}
                            </a>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

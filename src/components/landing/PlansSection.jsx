import { CheckCircle2, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";
import { PLANS, buildWhatsAppLink } from "../../config/plans";

export default function PlansSection() {
    return (
        <section id="planos" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <Reveal
                as="h2"
                className="text-center font-display text-3xl font-semibold text-ink"
            >
                Escolha como quer começar
            </Reveal>

            <Reveal
                as="p"
                delay={80}
                className="mx-auto mt-3 max-w-2xl text-center text-sm leading-6 text-ink-soft"
            >
                O sistema é o mesmo em todos os planos. Você escolhe apenas
                quanto quer que eu faça pela configuração inicial do seu negócio.
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {PLANS.map((plan, i) => (
                    <Reveal
                        key={plan.id}
                        variant="scale"
                        delay={i * 90}
                        className="h-full"
                    >
                        <div
                            className={`relative flex h-full flex-col rounded-2xl border p-7 ${plan.highlight
                                    ? "border-pine-900 bg-pine-900 text-white shadow-lg"
                                    : "border-line bg-white text-ink shadow-sm"
                                }`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-6 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-pine-950">
                                    {plan.badge}
                                </div>
                            )}

                            <h3 className="font-display text-xl font-semibold">
                                {plan.name}
                            </h3>

                            <p
                                className={`mt-2 min-h-[48px] text-sm leading-6 ${plan.highlight
                                        ? "text-white/70"
                                        : "text-ink-soft"
                                    }`}
                            >
                                {plan.tagline}
                            </p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="font-display text-3xl font-semibold">
                                    {plan.priceLabel}
                                </span>

                                <span
                                    className={`text-sm ${plan.highlight
                                            ? "text-white/70"
                                            : "text-ink-soft"
                                        }`}
                                >
                                    {plan.period}
                                </span>
                            </div>

                            <p
                                className={`mt-2 text-xs font-medium ${plan.highlight
                                        ? "text-amber-400"
                                        : "text-pine-700"
                                    }`}
                            >
                                {plan.setupLabel}
                            </p>

                            <div
                                className={`my-6 h-px ${plan.highlight
                                        ? "bg-white/10"
                                        : "bg-line"
                                    }`}
                            />

                            <ul className="flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2.5 text-sm"
                                    >
                                        <CheckCircle2
                                            size={17}
                                            className={`mt-0.5 shrink-0 ${plan.highlight
                                                    ? "text-amber-400"
                                                    : "text-pine-700"
                                                }`}
                                        />

                                        <span
                                            className={
                                                plan.highlight
                                                    ? "text-white/90"
                                                    : "text-ink"
                                            }
                                        >
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href={buildWhatsAppLink(
                                    plan.name,
                                    plan.whatsappMessage
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`btn-fx mt-7 flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-sm font-semibold ${plan.highlight
                                        ? "btn-amber bg-amber-500 text-pine-950 hover:bg-amber-600"
                                        : "btn-pine bg-pine-900 text-white hover:bg-pine-800"
                                    }`}
                            >
                                <MessageCircle size={16} />
                                {plan.buttonLabel}
                            </a>
                        </div>
                    </Reveal>
                ))}
            </div>

            <Reveal
                delay={180}
                className="mx-auto mt-6 max-w-3xl text-center"
            >
                <p className="text-xs leading-5 text-ink-soft">
                    Todos os planos têm acesso ao sistema completo.
                    A implantação é cobrada uma única vez e a mensalidade é
                    de R$ 49,90.
                </p>
            </Reveal>
        </section>
    );
}
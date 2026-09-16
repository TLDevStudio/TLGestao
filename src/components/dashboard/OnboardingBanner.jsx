import { Link } from "react-router-dom";
import { X, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useOnboarding } from "../../hooks/useOnboarding";

const STEP_LINKS = {
    companyConfigured: "/app/configuracoes",
    servicesCreated: "/app/servicos",
    clientsCreated: "/app/clientes",
    firstUseDone: "/app/vendas",
};

export default function OnboardingBanner() {
    const { progress, shouldShow, dismiss } = useOnboarding();

    if (!shouldShow) return null;

    const { steps, completedCount, totalCount } = progress;
    const percent = (completedCount / totalCount) * 100;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-pine-900/15 bg-gradient-to-br from-pine-900 to-pine-800 p-5 text-white sm:p-6">
            <button
                onClick={dismiss}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
            >
                <X size={16} />
            </button>

            <div className="mb-1 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" />
                <h2 className="font-display text-lg font-semibold sm:text-xl">Bem-vindo ao NexoGestão!</h2>
            </div>
            <p className="mb-4 text-sm text-white/70">
                Complete os passos abaixo para aproveitar o sistema ao máximo.
            </p>

            <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
                    <span>
                        {completedCount} de {totalCount} etapas concluídas
                    </span>
                    <span>{percent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${percent}%` }} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {steps.map((step) => {
                    const content = (
                        <div
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition ${step.done ? "bg-white/5 text-white/60" : "bg-white/10 text-white hover:bg-white/15"
                                }`}
                        >
                            {step.done ? (
                                <CheckCircle2 size={16} className="shrink-0 text-amber-500" />
                            ) : (
                                <Circle size={16} className="shrink-0" />
                            )}
                            <span className={step.done ? "line-through" : ""}>{step.label}</span>
                        </div>
                    );

                    return step.done ? (
                        <div key={step.key}>{content}</div>
                    ) : (
                        <Link key={step.key} to={STEP_LINKS[step.key]}>
                            {content}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

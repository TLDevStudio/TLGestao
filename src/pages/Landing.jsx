import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  CalendarClock,
  Package,
  Wallet,
  BarChart3,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";
// ⚠️ Ajuste o caminho abaixo se a sua pasta de componentes for diferente
import Reveal from "../components/landing/Reveal";
import PlansSection from "../components/landing/PlansSection";

// A cena 3D (Three.js) só é baixada quando a landing abre — não pesa no resto do sistema.
const Hero3D = lazy(() => import("../components/landing/Hero3D"));

const FEATURES = [
  { icon: Users, title: "Clientes", desc: "Histórico completo de atendimentos e compras de cada cliente." },
  { icon: CalendarClock, title: "Agendamentos", desc: "Agenda visual por dia, semana ou mês, com status em tempo real." },
  { icon: Package, title: "Estoque", desc: "Controle de produtos com alerta automático de estoque baixo." },
  { icon: Wallet, title: "Financeiro", desc: "Receitas, despesas e lucro organizados por categoria e período." },
  { icon: BarChart3, title: "Relatórios", desc: "Indicadores claros para decisões melhores no dia a dia." },
  { icon: Sparkles, title: "TL Insights", desc: "Análises automáticas sobre o desempenho do seu negócio." },
];

const AUDIENCE = ["Barbearias", "Salões de beleza", "Oficinas", "Lojas", "Prestadores de serviço"];

const FAQ = [
  { q: "Preciso instalar algo?", a: "Não. O TLGestão funciona direto no navegador, em qualquer dispositivo." },
  { q: "Meus dados ficam seguros?", a: "Sim. Cada conta acessa apenas os próprios dados, protegidos por autenticação e regras de segurança." },
  { q: "Posso testar antes de cadastrar tudo?", a: "Sim, use o botão \"Ver demonstração\" para carregar dados de exemplo e explorar o sistema." },
];

export default function Landing() {
  return (
    <div className="bg-paper">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-display font-bold text-pine-950">
            TL
          </div>
          <span className="font-display text-lg font-semibold text-ink">TLGestão</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/entrar" className="link-fx text-sm font-medium text-ink hover:text-pine-800">
            Entrar
          </Link>
          <Link
            to="/criar-conta"
            className="btn-fx btn-pine rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-pine-800"
          >
            Começar agora
          </Link>
        </div>
      </header>

      {/* Hero
          - Celular/tablet/notebook pequeno: a cena 3D fica ACIMA do título.
          - Desktop (xl, >= 1280px): a cena vira fundo e ocupa o espaço vazio dos lados. */}
      <div className="relative overflow-hidden">
        <Suspense fallback={<div className="h-52 sm:h-64 xl:hidden" aria-hidden="true" />}>
          <Hero3D />
        </Suspense>

        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-2 text-center sm:pb-24 xl:py-24">
          <Reveal
            as="h1"
            className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl"
          >
            Tenha o controle do seu negócio na palma da mão.
          </Reveal>
          <Reveal as="p" delay={120} className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
            Clientes, vendas, estoque, agendamentos e financeiro em uma única plataforma.
          </Reveal>
          <Reveal
            delay={240}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/criar-conta"
              className="btn-fx btn-amber flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-pine-950 hover:bg-amber-600"
            >
              Começar agora <ArrowRight size={16} className="btn-arrow" />
            </Link>
            <Link
              to="/entrar?demo=1"
              className="btn-fx btn-ghost flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-medium text-ink hover:bg-paper-dim"
            >
              <Play size={13} className="btn-icon" fill="currentColor" /> Ver demonstração
            </Link>
          </Reveal>
        </section>
      </div>

      {/* Benefícios rápidos */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <Reveal className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-6 sm:grid-cols-3">
          {["Sem planilhas soltas", "Dados sempre atualizados", "Acesso de qualquer lugar"].map(
            (b) => (
              <div key={b} className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0 text-pine-700" />
                <span className="text-sm text-ink">{b}</span>
              </div>
            )
          )}
        </Reveal>
      </section>

      {/* Funcionalidades */}
      <section className="bg-pine-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal as="h2" className="font-display text-3xl font-semibold">
            Tudo que seu negócio precisa
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              // O Reveal é o item da grade; o cartão (com hover) fica dentro dele
              <Reveal key={title} delay={(i % 3) * 90}>
                <div className="h-full rounded-2xl bg-white/5 p-5 transition-colors duration-200 hover:bg-white/10">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                    <Icon size={18} className="text-amber-500" />
                  </div>
                  <h3 className="font-display text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-white/65">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Reveal as="h2" className="font-display text-2xl font-semibold text-ink">
          Feito para o seu tipo de negócio
        </Reveal>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {AUDIENCE.map((a, i) => (
            <Reveal
              key={a}
              as="span"
              variant="scale"
              distance={16}
              delay={i * 70}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink"
            >
              {a}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Planos */}
      <PlansSection />

      {/* Depoimentos (demonstração) 
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-ink-soft">
          Depoimentos de demonstração
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "Zé, Barbearia do Zé", text: "Consigo ver o dia inteiro em um lugar só, sem precisar de caderno." },
            { name: "Marina, Salão Bella", text: "O controle de estoque me avisa antes de faltar produto." },
          ].map((d) => (
            <div key={d.name} className="rounded-2xl border border-line bg-white p-5">
              <p className="text-sm text-ink">"{d.text}"</p>
              <p className="mt-3 text-xs font-medium text-ink-soft">{d.name} · exemplo ilustrativo</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <Reveal as="h2" className="mb-6 font-display text-2xl font-semibold text-ink">
          Perguntas frequentes
        </Reveal>
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} variant="fade" delay={i * 90} className="p-5">
              <p className="font-medium text-ink">{f.q}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{f.a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <Reveal variant="scale" className="rounded-2xl bg-pine-900 px-8 py-12 text-white">
          <h2 className="font-display text-2xl font-semibold">Comece a organizar seu negócio hoje</h2>
          <Link
            to="/criar-conta"
            className="btn-fx btn-amber mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-pine-950 hover:bg-amber-600"
          >
            Criar conta gratuita <ArrowRight size={16} className="btn-arrow" />
          </Link>
        </Reveal>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        <p>© {new Date().getFullYear()} TLGestão — Seu negócio organizado em um só lugar.</p>
        <div className="mt-2.5 flex items-center justify-center gap-4">
          <Link to="/termos" className="link-fx hover:text-ink">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="link-fx hover:text-ink">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}

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
} from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Clientes", desc: "Histórico completo de atendimentos e compras de cada cliente." },
  { icon: CalendarClock, title: "Agendamentos", desc: "Agenda visual por dia, semana ou mês, com status em tempo real." },
  { icon: Package, title: "Estoque", desc: "Controle de produtos com alerta automático de estoque baixo." },
  { icon: Wallet, title: "Financeiro", desc: "Receitas, despesas e lucro organizados por categoria e período." },
  { icon: BarChart3, title: "Relatórios", desc: "Indicadores claros para decisões melhores no dia a dia." },
  { icon: Sparkles, title: "Nexo Insights", desc: "Análises automáticas sobre o desempenho do seu negócio." },
];

const AUDIENCE = ["Barbearias", "Salões de beleza", "Oficinas", "Lojas", "Prestadores de serviço"];

const FAQ = [
  { q: "Preciso instalar algo?", a: "Não. O NexoGestão funciona direto no navegador, em qualquer dispositivo." },
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
          <Link to="/entrar" className="text-sm font-medium text-ink hover:text-pine-800">
            Entrar
          </Link>
          <Link
            to="/criar-conta"
            className="rounded-xl bg-pine-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-pine-800"
          >
            Começar agora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <h1 className="font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Tenha o controle do seu negócio na palma da mão.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
          Clientes, vendas, estoque, agendamentos e financeiro em uma única plataforma.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/criar-conta"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-pine-950 hover:bg-amber-600"
          >
            Começar agora <ArrowRight size={16} />
          </Link>
          <Link
            to="/entrar"
            className="rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-medium text-ink hover:bg-paper-dim"
          >
            Ver demonstração
          </Link>
        </div>
      </section>

      {/* Benefícios rápidos */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-white p-6 sm:grid-cols-3">
          {["Sem planilhas soltas", "Dados sempre atualizados", "Acesso de qualquer lugar"].map(
            (b) => (
              <div key={b} className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="shrink-0 text-pine-700" />
                <span className="text-sm text-ink">{b}</span>
              </div>
            )
          )}
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="bg-pine-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-3xl font-semibold">Tudo que seu negócio precisa</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white/5 p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                  <Icon size={18} className="text-amber-500" />
                </div>
                <h3 className="font-display text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-white/65">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Feito para o seu tipo de negócio</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {AUDIENCE.map((a) => (
            <span key={a} className="rounded-full border border-line bg-white px-4 py-2 text-sm text-ink">
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* Depoimentos (demonstração) */}
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
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Perguntas frequentes</h2>
        <div className="divide-y divide-line rounded-2xl border border-line bg-white">
          {FAQ.map((f) => (
            <div key={f.q} className="p-5">
              <p className="font-medium text-ink">{f.q}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="rounded-2xl bg-pine-900 px-8 py-12 text-white">
          <h2 className="font-display text-2xl font-semibold">Comece a organizar seu negócio hoje</h2>
          <Link
            to="/criar-conta"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-pine-950 hover:bg-amber-600"
          >
            Criar conta gratuita <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} TLGestão — Seu negócio organizado em um só lugar.
      </footer>
    </div>
  );
}

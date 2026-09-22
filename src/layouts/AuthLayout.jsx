import { Outlet } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "Clientes, vendas e financeiro em um só lugar",
  "Agenda organizada com status em tempo real",
  "Estoque controlado com alertas automáticos",
  "Relatórios claros para decisões melhores",
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Lado esquerdo — identidade */}
      <div className="hidden flex-col justify-between bg-pine-900 px-12 py-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 font-display font-bold text-pine-950">
            TL
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            TLGestão
          </span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Seu negócio organizado em um só lugar.
          </h1>
          <ul className="space-y-3">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} TLGestão. Seu negócio organizado em um só lugar.
        </p>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

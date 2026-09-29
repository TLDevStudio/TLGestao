import { Outlet } from "react-router-dom";
import { CalendarCheck, Clock, Smartphone } from "lucide-react";

const BENEFITS = [
    { icon: CalendarCheck, text: "Agende com poucos cliques, quando quiser" },
    { icon: Clock, text: "Veja só os horários realmente disponíveis" },
    { icon: Smartphone, text: "Acompanhe e cancele seus agendamentos" },
];

export default function CustomerAuthLayout() {
    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="hidden flex-col justify-between bg-pine-900 px-12 py-12 text-white lg:flex">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 font-display font-bold text-pine-950">
                        TL
                    </div>
                    <span className="font-display text-xl font-semibold tracking-tight">Portal do Cliente</span>
                </div>

                <div className="max-w-md space-y-6">
                    <h1 className="font-display text-3xl font-semibold leading-tight">
                        Agende seu horário sem sair de casa.
                    </h1>
                    <ul className="space-y-3">
                        {BENEFITS.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-start gap-2.5 text-sm text-white/80">
                                <Icon size={18} className="mt-0.5 shrink-0 text-amber-500" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-xs text-white/50">Powered by TLGestão</p>
            </div>

            <div className="flex items-center justify-center bg-paper px-6 py-12">
                <div className="w-full max-w-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
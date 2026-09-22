import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

/**
 * Página exibida quando nenhuma rota corresponde à URL acessada.
 * Cobre tanto o site público (/) quanto a área logada (/app/*).
 */
export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pine-900/10">
                <Compass size={30} className="text-pine-800" />
            </div>

            <div className="space-y-2">
                <p className="font-display text-6xl font-semibold text-pine-900">404</p>
                <h1 className="font-display text-2xl font-semibold text-ink">
                    Página não encontrada
                </h1>
                <p className="max-w-sm text-sm text-ink-soft">
                    O endereço que você tentou acessar não existe ou foi movido.
                    Verifique o link ou volte para um lugar seguro.
                </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link to="/">
                    <Button variant="primary" icon={ArrowLeft}>
                        Ir para o início
                    </Button>
                </Link>
                <Link to="/app/dashboard">
                    <Button variant="outline">Ir para o painel</Button>
                </Link>
            </div>
        </div>
    );
}

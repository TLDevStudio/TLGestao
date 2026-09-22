import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "./ui/Button";

/**
 * Rede de segurança global: captura qualquer erro de renderização em
 * componentes React e mostra uma tela amigável em vez de uma página em
 * branco. Envolve toda a árvore de rotas em App.jsx.
 *
 * Observação: ErrorBoundary só pode ser implementado como componente de
 * classe — React ainda não oferece um equivalente via Hooks.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Aqui é o ponto de integração com uma ferramenta de monitoramento
        // de erros em produção (ex.: Sentry), prevista na Fase 4 do roteiro.
        console.error("[TLGestão] Erro não tratado capturado pelo ErrorBoundary:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-100">
                        <AlertTriangle size={30} className="text-danger" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-display text-2xl font-semibold text-ink">
                            Ocorreu um erro inesperado
                        </h1>
                        <p className="max-w-sm text-sm text-ink-soft">
                            Algo deu errado ao carregar esta parte do sistema. Você pode
                            tentar recarregar a página; se o problema continuar, entre em
                            contato com o suporte.
                        </p>
                    </div>

                    <Button variant="primary" icon={RotateCcw} onClick={this.handleReload}>
                        Recarregar página
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

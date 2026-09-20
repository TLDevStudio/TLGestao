import { useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { loadDemoData, removeDemoData } from "../../services/demoDataService";
import useIsDemoAccount from "../../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../../utils/demoGuard";

export default function DemoDataSection() {
    const { user } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();
    const [confirmLoad, setConfirmLoad] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleLoad = async () => {
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            setConfirmLoad(false);
            return;
        }
        setLoading(true);
        try {
            await loadDemoData(user.uid);
            toast.success("Dados de demonstração carregados! Navegue pelo sistema para ver tudo populado.");
            setConfirmLoad(false);
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível carregar os dados de demonstração.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            setConfirmRemove(false);
            return;
        }
        setRemoving(true);
        try {
            await removeDemoData(user.uid);
            toast.success("Dados de demonstração removidos.");
            setConfirmRemove(false);
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível remover os dados de demonstração.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2">
                    <Sparkles size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-ink">Dados de demonstração</p>
                    <p className="text-sm text-ink-soft">
                        Popula sua conta com clientes, serviços, produtos, vendas, despesas e agendamentos
                        fictícios — útil para apresentar o sistema em portfólio sem cadastrar tudo manualmente.
                        Tudo é marcado internamente para poder ser removido depois com um clique.
                    </p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" icon={Trash2} onClick={() => setConfirmRemove(true)}>
                    Remover demonstração
                </Button>
                <Button variant="amber" icon={Sparkles} onClick={() => setConfirmLoad(true)}>
                    Carregar demonstração
                </Button>
            </div>

            <ConfirmDialog
                open={confirmLoad}
                onClose={() => setConfirmLoad(false)}
                onConfirm={handleLoad}
                loading={loading}
                title="Carregar dados de demonstração"
                description="Isso vai adicionar clientes, serviços, produtos, vendas, despesas e agendamentos fictícios à sua conta atual, junto dos seus dados reais. Você pode remover tudo depois pelo botão 'Remover demonstração'. Deseja continuar?"
                confirmLabel="Carregar demonstração"
                variant="amber"
            />

            <ConfirmDialog
                open={confirmRemove}
                onClose={() => setConfirmRemove(false)}
                onConfirm={handleRemove}
                loading={removing}
                title="Remover dados de demonstração"
                description="Isso vai excluir permanentemente todos os registros marcados como demonstração (clientes, serviços, produtos, vendas, despesas e agendamentos fictícios). Seus dados reais não serão afetados. Deseja continuar?"
                confirmLabel="Remover"
            />
        </div>
    );
}

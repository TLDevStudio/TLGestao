import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Power, KeyRound } from "lucide-react";
import Button from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { subscribeAdminAccess, setAdminAccessEnabled } from "../../services/adminAccessService";
import { resetPassword, translateAuthError } from "../../services/authService";
import { formatDateTime } from "../../utils/formatters";

export default function AdminSecurity() {
    const { user } = useAuth();
    const toast = useToast();
    const [access, setAccess] = useState(null);
    const [saving, setSaving] = useState(false);
    const [sendingReset, setSendingReset] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeAdminAccess(setAccess);
        return unsubscribe;
    }, []);

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        setSendingReset(true);
        try {
            await resetPassword(user.email);
            toast.success(`Enviamos um link de redefinição de senha para ${user.email}.`);
        } catch (err) {
            console.error(err);
            toast.error(translateAuthError(err));
        } finally {
            setSendingReset(false);
        }
    };

    const handleToggle = async () => {
        if (!access) return;
        const next = !access.enabled;

        if (!next) {
            const confirmed = window.confirm(
                "Desativar o painel administrativo bloqueia o acesso de QUALQUER administrador, inclusive você, até reativar direto pelo Firestore Console (systemConfig/adminAccess). Deseja continuar?"
            );
            if (!confirmed) return;
        }

        setSaving(true);
        try {
            await setAdminAccessEnabled(next, user?.email);
            toast.success(next ? "Painel administrativo reativado." : "Painel administrativo desativado.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível atualizar o acesso administrativo.");
        } finally {
            setSaving(false);
        }
    };

    if (!access) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Spinner size={26} />
            </div>
        );
    }

    const enabled = access.enabled !== false;

    return (
        <div className="mx-auto max-w-xl space-y-5">
            <div className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper-dim text-pine-800">
                        <KeyRound size={22} />
                    </div>
                    <div className="flex-1">
                        <p className="font-display text-lg font-semibold text-ink">Alterar senha do admin</p>
                        <p className="mt-1 text-sm text-ink-soft">
                            Enviaremos um link de redefinição de senha para{" "}
                            <strong>{user?.email}</strong>, o e-mail desta conta administrativa.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="outline" icon={KeyRound} loading={sendingReset} onClick={handlePasswordReset}>
                        Enviar link de redefinição
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${enabled ? "bg-success/10 text-success" : "bg-danger-100 text-danger"
                            }`}
                    >
                        {enabled ? <ShieldCheck size={22} /> : <ShieldOff size={22} />}
                    </div>
                    <div className="flex-1">
                        <p className="font-display text-lg font-semibold text-ink">
                            Painel administrativo {enabled ? "ativado" : "desativado"}
                        </p>
                        <p className="mt-1 text-sm text-ink-soft">
                            Este interruptor controla o acesso ao painel inteiro, para
                            qualquer conta com <code className="rounded bg-paper-dim px-1">role: admin</code>.
                            Use em caso de suspeita de acesso indevido — desligar aqui
                            bloqueia a todos imediatamente, inclusive você.
                        </p>
                        {access.updatedAt && (
                            <p className="mt-3 text-xs text-ink-soft">
                                Última alteração: {formatDateTime(access.updatedAt.toDate?.() || access.updatedAt)}
                                {access.updatedBy ? ` — por ${access.updatedBy}` : ""}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        variant={enabled ? "danger" : "primary"}
                        icon={Power}
                        loading={saving}
                        onClick={handleToggle}
                    >
                        {enabled ? "Desativar painel administrativo" : "Reativar painel administrativo"}
                    </Button>
                </div>
            </div>

            <p className="text-xs text-ink-soft">
                Recuperação de emergência: se o painel ficar desativado e
                ninguém conseguir reativar por aqui (porque, sem acesso, ninguém
                vê esta tela), abra o Firestore Console → coleção{" "}
                <code className="rounded bg-paper-dim px-1">systemConfig</code> → documento{" "}
                <code className="rounded bg-paper-dim px-1">adminAccess</code> → mude{" "}
                <code className="rounded bg-paper-dim px-1">enabled</code> para{" "}
                <code className="rounded bg-paper-dim px-1">true</code>.
            </p>
        </div>
    );
}
import { useState } from "react";
import { User, Phone } from "lucide-react";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { updateCustomerProfile } from "../../services/customerAuthService";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function CustomerProfile() {
    const { user, customerProfile } = useCustomerAuth();
    const [form, setForm] = useState({ name: customerProfile?.name || "", phone: customerProfile?.phone || "" });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            await updateCustomerProfile(user.uid, form);
            setSaved(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md space-y-6">
            <h1 className="font-display text-xl font-semibold text-ink">Meu perfil</h1>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6">
                <Input
                    label="Nome completo"
                    icon={User}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                />
                <Input
                    label="Telefone / WhatsApp"
                    icon={Phone}
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    required
                />
                <Input label="E-mail" value={customerProfile?.email || ""} disabled />

                {saved && <p className="rounded-lg bg-pine-900/10 px-3 py-2 text-sm text-pine-900">Dados atualizados.</p>}

                <Button type="submit" variant="primary" loading={saving}>
                    Salvar alterações
                </Button>
            </form>
        </div>
    );
}
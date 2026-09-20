import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginWithEmail, translateAuthError } from "../../services/authService";

/**
 * Login separado do painel administrativo. Não tem link para cadastro,
 * não tem link para a demonstração, e não aparece linkado em nenhum
 * lugar do site público ou da área do cliente — só quem sabe a URL
 * (/admin/login) chega aqui.
 *
 * A checagem real de "essa conta é admin mesmo?" acontece no
 * AdminGuard, depois do login — aqui só autentica no Firebase.
 */
export default function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/admin/dashboard";

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await loginWithEmail(form.email, form.password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(translateAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-pine-900 px-6">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-pine-900 p-8 shadow-xl">
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                        <ShieldCheck size={22} />
                    </div>
                    <h1 className="font-display text-lg font-semibold text-white">
                        Painel administrativo
                    </h1>
                    <p className="mt-1 text-sm text-white/60">Acesso restrito à equipe TLGestão.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="admin-email"
                        name="email"
                        type="email"
                        label="E-mail"
                        icon={Mail}
                        placeholder="admin@tlgestao.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="admin-password"
                        name="password"
                        type="password"
                        label="Senha"
                        icon={Lock}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
                    )}

                    <Button type="submit" className="w-full" loading={loading} size="lg">
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
}

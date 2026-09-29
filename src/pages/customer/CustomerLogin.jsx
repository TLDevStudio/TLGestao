import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginCustomer, translateCustomerAuthError } from "../../services/customerAuthService";

export default function CustomerLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/cliente/meus-agendamentos";

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await loginCustomer(form.email, form.password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(translateCustomerAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-7">
            <div className="space-y-1.5">
                <h2 className="font-display text-2xl font-semibold text-ink">Entrar</h2>
                <p className="text-sm text-ink-soft">Acesse sua conta para ver ou fazer agendamentos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="E-mail"
                    icon={Mail}
                    placeholder="Digite seu e-mail"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <div className="space-y-1.5">
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label="Senha"
                        icon={Lock}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <div className="text-right">
                        <Link to="/cliente/esqueci-senha" className="link-fx text-xs font-medium text-pine-800 hover:none">
                            Esqueci minha senha
                        </Link>
                    </div>
                </div>

                {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>}

                <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
                    Entrar
                </Button>
            </form>

            <p className="text-center text-sm text-ink-soft">
                Ainda não tem conta?{" "}
                <Link to="/cliente/criar-conta" className="link-fx text-sm font-medium text-pine-800 hover:none">
                    Criar conta
                </Link>
            </p>
        </div>
    );
}
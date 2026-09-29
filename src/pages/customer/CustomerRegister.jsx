import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { registerCustomer, translateCustomerAuthError } from "../../services/customerAuthService";

export default function CustomerRegister() {
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/cliente/meus-agendamentos";

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await registerCustomer(form);
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
                <h2 className="font-display text-2xl font-semibold text-ink">Criar conta</h2>
                <p className="text-sm text-ink-soft">Leva menos de um minuto.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="name"
                    name="name"
                    label="Nome completo"
                    icon={User}
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
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
                <Input
                    id="phone"
                    name="phone"
                    label="Telefone / WhatsApp"
                    icon={Phone}
                    placeholder="(00) 00000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />
                <Input
                    id="password"
                    name="password"
                    type="password"
                    label="Senha"
                    icon={Lock}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                />

                {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>}

                <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
                    Criar conta
                </Button>
            </form>

            <p className="text-center text-sm text-ink-soft">
                Já tem conta?{" "}
                <Link to="/cliente/entrar" className="link-fx text-sm font-medium text-pine-800 hover:none">
                    Entrar
                </Link>
            </p>
        </div>
    );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetCustomerPassword, translateCustomerAuthError } from "../../services/customerAuthService";

export default function CustomerForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await resetCustomerPassword(email);
            setSent(true);
        } catch (err) {
            setError(translateCustomerAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="space-y-4 text-center">
                <h2 className="font-display text-2xl font-semibold text-ink">E-mail enviado</h2>
                <p className="text-sm text-ink-soft">
                    Se houver uma conta de cliente com esse e-mail, enviamos um link para redefinir a senha.
                </p>
                <Link to="/cliente/entrar" className="link-fx text-sm font-medium text-pine-800 hover:none">
                    Voltar para o login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-7">
            <div className="space-y-1.5">
                <h2 className="font-display text-2xl font-semibold text-ink">Recuperar senha</h2>
                <p className="text-sm text-ink-soft">Enviaremos um link de redefinição para o seu e-mail.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="email"
                    type="email"
                    label="E-mail"
                    icon={Mail}
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {error && <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>}

                <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
                    Enviar link
                </Button>
            </form>

            <p className="text-center text-sm text-ink-soft">
                <Link to="/cliente/entrar" className="link-fx text-sm font-medium text-pine-800 hover:none">
                    Voltar para o login
                </Link>
            </p>
        </div>
    );
}
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginWithEmail, translateAuthError } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/app/dashboard";

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
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink">Bem-vindo de volta</h2>
        <p className="text-sm text-ink-soft">Entre para acessar o seu painel.</p>
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
            <Link
              to="/recuperar-senha"
              className="text-xs font-medium text-pine-800 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Não possui uma conta?{" "}
        <Link to="/criar-conta" className="font-medium text-pine-800 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

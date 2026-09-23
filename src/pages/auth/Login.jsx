import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Sparkles } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { loginWithEmail, translateAuthError } from "../../services/authService";
import { DEMO_CONFIG } from "../../config/demo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isDemoLogin = searchParams.get("demo") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/app/dashboard";

  useEffect(() => {
    if (isDemoLogin) {
      setForm({ email: DEMO_CONFIG.email, password: DEMO_CONFIG.password });
    }
  }, [isDemoLogin]);

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

        {isDemoLogin && (
          <div className="mt-3 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-700">
            <p className="flex items-center gap-1.5 font-semibold">
              <Sparkles size={14} /> Modo demonstração
            </p>
            <p className="mt-1 text-xs leading-relaxed">
              Os dados abaixo pertencem a uma conta demonstrativa do TLGestão.
              Clique em "Entrar na demonstração" para explorar o sistema.
            </p>
          </div>
        )}
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
          readOnly={isDemoLogin}
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
            readOnly={isDemoLogin}
            required
          />
          {!isDemoLogin && (
            <div className="text-right">
              <Link
                to="/recuperar-senha"
                className="text-xs font-medium text-pine-800 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
          {isDemoLogin ? "Entrar na demonstração" : "Entrar"}
        </Button>
      </form>

      {!isDemoLogin && (
        <p className="text-center text-sm text-ink-soft">
          Não possui uma conta?{" "}
          <Link to="/criar-conta" className="link-fx text-sm font-medium text-pine-800 hover:none">
            Criar conta
          </Link>
        </p>
      )}
    </div>
  );
}


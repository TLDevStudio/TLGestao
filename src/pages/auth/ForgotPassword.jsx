import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { resetPassword, translateAuthError } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
          <MailCheck size={22} className="text-success" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-display text-xl font-semibold text-ink">Verifique seu e-mail</h2>
          <p className="text-sm text-ink-soft">
            Enviamos um link de redefinição de senha para <strong>{email}</strong>.
          </p>
        </div>
        <Link to="/entrar" className="inline-flex items-center gap-1.5 text-sm font-medium text-pine-800 hover:underline">
          <ArrowLeft size={15} /> Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink">Recuperar senha</h2>
        <p className="text-sm text-ink-soft">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="E-mail"
          icon={Mail}
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
          Enviar link de recuperação
        </Button>
      </form>

      <Link
        to="/entrar"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-pine-800 hover:underline"
      >
        <ArrowLeft size={15} /> Voltar para o login
      </Link>
    </div>
  );
}

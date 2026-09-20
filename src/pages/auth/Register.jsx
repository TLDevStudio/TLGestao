import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Building2, Mail, Phone, Lock } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { registerBusiness, translateAuthError } from "../../services/authService";
import { maskPhone } from "../../utils/masks";
import { useToast } from "../../contexts/ToastContext";

const BUSINESS_TYPES = [
  { value: "barbearia", label: "Barbearia" },
  { value: "salao", label: "Salão de beleza" },
  { value: "oficina", label: "Oficina" },
  { value: "loja", label: "Loja" },
  { value: "prestador", label: "Prestador de serviços" },
  { value: "outro", label: "Outro" },
];

const initialForm = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  password: "",
  businessType: "",
};

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "phone" ? maskPhone(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (!form.businessType) {
      setError("Selecione o tipo do seu negócio.");
      return;
    }

    setLoading(true);
    try {
      await registerBusiness(form);
      // registerBusiness grava accountStatus "pending" (Fase 1). O
      // AccountStatusGuard (Fase 2) vai mostrar a tela de aguardando
      // liberação automaticamente ao navegar para /app/dashboard.
      toast.success("Conta criada! Acompanhe abaixo o status da liberação do seu acesso.");
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="font-display text-2xl font-semibold text-ink">Criar sua conta</h2>
        <p className="text-sm text-ink-soft">Comece a organizar seu negócio agora.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          id="name"
          name="name"
          label="Seu nome"
          icon={User}
          placeholder="Digite seu nome"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          id="businessName"
          name="businessName"
          label="Sua empresa"
          icon={Building2}
          placeholder="Digite o nome da sua empresa"
          value={form.businessName}
          onChange={handleChange}
          required
        />
        <Select
          id="businessType"
          name="businessType"
          label="Tipo de negócio"
          placeholder="Selecione uma opção"
          options={BUSINESS_TYPES}
          value={form.businessType}
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
          label="Telefone"
          icon={Phone}
          placeholder="(21) 90000-0000"
          value={form.phone}
          onChange={handleChange}
          maxLength={15}
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
          required
        />

        {error && (
          <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <Button type="submit" className="btn-fx btn-pine w-full" loading={loading} size="lg">
          Criar conta
        </Button>
      </form>

      <p className="text-center text-sm text-ink-soft">
        Já possui uma conta?{" "}
        <Link to="/entrar" className="link-fx text-sm font-medium text-pine-800 hover:none">
          Entrar
        </Link>
      </p>
    </div>
  );
}

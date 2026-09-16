import { useEffect, useRef, useState } from "react";
import {
    Building2,
    User,
    Sliders,
    Shield,
    Phone,
    MessageCircle,
    Mail,
    MapPin,
    IdCard,
    ImagePlus,
    Sun,
    Moon,
    LogOut,
    KeyRound,
} from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { maskPhone, maskCNPJ } from "../utils/masks";
import {
    updateCompanyProfile,
    uploadCompanyLogo,
    updatePreferences,
} from "../services/businessService";
import { updateUserName, uploadUserAvatar } from "../services/userProfileService";
import { logout, resetPassword } from "../services/authService";

const TABS = [
    { value: "company", label: "Empresa", icon: Building2 },
    { value: "profile", label: "Perfil", icon: User },
    { value: "preferences", label: "Preferências", icon: Sliders },
    { value: "security", label: "Segurança", icon: Shield },
];

export default function Configuracoes() {
    const [tab, setTab] = useState("company");

    return (
        <div className="configuracoes-page w-full min-w-0 space-y-5">
            {/* Abas:
                Desktop: ficam lado a lado.
                Mobile: ficam em 2 colunas para que todas apareçam na tela.
            */}
            <div
                className="
                    config-tabs
                    grid
                    grid-cols-4
                    gap-1
                    rounded-xl
                    border
                    border-line
                    bg-surface
                    p-1
                "
                role="tablist"
            >
                {TABS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        onClick={() => setTab(value)}
                        className={`
                            config-tab
                            flex
                            min-w-0
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            px-3
                            py-2
                            text-sm
                            font-medium
                            transition
                            ${tab === value
                                ? "bg-pine-900 text-white"
                                : "text-ink-soft hover:bg-paper-dim"
                            }
                        `}
                    >
                        <Icon size={15} className="shrink-0" />
                        <span className="truncate">{label}</span>
                    </button>
                ))}
            </div>

            {/* Conteúdo das configurações */}
            <div className="w-full min-w-0 max-w-2xl">
                {tab === "company" && <CompanySection />}
                {tab === "profile" && <ProfileSection />}
                {tab === "preferences" && <PreferencesSection />}
                {tab === "security" && <SecuritySection />}
            </div>
        </div>
    );
}

function CompanySection() {
    const { user, business } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        businessName: "",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        cnpj: "",
    });

    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        if (business) {
            setForm({
                businessName: business.businessName || "",
                phone: business.phone || "",
                whatsapp: business.whatsapp || "",
                email: business.email || "",
                address: business.address || "",
                cnpj: business.cnpj || "",
            });
        }
    }, [business]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;

        if (name === "phone" || name === "whatsapp") {
            finalValue = maskPhone(value);
        }

        if (name === "cnpj") {
            finalValue = maskCNPJ(value);
        }

        setForm((f) => ({
            ...f,
            [name]: finalValue,
        }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setUploadingLogo(true);

        try {
            await uploadCompanyLogo(user.uid, file);
            toast.success("Logo atualizada.");
        } catch (err) {
            console.error(err);
            toast.error(
                "Não foi possível enviar a logo. Verifique se o Storage está ativado."
            );
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            await updateCompanyProfile(user.uid, form);
            toast.success("Dados da empresa atualizados.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="
                config-card
                w-full
                min-w-0
                space-y-4
                rounded-2xl
                border
                border-line
                bg-surface
                p-5
            "
        >
            {/* Logo */}
            <div className="config-upload-row flex min-w-0 items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-xl
                        border
                        border-dashed
                        border-line
                        bg-paper-dim
                        text-ink-soft
                        transition
                        hover:border-pine-700
                        hover:text-pine-800
                    "
                >
                    {business?.logoUrl ? (
                        <img
                            src={business.logoUrl}
                            alt="Logo"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImagePlus size={20} />
                    )}
                </button>

                <div className="min-w-0 flex-1 text-sm text-ink-soft">
                    <p className="font-medium text-ink">
                        Logo da empresa
                    </p>

                    <p className="break-words">
                        Aparece na sidebar e em relatórios futuros.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                />
            </div>

            {/* Nome */}
            <div className="w-full min-w-0">
                <Input
                    id="businessName"
                    name="businessName"
                    label="Nome da empresa"
                    icon={Building2}
                    value={form.businessName}
                    onChange={handleChange}
                />
            </div>

            {/* Telefone / WhatsApp */}
            <div className="config-form-grid grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                    <Input
                        id="phone"
                        name="phone"
                        label="Telefone"
                        icon={Phone}
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={15}
                    />
                </div>

                <div className="min-w-0">
                    <Input
                        id="whatsapp"
                        name="whatsapp"
                        label="WhatsApp"
                        icon={MessageCircle}
                        value={form.whatsapp}
                        onChange={handleChange}
                        maxLength={15}
                    />
                </div>
            </div>

            {/* E-mail */}
            <div className="w-full min-w-0">
                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="E-mail"
                    icon={Mail}
                    value={form.email}
                    onChange={handleChange}
                />
            </div>

            {/* Endereço */}
            <div className="w-full min-w-0">
                <Input
                    id="address"
                    name="address"
                    label="Endereço"
                    icon={MapPin}
                    value={form.address}
                    onChange={handleChange}
                />
            </div>

            {/* CNPJ */}
            <div className="w-full min-w-0">
                <Input
                    id="cnpj"
                    name="cnpj"
                    label="CNPJ (opcional)"
                    icon={IdCard}
                    value={form.cnpj}
                    onChange={handleChange}
                    maxLength={18}
                />
            </div>

            {/* Botão */}
            <div className="config-action flex sm:justify-end">
                <Button
                    type="submit"
                    loading={saving}
                    className="w-full sm:w-auto"
                >
                    Salvar alterações
                </Button>
            </div>
        </form>
    );
}

function ProfileSection() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [name, setName] = useState(user?.displayName || "");
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setUploadingPhoto(true);

        try {
            await uploadUserAvatar(user, file);
            await refreshUser();
            toast.success("Foto de perfil atualizada.");
        } catch (err) {
            console.error(err);
            toast.error(
                "Não foi possível enviar a foto. Verifique se o Storage está ativado."
            );
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);

        try {
            await updateUserName(user, name);
            await refreshUser();
            toast.success("Perfil atualizado.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="
                config-card
                w-full
                min-w-0
                space-y-4
                rounded-2xl
                border
                border-line
                bg-surface
                p-5
            "
        >
            {/* Foto */}
            <div className="config-upload-row flex min-w-0 items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border
                        border-dashed
                        border-line
                        bg-paper-dim
                        text-ink-soft
                        transition
                        hover:border-pine-700
                        hover:text-pine-800
                    "
                >
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImagePlus size={20} />
                    )}
                </button>

                <div className="min-w-0 flex-1 text-sm text-ink-soft">
                    <p className="font-medium text-ink">
                        Foto de perfil
                    </p>

                    <p className="break-words">
                        PNG ou JPG.
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                />
            </div>

            {/* Nome */}
            <div className="w-full min-w-0">
                <Input
                    id="name"
                    label="Nome"
                    icon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            {/* E-mail */}
            <div className="w-full min-w-0">
                <Input
                    id="email"
                    label="E-mail"
                    icon={Mail}
                    value={user?.email || ""}
                    disabled
                />
            </div>

            <p className="-mt-2 text-xs text-ink-soft">
                O e-mail de acesso não pode ser alterado por aqui.
            </p>

            <div className="config-action flex sm:justify-end">
                <Button
                    type="submit"
                    loading={saving}
                    className="w-full sm:w-auto"
                >
                    Salvar alterações
                </Button>
            </div>
        </form>
    );
}

function PreferencesSection() {
    const { business, user } = useAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();

    const [currency, setCurrency] = useState(
        business?.currency || "BRL"
    );

    const [timezone, setTimezone] = useState(
        business?.timezone || "America/Sao_Paulo"
    );

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (business) {
            setCurrency(business.currency || "BRL");
            setTimezone(
                business.timezone || "America/Sao_Paulo"
            );
        }
    }, [business]);

    const handleSave = async () => {
        setSaving(true);

        try {
            await updatePreferences(user.uid, {
                theme,
                currency,
                timezone,
            });

            toast.success("Preferências salvas.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="
                config-card
                w-full
                min-w-0
                space-y-5
                rounded-2xl
                border
                border-line
                bg-surface
                p-5
            "
        >
            {/* Tema */}
            <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-ink">
                    Tema
                </label>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`
                            flex
                            min-w-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            py-2.5
                            text-sm
                            font-medium
                            transition
                            ${theme === "light"
                                ? "border-pine-800 bg-pine-900 text-white"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }
                        `}
                    >
                        <Sun size={16} className="shrink-0" />
                        <span>Claro</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`
                            flex
                            min-w-0
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            py-2.5
                            text-sm
                            font-medium
                            transition
                            ${theme === "dark"
                                ? "border-pine-800 bg-pine-900 text-white"
                                : "border-line text-ink-soft hover:bg-paper-dim"
                            }
                        `}
                    >
                        <Moon size={16} className="shrink-0" />
                        <span>Escuro</span>
                    </button>
                </div>
            </div>

            {/* Moeda / Fuso */}
            <div className="config-form-grid grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                        Moeda
                    </label>

                    <Select
                        options={[
                            {
                                value: "BRL",
                                label: "Real (R$)",
                            },
                            {
                                value: "USD",
                                label: "Dólar (US$)",
                            },
                            {
                                value: "EUR",
                                label: "Euro (€)",
                            },
                        ]}
                        value={currency}
                        onChange={(e) =>
                            setCurrency(e.target.value)
                        }
                    />
                </div>

                <div className="min-w-0">
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                        Fuso horário
                    </label>

                    <Select
                        options={[
                            {
                                value: "America/Sao_Paulo",
                                label: "Brasília (GMT-3)",
                            },
                            {
                                value: "America/Manaus",
                                label: "Manaus (GMT-4)",
                            },
                            {
                                value: "America/Rio_Branco",
                                label: "Rio Branco (GMT-5)",
                            },
                            {
                                value: "America/Noronha",
                                label: "Fernando de Noronha (GMT-2)",
                            },
                        ]}
                        value={timezone}
                        onChange={(e) =>
                            setTimezone(e.target.value)
                        }
                    />
                </div>
            </div>

            <p className="break-words text-xs text-ink-soft">
                O tema é aplicado imediatamente. Moeda e fuso horário
                ficam salvos para uso em telas futuras.
            </p>

            <div className="config-action flex sm:justify-end">
                <Button
                    onClick={handleSave}
                    loading={saving}
                    className="w-full sm:w-auto"
                >
                    Salvar preferências
                </Button>
            </div>
        </div>
    );
}

function SecuritySection() {
    const { user } = useAuth();
    const toast = useToast();

    const [sendingReset, setSendingReset] = useState(false);

    const handlePasswordReset = async () => {
        setSendingReset(true);

        try {
            await resetPassword(user.email);

            toast.success(
                `Enviamos um link de redefinição de senha para ${user.email}.`
            );
        } catch (err) {
            console.error(err);
            toast.error(
                "Não foi possível enviar o e-mail. Tente novamente."
            );
        } finally {
            setSendingReset(false);
        }
    };

    return (
        <div className="w-full min-w-0 space-y-4">
            {/* Alterar senha */}
            <div
                className="
                    config-card
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-line
                    bg-surface
                    p-5
                "
            >
                <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-full bg-paper-dim p-2">
                        <KeyRound
                            size={18}
                            className="text-pine-800"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">
                            Alterar senha
                        </p>

                        <p className="break-words text-sm text-ink-soft">
                            Enviaremos um link de redefinição de senha
                            para o seu e-mail cadastrado.
                        </p>
                    </div>
                </div>

                <div className="config-action mt-4 flex sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handlePasswordReset}
                        loading={sendingReset}
                        className="w-full sm:w-auto"
                    >
                        Enviar link de redefinição
                    </Button>
                </div>
            </div>

            {/* Sair */}
            <div
                className="
                    config-card
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-line
                    bg-surface
                    p-5
                "
            >
                <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-full bg-danger-100 p-2">
                        <LogOut
                            size={18}
                            className="text-danger"
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink">
                            Sair da conta
                        </p>

                        <p className="break-words text-sm text-ink-soft">
                            Encerra sua sessão neste dispositivo.
                        </p>
                    </div>
                </div>

                <div className="config-action mt-4 flex sm:justify-end">
                    <Button
                        variant="danger"
                        onClick={logout}
                        className="w-full sm:w-auto"
                    >
                        Sair
                    </Button>
                </div>
            </div>
        </div>
    );
}
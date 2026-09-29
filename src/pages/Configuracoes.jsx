import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    CalendarClock,
    Link2,
    Copy,
    Check,
    Plus,
    X,
} from "lucide-react";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Switch from "../components/ui/Switch";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { maskPhone, maskCNPJ } from "../utils/masks";
import {
    updateCompanyProfile,
    uploadCompanyLogo,
    updatePreferences,
    updateOnlineBookingSettings,
} from "../services/businessService";
import { reservePublicSlug, normalizeSlug, syncBusinessPublicMirror } from "../services/customerPortalService";
import { updateUserName, uploadUserAvatar } from "../services/userProfileService";
import { logout, resetPassword } from "../services/authService";
import DemoDataSection from "../components/settings/DemoDataSection";
import useIsDemoAccount from "../hooks/useDemoAccount";
import { DEMO_DISABLED_MESSAGE } from "../utils/demoGuard";

const TABS = [
    { value: "company", label: "Empresa", icon: Building2 },
    { value: "onlineBooking", label: "Agendamento Online", icon: CalendarClock },
    { value: "profile", label: "Perfil", icon: User },
    { value: "preferences", label: "Preferências", icon: Sliders },
    { value: "security", label: "Segurança", icon: Shield },
];

export default function Configuracoes() {
    const [tab, setTab] = useState("company");

    return (
        <div className="space-y-5">
            <div className="flex overflow-x-auto rounded-xl border border-line bg-surface p-1">
                {TABS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => setTab(value)}
                        className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === value ? "bg-pine-900 text-white" : "text-ink-soft hover:bg-paper-dim"
                            }`}
                    >
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl">
                {tab === "company" && <CompanySection />}
                {tab === "onlineBooking" && <OnlineBookingSection />}
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
    const isDemo = useIsDemoAccount();
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
        if (name === "phone" || name === "whatsapp") finalValue = maskPhone(value);
        if (name === "cnpj") finalValue = maskCNPJ(value);
        setForm((f) => ({ ...f, [name]: finalValue }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            e.target.value = "";
            return;
        }
        setUploadingLogo(true);
        try {
            await uploadCompanyLogo(user.uid, file);
            toast.success("Logo atualizada.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível enviar a logo. Verifique se o Storage está ativado.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            return;
        }
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
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper-dim text-ink-soft hover:border-pine-700 hover:text-pine-800"
                >
                    {business?.logoUrl ? (
                        <img src={business.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                        <ImagePlus size={20} />
                    )}
                </button>
                <div className="text-sm text-ink-soft">
                    <p className="font-medium text-ink">Logo da empresa</p>
                    <p>Aparece na sidebar e em relatórios futuros.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>

            <Input
                id="businessName"
                name="businessName"
                label="Nome da empresa"
                icon={Building2}
                value={form.businessName}
                onChange={handleChange}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input id="phone" name="phone" label="Telefone" icon={Phone} value={form.phone} onChange={handleChange} maxLength={15} />
                <Input id="whatsapp" name="whatsapp" label="WhatsApp" icon={MessageCircle} value={form.whatsapp} onChange={handleChange} maxLength={15} />
            </div>

            <Input id="email" name="email" type="email" label="E-mail" icon={Mail} value={form.email} onChange={handleChange} />
            <Input id="address" name="address" label="Endereço" icon={MapPin} value={form.address} onChange={handleChange} />
            <Input id="cnpj" name="cnpj" label="CNPJ (opcional)" icon={IdCard} value={form.cnpj} onChange={handleChange} maxLength={18} />

            <div className="flex justify-end">
                <Button className="btn-fx btn-pine rounded-xl w-full sm:w-auto sm:shrink-0" type="submit" loading={saving}>Salvar alterações</Button>
            </div>
        </form>
    );
}

// ══════════════════════════════════════════════════════════════════════
// NOVO (Fase 6) — Seção "Agendamento Online"
// ══════════════════════════════════════════════════════════════════════

const WEEKDAYS = [
    ["monday", "Segunda"],
    ["tuesday", "Terça"],
    ["wednesday", "Quarta"],
    ["thursday", "Quinta"],
    ["friday", "Sexta"],
    ["saturday", "Sábado"],
    ["sunday", "Domingo"],
];

const DEFAULT_DAY = { enabled: true, start: "09:00", end: "18:00", breaks: [] };
const DEFAULT_ONLINE_BOOKING = {
    enabled: false,
    showProducts: false,
    showPrices: true,
    allowCancellation: true,
    showAddress: true,
    showContact: true,
    minimumAdvanceMinutes: 120,
    maximumAdvanceDays: 30,
    slotIntervalMinutes: 15,
};

function buildDefaultHours() {
    return WEEKDAYS.reduce((acc, [key]) => {
        acc[key] = { ...DEFAULT_DAY, enabled: key !== "sunday" };
        return acc;
    }, {});
}

function OnlineBookingSection() {
    const { user, business } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();

    const [slugInput, setSlugInput] = useState("");
    const [savingSlug, setSavingSlug] = useState(false);
    const [copied, setCopied] = useState(false);

    const [onlineBooking, setOnlineBooking] = useState(DEFAULT_ONLINE_BOOKING);
    const [businessHours, setBusinessHours] = useState(buildDefaultHours());
    const [blockedDates, setBlockedDates] = useState([]);
    const [newBlockedDate, setNewBlockedDate] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!business) return;
        setSlugInput(business.publicSlug || "");
        setOnlineBooking({ ...DEFAULT_ONLINE_BOOKING, ...(business.onlineBooking || {}) });
        setBusinessHours(
            business.businessHours
                ? { ...buildDefaultHours(), ...business.businessHours }
                : buildDefaultHours()
        );
        setBlockedDates(Array.isArray(business.blockedDates) ? business.blockedDates : []);
    }, [business]);

    const publicUrl = slugInput
        ? `${window.location.origin}${import.meta.env.BASE_URL}agendar/${normalizeSlug(slugInput)}`
        : "";

    async function handleSaveSlug() {
        if (isDemo) return toast.info(DEMO_DISABLED_MESSAGE);
        setSavingSlug(true);
        try {
            const { slug } = await reservePublicSlug(user.uid, slugInput);
            setSlugInput(slug);
            await syncBusinessPublicMirror(user.uid, { ...business, publicSlug: slug, onlineBooking, businessHours, blockedDates });
            toast.success("Link público salvo.");
        } catch (err) {
            toast.error(err.message || "Não foi possível salvar o link.");
        } finally {
            setSavingSlug(false);
        }
    }

    function handleCopyLink() {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function updateDay(dayKey, patch) {
        setBusinessHours((h) => ({ ...h, [dayKey]: { ...h[dayKey], ...patch } }));
    }

    function toggleDayBreak(dayKey, hasBreak) {
        setBusinessHours((h) => ({
            ...h,
            [dayKey]: { ...h[dayKey], breaks: hasBreak ? [{ start: "12:00", end: "13:00" }] : [] },
        }));
    }

    function updateDayBreak(dayKey, field, value) {
        setBusinessHours((h) => ({
            ...h,
            [dayKey]: {
                ...h[dayKey],
                breaks: [{ ...(h[dayKey].breaks[0] || { start: "12:00", end: "13:00" }), [field]: value }],
            },
        }));
    }

    function addBlockedDate() {
        if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
        setBlockedDates((d) => [...d, newBlockedDate].sort());
        setNewBlockedDate("");
    }

    function removeBlockedDate(date) {
        setBlockedDates((d) => d.filter((x) => x !== date));
    }

    async function handleSave() {
        if (isDemo) return toast.info(DEMO_DISABLED_MESSAGE);
        setSaving(true);
        try {
            await updateOnlineBookingSettings(user.uid, business, {
                onlineBooking,
                businessHours,
                blockedDates,
            });
            toast.success("Configurações de agendamento online salvas.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            {/* Ligar/desligar + link público */}
            <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-ink">Agendamento online</p>
                        <p className="text-sm text-ink-soft">
                            Permite que clientes agendem sozinhos pelo link público, sem precisar te ligar.
                        </p>
                    </div>
                    <Switch
                        checked={onlineBooking.enabled}
                        onChange={(checked) => setOnlineBooking((o) => ({ ...o, enabled: checked }))}
                    />
                </div>

                <div className="border-t border-line pt-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                        <Link2 size={14} /> Link público
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={slugInput}
                            onChange={(e) => setSlugInput(e.target.value)}
                            placeholder="barbearia-do-joao"
                            className="flex-1"
                        />
                        <Button type="button" variant="outline" onClick={handleSaveSlug} loading={savingSlug}>
                            Salvar link
                        </Button>
                    </div>
                    {business?.publicSlug && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-paper-dim px-3 py-2 text-xs text-ink-soft">
                            <span className="flex-1 truncate">{publicUrl}</span>
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex shrink-0 items-center gap-1 font-medium text-pine-800 hover:underline"
                            >
                                {copied ? <Check size={13} /> : <Copy size={13} />}
                                {copied ? "Copiado!" : "Copiar"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* O que aparece publicamente */}
            <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <p className="font-medium text-ink">O que aparece para o cliente</p>
                <SwitchRow
                    label="Mostrar preços dos serviços"
                    checked={onlineBooking.showPrices}
                    onChange={(v) => setOnlineBooking((o) => ({ ...o, showPrices: v }))}
                />
                <SwitchRow
                    label="Permitir cancelamento pelo cliente"
                    checked={onlineBooking.allowCancellation}
                    onChange={(v) => setOnlineBooking((o) => ({ ...o, allowCancellation: v }))}
                />
                <SwitchRow
                    label="Mostrar endereço"
                    checked={onlineBooking.showAddress}
                    onChange={(v) => setOnlineBooking((o) => ({ ...o, showAddress: v }))}
                />
                <SwitchRow
                    label="Mostrar telefone / WhatsApp"
                    checked={onlineBooking.showContact}
                    onChange={(v) => setOnlineBooking((o) => ({ ...o, showContact: v }))}
                />
            </div>

            {/* Prazos */}
            <div className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                <p className="font-medium text-ink">Prazos</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Antecedência mínima (minutos)</label>
                        <Input
                            type="number"
                            min="0"
                            step="15"
                            value={onlineBooking.minimumAdvanceMinutes}
                            onChange={(e) =>
                                setOnlineBooking((o) => ({ ...o, minimumAdvanceMinutes: Number(e.target.value) || 0 }))
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Agendamento máximo (dias no futuro)</label>
                        <Input
                            type="number"
                            min="1"
                            value={onlineBooking.maximumAdvanceDays}
                            onChange={(e) =>
                                setOnlineBooking((o) => ({ ...o, maximumAdvanceDays: Number(e.target.value) || 1 }))
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Horário de funcionamento */}
            <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
                <p className="font-medium text-ink">Horário de funcionamento</p>
                <div className="space-y-2">
                    {WEEKDAYS.map(([key, label]) => {
                        const day = businessHours[key] || DEFAULT_DAY;
                        const hasBreak = day.breaks?.length > 0;
                        return (
                            <div key={key} className="rounded-xl border border-line p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <Switch
                                        checked={day.enabled}
                                        onChange={(checked) => updateDay(key, { enabled: checked })}
                                        label={label}
                                    />
                                    {day.enabled && (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <input
                                                type="time"
                                                value={day.start}
                                                onChange={(e) => updateDay(key, { start: e.target.value })}
                                                className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
                                            />
                                            <span className="text-ink-soft">às</span>
                                            <input
                                                type="time"
                                                value={day.end}
                                                onChange={(e) => updateDay(key, { end: e.target.value })}
                                                className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
                                            />
                                        </div>
                                    )}
                                </div>

                                {day.enabled && (
                                    <div className="mt-2 flex flex-wrap items-center gap-2 pl-11 text-xs">
                                        <label className="flex items-center gap-1.5 text-ink-soft">
                                            <input
                                                type="checkbox"
                                                checked={hasBreak}
                                                onChange={(e) => toggleDayBreak(key, e.target.checked)}
                                            />
                                            Intervalo (almoço)
                                        </label>
                                        {hasBreak && (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="time"
                                                    value={day.breaks[0]?.start || "12:00"}
                                                    onChange={(e) => updateDayBreak(key, "start", e.target.value)}
                                                    className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
                                                />
                                                <span className="text-ink-soft">às</span>
                                                <input
                                                    type="time"
                                                    value={day.breaks[0]?.end || "13:00"}
                                                    onChange={(e) => updateDayBreak(key, "end", e.target.value)}
                                                    className="rounded-lg border border-line bg-surface px-2 py-1 text-ink"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bloqueios / feriados */}
            <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
                <p className="font-medium text-ink">Datas bloqueadas (feriados, folgas)</p>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={newBlockedDate}
                        onChange={(e) => setNewBlockedDate(e.target.value)}
                        className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                    />
                    <Button type="button" variant="outline" onClick={addBlockedDate} icon={Plus}>
                        Adicionar
                    </Button>
                </div>
                {blockedDates.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {blockedDates.map((date) => (
                            <span
                                key={date}
                                className="flex items-center gap-1.5 rounded-full bg-paper-dim px-3 py-1 text-xs text-ink"
                            >
                                {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                                <button onClick={() => removeBlockedDate(date)} aria-label="Remover data">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <Button className="btn-fx btn-pine rounded-xl w-full sm:w-auto sm:shrink-0" onClick={handleSave} loading={saving}>
                    Salvar configurações
                </Button>
            </div>
        </div>
    );
}

function SwitchRow({ label, checked, onChange }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-ink">{label}</span>
            <Switch checked={checked} onChange={onChange} />
        </div>
    );
}

function ProfileSection() {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const isDemo = useIsDemoAccount();
    const fileInputRef = useRef(null);
    const [name, setName] = useState(user?.displayName || "");
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        setName(user?.displayName || "");
    }, [user]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            e.target.value = "";
            return;
        }
        setUploadingPhoto(true);
        try {
            await uploadUserAvatar(user.uid, file);
            await refreshUser();
            toast.success("Foto atualizada.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível enviar a foto.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            return;
        }
        setSaving(true);
        try {
            await updateUserName(name);
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
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-line bg-paper-dim text-ink-soft hover:border-pine-700 hover:text-pine-800"
                >
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="Foto de perfil" className="h-full w-full object-cover" />
                    ) : (
                        <User size={22} />
                    )}
                </button>
                <div className="text-sm text-ink-soft">
                    <p className="font-medium text-ink">Foto de perfil</p>
                    <p>PNG ou JPG.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            <Input id="name" label="Nome" icon={User} value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" label="E-mail" icon={Mail} value={user?.email || ""} disabled />
            <p className="-mt-2 text-xs text-ink-soft">
                O e-mail de acesso não pode ser alterado por aqui.
            </p>

            <div className="flex justify-end">
                <Button className="btn-fx btn-pine rounded-xl w-full sm:w-auto sm:shrink-0" type="submit" loading={saving}>
                    Salvar alterações
                </Button>
            </div>
        </form>
    );
}

function PreferencesSection() {
    const { business } = useAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();
    const { user } = useAuth();
    const isDemo = useIsDemoAccount();
    const [currency, setCurrency] = useState(business?.currency || "BRL");
    const [timezone, setTimezone] = useState(business?.timezone || "America/Sao_Paulo");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (business) {
            setCurrency(business.currency || "BRL");
            setTimezone(business.timezone || "America/Sao_Paulo");
        }
    }, [business]);

    const handleSave = async () => {
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            return;
        }
        setSaving(true);
        try {
            await updatePreferences(user.uid, { theme, currency, timezone });
            toast.success("Preferências salvas.");
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível salvar. Tente novamente.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-5 rounded-2xl border border-line bg-surface p-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">Tema</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setTheme("light")}
                            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${theme === "light" ? "border-pine-800 bg-pine-900 text-white" : "border-line text-ink-soft hover:bg-paper-dim"
                                }`}
                        >
                            <Sun size={16} /> Claro
                        </button>
                        <button
                            type="button"
                            onClick={() => setTheme("dark")}
                            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${theme === "dark" ? "border-pine-800 bg-pine-900 text-white" : "border-line text-ink-soft hover:bg-paper-dim"
                                }`}
                        >
                            <Moon size={16} /> Escuro
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Moeda</label>
                        <Select
                            options={[
                                { value: "BRL", label: "Real (R$)" },
                                { value: "USD", label: "Dólar (US$)" },
                                { value: "EUR", label: "Euro (€)" },
                            ]}
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink">Fuso horário</label>
                        <Select
                            options={[
                                { value: "America/Sao_Paulo", label: "Brasília (GMT-3)" },
                                { value: "America/Manaus", label: "Manaus (GMT-4)" },
                                { value: "America/Rio_Branco", label: "Rio Branco (GMT-5)" },
                                { value: "America/Noronha", label: "Fernando de Noronha (GMT-2)" },
                            ]}
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                        />
                    </div>
                </div>

                <p className="text-xs text-ink-soft">
                    O tema é aplicado imediatamente. Moeda e fuso horário ficam salvos para uso em telas futuras.
                </p>

                <div className="flex justify-end">
                    <Button className="btn-fx btn-pine rounded-xl w-full sm:w-auto sm:shrink-0" onClick={handleSave} loading={saving}>Salvar preferências</Button>
                </div>
            </div>

            <div className="mt-5">
                <DemoDataSection />
            </div>
        </>
    );
}

function SecuritySection() {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const isDemo = useIsDemoAccount();
    const [sendingReset, setSendingReset] = useState(false);

    const handleLogout = async () => {
        navigate("/", { replace: true });
        try {
            await logout();
        } catch {
            toast.error("Não foi possível sair. Tente novamente.");
        }
    };

    const handlePasswordReset = async () => {
        if (isDemo) {
            toast.info(DEMO_DISABLED_MESSAGE);
            return;
        }
        setSendingReset(true);
        try {
            await resetPassword(user.email);
            toast.success(`Enviamos um link de redefinição de senha para ${user.email}.`);
        } catch (err) {
            console.error(err);
            toast.error("Não foi possível enviar o e-mail. Tente novamente.");
        } finally {
            setSendingReset(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-paper-dim p-2">
                        <KeyRound size={18} className="text-pine-800" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-ink">Alterar senha</p>
                        <p className="text-sm text-ink-soft">
                            Enviaremos um link de redefinição de senha para o seu e-mail cadastrado.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={handlePasswordReset} loading={sendingReset}>
                        Enviar link de redefinição
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-start gap-3">
                    <div className="rounded-full bg-danger-100 p-2">
                        <LogOut size={18} className="text-danger" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-ink">Sair da conta</p>
                        <p className="text-sm text-ink-soft">Encerra sua sessão neste dispositivo.</p>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button variant="danger" onClick={handleLogout}>Sair</Button>
                </div>
            </div>
        </div>
    );
}
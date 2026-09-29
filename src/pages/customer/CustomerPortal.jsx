import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { ArrowLeft, CalendarCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock, MapPin, Phone } from "lucide-react";
import { usePublicBusiness } from "../../hooks/usePublicBusiness";
import { useAvailableSlots } from "../../hooks/useAvailableSlots";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { createOnlineAppointment } from "../../services/customerBookingService";
import {
    loginCustomer,
    registerCustomer,
    translateCustomerAuthError,
} from "../../services/customerAuthService";
import { FullPageLoading, Spinner } from "../../components/ui/Loading";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const MAX_DAYS_SHOWN = 30;

function formatPrice(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function generateDayList(timezone, maxAdvanceDays) {
    const start = DateTime.now().setZone(timezone).startOf("day");
    const total = Math.min(maxAdvanceDays ?? 30, MAX_DAYS_SHOWN);
    const days = [];
    for (let i = 0; i <= total; i++) {
        const d = start.plus({ days: i });
        days.push({
            dateStr: d.toFormat("yyyy-MM-dd"),
            weekday: d.setLocale("pt-BR").toFormat("EEE"),
            dayNumber: d.toFormat("dd"),
            month: d.setLocale("pt-BR").toFormat("MMM"),
            isToday: i === 0,
        });
    }
    return days;
}

export default function CustomerPortal() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { business, services, loading, error } = usePublicBusiness(slug);
    const { isAuthenticated, isBusinessAccount } = useCustomerAuth();

    const [step, setStep] = useState("service"); // service -> datetime -> auth -> confirm -> success
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlotISO, setSelectedSlotISO] = useState(null);
    const [authTab, setAuthTab] = useState("login"); // login | register
    const [authForm, setAuthForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [confirmError, setConfirmError] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // Carrossel de dias: setas para quem usa mouse (desktop)
    const daysScrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = useCallback(() => {
        const el = daysScrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    function scrollDays(direction) {
        const el = daysScrollRef.current;
        if (!el) return;
        // rola ~4 dias por clique
        el.scrollBy({ left: direction * 4 * 76, behavior: "smooth" });
    }

    const timezone = business?.timezone || "America/Sao_Paulo";
    const days = useMemo(
        () => (business ? generateDayList(timezone, business.onlineBooking?.maximumAdvanceDays) : []),
        [business, timezone]
    );

    useEffect(() => {
        updateScrollButtons();
        window.addEventListener("resize", updateScrollButtons);
        return () => window.removeEventListener("resize", updateScrollButtons);
    }, [days, step, updateScrollButtons]);

    const { slots, loading: loadingSlots, error: slotsError } = useAvailableSlots({
        businessId: business?.id,
        serviceId: selectedService?.id,
        dateStr: selectedDate,
    });

    if (loading) return <FullPageLoading label="Carregando empresa..." />;

    if (error) {
        return (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                <p className="text-sm text-danger">{error}</p>
            </div>
        );
    }

    function selectService(service) {
        setSelectedService(service);
        setSelectedDate(days[0]?.dateStr || null);
        setSelectedSlotISO(null);
        setStep("datetime");
    }

    function selectSlot(iso) {
        setSelectedSlotISO(iso);
        // Se estiver "logado" só porque a sessão do navegador é de uma
        // conta de EMPRESA (não de cliente), não dá pra pular pra
        // confirmação — precisa entrar (ou trocar de conta) como cliente.
        setStep(isAuthenticated && !isBusinessAccount ? "confirm" : "auth");
    }

    async function handleAuthSubmit(e) {
        e.preventDefault();
        setAuthError("");
        setAuthLoading(true);
        try {
            if (authTab === "login") {
                await loginCustomer(authForm.email, authForm.password);
            } else {
                await registerCustomer(authForm);
            }
            setStep("confirm");
        } catch (err) {
            setAuthError(translateCustomerAuthError(err));
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleConfirm() {
        setConfirmError("");
        setConfirming(true);
        try {
            const result = await createOnlineAppointment({
                businessId: business.id,
                serviceId: selectedService.id,
                slotISO: selectedSlotISO,
            });
            setSuccessData(result);
            setStep("success");
        } catch (err) {
            setConfirmError(err.message || "Não foi possível concluir o agendamento.");
        } finally {
            setConfirming(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Cabeçalho da empresa — sempre visível */}
            <div className="rounded-2xl border border-line bg-surface p-6">
                <h1 className="font-display text-xl font-semibold text-ink">{business.businessName}</h1>
                {business.description && <p className="mt-1 text-sm text-ink-soft">{business.description}</p>}
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
                    {business.address && (
                        <span className="flex items-center gap-1.5">
                            <MapPin size={14} /> {business.address}
                        </span>
                    )}
                    {business.phone && (
                        <span className="flex items-center gap-1.5">
                            <Phone size={14} /> {business.phone}
                        </span>
                    )}
                </div>
            </div>

            {isBusinessAccount && (
                <p className="rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-700">
                    Você está logado com uma conta de empresa neste navegador. Para agendar como cliente, use uma
                    conta de cliente (o cadastro/login abaixo é separado).
                </p>
            )}

            {/* ── Passo 1: serviço ───────────────────────────────────────── */}
            {step === "service" && (
                <div className="rounded-2xl border border-line bg-surface p-6">
                    <h2 className="font-display text-base font-semibold text-ink">Escolha um serviço</h2>
                    {services.length === 0 ? (
                        <p className="mt-3 text-sm text-ink-soft">
                            Nenhum serviço disponível para agendamento online no momento.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {services.map((s) => (
                                <li key={s.id}>
                                    <button
                                        onClick={() => selectService(s)}
                                        className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left transition hover:border-pine-700 hover:bg-pine-900/5"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-ink">{s.name}</p>
                                            {s.description && <p className="text-xs text-ink-soft">{s.description}</p>}
                                            <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                                                <Clock size={12} /> {s.duration} min
                                            </p>
                                        </div>
                                        {s.price != null && (
                                            <p className="text-sm font-semibold text-ink">{formatPrice(s.price)}</p>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* ── Passo 2: dia + horário ─────────────────────────────────── */}
            {step === "datetime" && selectedService && (
                <div className="space-y-4">
                    <button
                        onClick={() => setStep("service")}
                        className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                    >
                        <ArrowLeft size={15} /> Trocar serviço
                    </button>

                    <div className="rounded-2xl border border-line bg-surface p-6">
                        <p className="text-sm font-medium text-ink">{selectedService.name}</p>
                        <p className="text-xs text-ink-soft">
                            {selectedService.duration} min
                            {selectedService.price != null && ` · ${formatPrice(selectedService.price)}`}
                        </p>

                        <h3 className="mt-6 text-sm font-semibold text-ink">Escolha o dia</h3>
                        {/* w-* + shrink-0 em vez de min-w-*: o index.css tem regras sem @layer
                            (min-width:0 e font-size:inherit) que vencem os utilitários do Tailwind.
                            Os tamanhos de fonte ficam nos <span> internos pelo mesmo motivo. */}
                        <div className="mt-3 flex items-center gap-2">
                            {/* Setas ficam FORA da lista (só no desktop). "invisible" mantém o espaço
                                reservado para o layout não pular quando a seta some. */}
                            <button
                                type="button"
                                onClick={() => scrollDays(-1)}
                                aria-label="Dias anteriores"
                                disabled={!canScrollLeft}
                                className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-pine-700 hover:bg-paper-dim sm:flex ${canScrollLeft ? "" : "invisible"
                                    }`}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div
                                ref={daysScrollRef}
                                onScroll={updateScrollButtons}
                                className="-mx-6 flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto px-6 pb-3 sm:mx-0 sm:px-0"
                                style={{ scrollbarWidth: "none" }}
                            >
                                {days.map((d) => {
                                    const active = selectedDate === d.dateStr;
                                    return (
                                        <button
                                            key={d.dateStr}
                                            onClick={() => {
                                                setSelectedDate(d.dateStr);
                                                setSelectedSlotISO(null);
                                            }}
                                            className={`flex w-[68px] shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl border px-2 py-3 transition ${active
                                                    ? "border-pine-900 bg-pine-900 text-white shadow-md shadow-pine-900/20"
                                                    : "border-line bg-surface text-ink hover:border-pine-700 hover:bg-paper-dim"
                                                }`}
                                        >
                                            <span
                                                className={`text-[11px] font-semibold uppercase leading-none tracking-wide ${active ? "text-white/80" : d.isToday ? "text-amber-600" : "text-ink-soft"
                                                    }`}
                                            >
                                                {d.isToday ? "Hoje" : d.weekday.replace(".", "")}
                                            </span>
                                            <span className="font-display text-xl font-semibold leading-tight">
                                                {d.dayNumber}
                                            </span>
                                            <span
                                                className={`text-[11px] uppercase leading-none ${active ? "text-white/80" : "text-ink-soft"
                                                    }`}
                                            >
                                                {d.month.replace(".", "")}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => scrollDays(1)}
                                aria-label="Próximos dias"
                                disabled={!canScrollRight}
                                className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-pine-700 hover:bg-paper-dim sm:flex ${canScrollRight ? "" : "invisible"
                                    }`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-ink">Escolha o horário</h3>
                        {loadingSlots ? (
                            <div className="mt-3 flex justify-center py-6">
                                <Spinner />
                            </div>
                        ) : slotsError ? (
                            <p className="mt-3 text-sm text-danger">{slotsError}</p>
                        ) : slots.length === 0 ? (
                            <p className="mt-3 text-sm text-ink-soft">Nenhum horário disponível neste dia.</p>
                        ) : (
                            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                                {slots.map((iso) => (
                                    <button
                                        key={iso}
                                        onClick={() => selectSlot(iso)}
                                        className="rounded-xl border border-line bg-surface px-2 py-2.5 text-ink transition hover:border-pine-900 hover:bg-pine-900 hover:text-white active:scale-95"
                                    >
                                        <span className="text-sm font-medium tabular-nums">
                                            {DateTime.fromISO(iso).setZone(timezone).toFormat("HH:mm")}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Passo 3: login/cadastro (só se necessário) ───────────────── */}
            {step === "auth" && (
                <div className="space-y-4">
                    <button
                        onClick={() => setStep("datetime")}
                        className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                    >
                        <ArrowLeft size={15} /> Trocar horário
                    </button>

                    <div className="rounded-2xl border border-line bg-surface p-6">
                        <h2 className="font-display text-base font-semibold text-ink">
                            {authTab === "login" ? "Entre para confirmar" : "Crie sua conta para confirmar"}
                        </h2>
                        {isBusinessAccount && (
                            <p className="mt-2 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-700">
                                Este navegador está com uma conta de empresa logada. Entre abaixo com o e-mail e
                                senha da sua conta de <strong>cliente</strong> (uma conta diferente da conta de
                                empresa) para continuar.
                            </p>
                        )}
                        <div className="mt-4 flex gap-2 border-b border-line">
                            <button
                                onClick={() => setAuthTab("login")}
                                className={`px-3 pb-2 text-sm font-medium ${authTab === "login" ? "border-b-2 border-pine-900 text-pine-900" : "text-ink-soft"
                                    }`}
                            >
                                Já tenho conta
                            </button>
                            <button
                                onClick={() => setAuthTab("register")}
                                className={`px-3 pb-2 text-sm font-medium ${authTab === "register" ? "border-b-2 border-pine-900 text-pine-900" : "text-ink-soft"
                                    }`}
                            >
                                Criar conta
                            </button>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
                            {authTab === "register" && (
                                <>
                                    <Input
                                        label="Nome completo"
                                        value={authForm.name}
                                        onChange={(e) => setAuthForm((f) => ({ ...f, name: e.target.value }))}
                                        required
                                    />
                                    <Input
                                        label="Telefone / WhatsApp"
                                        value={authForm.phone}
                                        onChange={(e) => setAuthForm((f) => ({ ...f, phone: e.target.value }))}
                                        required
                                    />
                                </>
                            )}
                            <Input
                                type="email"
                                label="E-mail"
                                value={authForm.email}
                                onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
                                required
                            />
                            <Input
                                type="password"
                                label="Senha"
                                minLength={6}
                                value={authForm.password}
                                onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                                required
                            />

                            {authError && <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{authError}</p>}

                            <Button type="submit" variant="primary" className="w-full" loading={authLoading}>
                                {authTab === "login" ? "Entrar e continuar" : "Criar conta e continuar"}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Passo 4: confirmação ──────────────────────────────────── */}
            {step === "confirm" && selectedService && selectedSlotISO && (
                <div className="space-y-4">
                    <button
                        onClick={() => setStep("datetime")}
                        className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                    >
                        <ArrowLeft size={15} /> Trocar horário
                    </button>

                    <div className="rounded-2xl border border-line bg-surface p-6">
                        <h2 className="font-display text-base font-semibold text-ink">Confirme seu agendamento</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-ink-soft">Empresa</dt>
                                <dd className="font-medium text-ink">{business.businessName}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-soft">Serviço</dt>
                                <dd className="font-medium text-ink">{selectedService.name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-soft">Data</dt>
                                <dd className="font-medium text-ink">
                                    {DateTime.fromISO(selectedSlotISO).setZone(timezone).setLocale("pt-BR").toFormat("dd/MM/yyyy")}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-ink-soft">Horário</dt>
                                <dd className="font-medium text-ink">
                                    {DateTime.fromISO(selectedSlotISO).setZone(timezone).toFormat("HH:mm")}
                                </dd>
                            </div>
                            {selectedService.price != null && (
                                <div className="flex justify-between">
                                    <dt className="text-ink-soft">Valor</dt>
                                    <dd className="font-medium text-ink">{formatPrice(selectedService.price)}</dd>
                                </div>
                            )}
                        </dl>

                        {confirmError && (
                            <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger">{confirmError}</p>
                        )}

                        <Button
                            onClick={handleConfirm}
                            variant="primary"
                            className="mt-5 w-full"
                            loading={confirming}
                            icon={CalendarCheck}
                        >
                            Confirmar agendamento
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Passo 5: sucesso ──────────────────────────────────────── */}
            {step === "success" && successData && (
                <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pine-900/10">
                        <CheckCircle2 size={28} className="text-pine-900" />
                    </div>
                    <h2 className="mt-4 font-display text-xl font-semibold text-ink">Agendamento realizado com sucesso!</h2>
                    <dl className="mx-auto mt-4 max-w-xs space-y-1 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Serviço</dt>
                            <dd className="font-medium text-ink">{successData.serviceName || selectedService?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Data</dt>
                            <dd className="font-medium text-ink">
                                {DateTime.fromISO(selectedSlotISO).setZone(timezone).setLocale("pt-BR").toFormat("dd/MM/yyyy")}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Horário</dt>
                            <dd className="font-medium text-ink">
                                {DateTime.fromISO(selectedSlotISO).setZone(timezone).toFormat("HH:mm")}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Empresa</dt>
                            <dd className="font-medium text-ink">{business.businessName}</dd>
                        </div>
                    </dl>
                    <Button
                        variant="primary"
                        className="mt-6"
                        onClick={() => navigate("/cliente/meus-agendamentos")}
                    >
                        Ver meus agendamentos
                    </Button>
                </div>
            )}
        </div>
    );
}
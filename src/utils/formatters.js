export function formatCurrency(value = 0, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value || 0);
}

export function formatDate(date) {
  const d = toDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function formatDateTime(date) {
  const d = toDate(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** Ex.: "quinta-feira, 01/10/2026 às 14:30" — usado para a data marcada de um agendamento. */
export function formatAppointmentDateTime(date) {
  const d = toDate(date);
  if (!d) return "—";
  const day = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${day} às ${time}`;
}

export function formatPercent(value = 0) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** Aceita Timestamp do Firestore, Date ou string/número. */
export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    addWeeks,
    addMonths,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    format,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/** Calcula o intervalo [início, fim) de datas para a visualização atual (dia/semana/mês). */
export function getRangeForView(view, referenceDate) {
    if (view === "day") {
        return { start: startOfDay(referenceDate), end: endOfDay(referenceDate) };
    }
    if (view === "week") {
        return {
            start: startOfWeek(referenceDate, { weekStartsOn: 0 }),
            end: endOfWeek(referenceDate, { weekStartsOn: 0 }),
        };
    }
    // month — inclui os dias da semana anterior/seguinte para preencher a grade
    const monthStart = startOfMonth(referenceDate);
    const monthEnd = endOfMonth(referenceDate);
    return {
        start: startOfWeek(monthStart, { weekStartsOn: 0 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
}

export function navigateDate(view, referenceDate, direction) {
    const amount = direction === "next" ? 1 : -1;
    if (view === "day") return addDays(referenceDate, amount);
    if (view === "week") return addWeeks(referenceDate, amount);
    return addMonths(referenceDate, amount);
}

export function getDaysInRange(start, end) {
    return eachDayOfInterval({ start, end });
}

export { isSameDay, isSameMonth };

export function formatHeaderLabel(view, referenceDate) {
    if (view === "day") return format(referenceDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    if (view === "week") return `Semana de ${format(startOfWeek(referenceDate, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}`;
    return format(referenceDate, "MMMM 'de' yyyy", { locale: ptBR });
}

export function formatWeekdayShort(date) {
    return format(date, "EEE", { locale: ptBR });
}

export function formatDayNumber(date) {
    return format(date, "d");
}

export function formatTime(date) {
    return format(date, "HH:mm");
}

export function combineDateAndTime(dateStr, timeStr) {
    // dateStr: "2026-09-14" | timeStr: "14:30"
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
}

export function toDateInputValue(date) {
    return format(date, "yyyy-MM-dd");
}

export function toTimeInputValue(date) {
    return format(date, "HH:mm");
}

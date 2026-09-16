import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
} from "date-fns";

export const PERIOD_OPTIONS = [
    { value: "today", label: "Hoje" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mês" },
    { value: "year", label: "Ano" },
    { value: "custom", label: "Personalizado" },
];

/** Converte a opção de período escolhida em um intervalo [start, end]. */
export function getPeriodRange(period, customStart, customEnd) {
    const now = new Date();

    if (period === "today") {
        return { start: startOfDay(now), end: endOfDay(now) };
    }
    if (period === "week") {
        return {
            start: startOfWeek(now, { weekStartsOn: 0 }),
            end: endOfWeek(now, { weekStartsOn: 0 }),
        };
    }
    if (period === "year") {
        return { start: startOfYear(now), end: endOfYear(now) };
    }
    if (period === "custom" && customStart && customEnd) {
        return {
            start: startOfDay(new Date(`${customStart}T00:00:00`)),
            end: endOfDay(new Date(`${customEnd}T00:00:00`)),
        };
    }
    // padrão: mês atual
    return { start: startOfMonth(now), end: endOfMonth(now) };
}

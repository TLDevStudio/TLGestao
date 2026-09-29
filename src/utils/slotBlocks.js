/** Granularidade fixa dos blocos de disponibilidade em todo o sistema. */
export const BUSY_SLOT_GRANULARITY_MINUTES = 15;

export function computeBlockIds(startDate, durationMinutes, intervalMinutes = 15) {
    const duration = Number(durationMinutes) || 30;
    const interval = Number(intervalMinutes) || 15;
    const blockCount = Math.max(1, Math.ceil(duration / interval));

    const blocks = [];
    for (let i = 0; i < blockCount; i++) {
        const t = new Date(startDate.getTime() + i * interval * 60000);
        blocks.push(t.toISOString());
    }
    return blocks;
}

/** Arredonda uma data para baixo, para o início do bloco de "intervalMinutes" em que ela cai. */
export function roundDownToInterval(date, intervalMinutes = 15) {
    const ms = intervalMinutes * 60000;
    return new Date(Math.floor(date.getTime() / ms) * ms);
}
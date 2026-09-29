import { collection, doc, documentId, getDoc, getDocs, query, where } from "firebase/firestore";
import { DateTime } from "luxon";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { computeBlockIds, BUSY_SLOT_GRANULARITY_MINUTES } from "../utils/slotBlocks";

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export async function getAvailableSlots({ businessId, serviceId, dateStr }) {
    const businessPublicSnap = await getDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId));
    if (!businessPublicSnap.exists() || businessPublicSnap.data().onlineBooking?.enabled !== true) {
        return [];
    }
    const bp = businessPublicSnap.data();

    const serviceSnap = await getDoc(
        doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES, serviceId)
    );
    if (!serviceSnap.exists()) return [];
    const service = serviceSnap.data();

    const timezone = bp.timezone || DEFAULT_TIMEZONE;
    const ob = bp.onlineBooking || {};
    const duration = Number(service.duration) || 30;
    const stepMinutes = Number(ob.slotIntervalMinutes) || 15;

    const dayStart = DateTime.fromISO(dateStr, { zone: timezone }).startOf("day");
    if (!dayStart.isValid) return [];

    const now = DateTime.now().setZone(timezone);
    const minStart = now.plus({ minutes: Number(ob.minimumAdvanceMinutes) || 0 });
    const maxDate = now.plus({ days: Number.isFinite(ob.maximumAdvanceDays) ? ob.maximumAdvanceDays : 30 }).endOf("day");
    if (dayStart < now.startOf("day") || dayStart > maxDate) return [];

    const blockedDates = Array.isArray(bp.blockedDates) ? bp.blockedDates : [];
    if (blockedDates.includes(dateStr)) return [];

    const weekday = WEEKDAYS[dayStart.weekday % 7]; // luxon: 1=seg..7=dom
    const hours = bp.businessHours?.[weekday];
    if (!hours || hours.enabled === false || !hours.start || !hours.end) return [];

    const [startH, startM] = hours.start.split(":").map(Number);
    const [endH, endM] = hours.end.split(":").map(Number);
    const workStart = dayStart.set({ hour: startH, minute: startM });
    const workEnd = dayStart.set({ hour: endH, minute: endM });

    const breaks = (Array.isArray(hours.breaks) ? hours.breaks : []).map((b) => {
        const [bsH, bsM] = b.start.split(":").map(Number);
        const [beH, beM] = b.end.split(":").map(Number);
        return { start: dayStart.set({ hour: bsH, minute: bsM }), end: dayStart.set({ hour: beH, minute: beM }) };
    });

    // Busca os blocos já ocupados nesse dia inteiro (consulta pública, por
    // ID do documento — não precisa de índice composto nem de ler dados
    // sensíveis de "appointments").
    const dayStartUtcId = workStart.startOf("day").toUTC().toISO();
    const dayEndUtcId = workStart.endOf("day").toUTC().toISO();
    const busySnap = await getDocs(
        query(
            collection(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.BUSY_SLOTS),
            where(documentId(), ">=", dayStartUtcId),
            where(documentId(), "<=", dayEndUtcId)
        )
    );
    const busyIds = new Set(busySnap.docs.map((d) => d.id));

    const slots = [];
    let cursor = workStart;
    while (cursor.plus({ minutes: duration }) <= workEnd) {
        const slotStart = cursor;
        const slotEnd = cursor.plus({ minutes: duration });

        const beforeMinAdvance = slotStart < minStart;
        const overlapsBreak = breaks.some((b) => slotStart < b.end && slotEnd > b.start);

        const blockIds = computeBlockIds(slotStart.toJSDate(), duration, BUSY_SLOT_GRANULARITY_MINUTES);
        const overlapsBusy = blockIds.some((id) => busyIds.has(id));

        if (!beforeMinAdvance && !overlapsBreak && !overlapsBusy) {
            slots.push(slotStart.toUTC().toISO());
        }

        cursor = cursor.plus({ minutes: stepMinutes });
    }

    return slots;
}
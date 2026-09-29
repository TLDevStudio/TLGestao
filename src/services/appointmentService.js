import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { logActivity } from "./activityLogService";
import { createNotification } from "./notificationService";
import { computeBlockIds } from "../utils/slotBlocks";

export const APPOINTMENT_STATUS = {
    scheduled: "Agendado",
    confirmed: "Confirmado",
    in_progress: "Em atendimento",
    completed: "Concluído",
    cancelled: "Cancelado",
    no_show: "Não compareceu",
};

/** Escuta em tempo real os agendamentos do negócio dentro de um intervalo de datas. */
export function subscribeAppointmentsInRange(businessId, start, end, onChange, onError) {
    const q = query(
        collection(db, COLLECTIONS.APPOINTMENTS),
        where("businessId", "==", businessId),
        where("date", ">=", Timestamp.fromDate(start)),
        where("date", "<=", Timestamp.fromDate(end)),
        orderBy("date")
    );

    return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (err) => {
            console.error("[TLGestão] Erro ao escutar agendamentos:", err);
            onError?.(err);
        }
    );
}

/**
 * Grava, no mesmo batch, um documento em businessesPublic/{businessId}/busySlots
 * para cada bloco de horário ocupado pelo agendamento. Isso é o que faz um
 * agendamento MANUAL (criado aqui, pelo empreendedor) bloquear corretamente
 * os horários oferecidos no Portal do Cliente (Fase 5) — e vice-versa.
 *
 * Se a empresa nunca configurou o Portal do Cliente, essa escrita ainda
 * acontece (é barata e não depende de nada estar habilitado) — assim, no
 * dia em que o empreendedor ligar o autoagendamento, os horários antigos já
 * aparecem corretamente ocupados.
 */
function reserveBusySlots(batch, businessId, appointmentId, date, duration) {
    const blockIds = computeBlockIds(date, duration);
    blockIds.forEach((slotId) => {
        batch.set(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.BUSY_SLOTS, slotId), {
            appointmentId,
            createdAt: serverTimestamp(),
        });
    });
    return blockIds;
}

function releaseBusySlots(batch, businessId, blockIds) {
    (blockIds || []).forEach((slotId) => {
        batch.delete(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.BUSY_SLOTS, slotId));
    });
}

export async function createAppointment(businessId, data) {
    const appointmentRef = doc(collection(db, COLLECTIONS.APPOINTMENTS));
    const batch = writeBatch(db);

    const blockIds = reserveBusySlots(batch, businessId, appointmentRef.id, data.date, data.duration);

    batch.set(appointmentRef, {
        businessId,
        clientId: data.clientId,
        clientName: data.clientName,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        date: Timestamp.fromDate(data.date),
        duration: Number(data.duration) || 30,
        professional: data.professional || "",
        notes: data.notes || "",
        status: "scheduled",
        source: "manual",
        busySlotIds: blockIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await batch.commit();

    await logActivity(businessId, {
        action: "appointment_created",
        description: `Agendamento criado para "${data.clientName}" (${data.serviceName})`,
    });

    if (isToday(data.date)) {
        await createNotification(businessId, {
            type: "appointment_today",
            title: "Cliente agendado para hoje",
            message: `${data.clientName} · ${data.serviceName} às ${formatHHMM(data.date)}`,
        });
    }
}

function isToday(date) {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

function formatHHMM(date) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export async function updateAppointment(businessId, appointmentId, data) {
    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const currentSnap = await getDoc(appointmentRef);
    const previousBlockIds = currentSnap.exists() ? currentSnap.data().busySlotIds : [];

    const batch = writeBatch(db);
    releaseBusySlots(batch, businessId, previousBlockIds);
    const newBlockIds = reserveBusySlots(batch, businessId, appointmentId, data.date, data.duration);

    batch.update(appointmentRef, {
        clientId: data.clientId,
        clientName: data.clientName,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        date: Timestamp.fromDate(data.date),
        duration: Number(data.duration) || 30,
        professional: data.professional || "",
        notes: data.notes || "",
        busySlotIds: newBlockIds,
        updatedAt: serverTimestamp(),
    });

    await batch.commit();

    await logActivity(businessId, {
        action: "appointment_updated",
        description: `Agendamento de "${data.clientName}" editado`,
    });
}

export async function updateAppointmentStatus(businessId, appointment, newStatus) {
    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointment.id);
    const batch = writeBatch(db);

    // Só libera os blocos quando o agendamento deixa de "ocupar a agenda"
    // (cancelado ou não compareceu) — status como "concluído" mantém o
    // horário como já ocorrido, não precisa liberar.
    if (newStatus === "cancelled" || newStatus === "no_show") {
        releaseBusySlots(batch, businessId, appointment.busySlotIds);
    }

    batch.update(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
    });

    await batch.commit();

    await logActivity(businessId, {
        action: "appointment_status_changed",
        description: `Agendamento de "${appointment.clientName}" marcado como "${APPOINTMENT_STATUS[newStatus]}"`,
    });

    if (newStatus === "cancelled") {
        await createNotification(businessId, {
            type: "appointment_cancelled",
            title: "Agendamento cancelado",
            message: `${appointment.clientName} · ${appointment.serviceName}`,
        });
    }
}

export async function deleteAppointment(businessId, appointmentId, clientName) {
    assertNotDemoAccount(businessId);

    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const currentSnap = await getDoc(appointmentRef);
    const blockIds = currentSnap.exists() ? currentSnap.data().busySlotIds : [];

    const batch = writeBatch(db);
    releaseBusySlots(batch, businessId, blockIds);
    batch.delete(appointmentRef);
    await batch.commit();

    await logActivity(businessId, {
        action: "appointment_deleted",
        description: `Agendamento de "${clientName}" excluído`,
    });
}
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { assertNotDemoAccount } from "../utils/demoGuard";
import { logActivity } from "./activityLogService";
import { createNotification } from "./notificationService";

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
            console.error("[NexoGestão] Erro ao escutar agendamentos:", err);
            onError?.(err);
        }
    );
}

export async function createAppointment(businessId, data) {
    await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

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
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId), {
        clientId: data.clientId,
        clientName: data.clientName,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        date: Timestamp.fromDate(data.date),
        duration: Number(data.duration) || 30,
        professional: data.professional || "",
        notes: data.notes || "",
        updatedAt: serverTimestamp(),
    });

    await logActivity(businessId, {
        action: "appointment_updated",
        description: `Agendamento de "${data.clientName}" editado`,
    });
}

export async function updateAppointmentStatus(businessId, appointment, newStatus) {
    await updateDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointment.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
    });

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
    await deleteDoc(doc(db, COLLECTIONS.APPOINTMENTS, appointmentId));

    await logActivity(businessId, {
        action: "appointment_deleted",
        description: `Agendamento de "${clientName}" excluído`,
    });
}

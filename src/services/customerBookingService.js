import {
    collection,
    doc,
    getDoc,
    runTransaction,
    serverTimestamp,
    Timestamp,
    writeBatch,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { COLLECTIONS, customerBusinessRelationshipId } from "../firebase/collections";
import { computeBlockIds, BUSY_SLOT_GRANULARITY_MINUTES } from "../utils/slotBlocks";

async function ensureClientLink({ uid, businessId, profile }) {
    const relRef = doc(db, COLLECTIONS.CUSTOMER_BUSINESSES, customerBusinessRelationshipId(uid, businessId));
    const relSnap = await getDoc(relRef);
    if (relSnap.exists()) {
        return relSnap.data().clientId;
    }

    const newClientRef = doc(collection(db, COLLECTIONS.CLIENTS));
    const batch = writeBatch(db);

    batch.set(newClientRef, {
        businessId,
        name: profile.name || "",
        phone: profile.phone || "",
        whatsapp: profile.phone || "",
        email: profile.email || "",
        cpf: "",
        birthDate: "",
        address: "",
        notes: "Cliente criado automaticamente pelo Portal do Cliente (agendamento online).",
        totalSpent: 0,
        visitsCount: 0,
        lastVisitAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    batch.set(relRef, {
        customerUid: uid,
        businessId,
        clientId: newClientRef.id,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await batch.commit();
    return newClientRef.id;
}

export async function createOnlineAppointment({ businessId, serviceId, slotISO }) {
    const user = auth.currentUser;
    if (!user) throw new Error("Você precisa estar logado para agendar.");

    const profileSnap = await getDoc(doc(db, COLLECTIONS.CUSTOMER_PROFILES, user.uid));
    if (!profileSnap.exists()) {
        throw new Error("Complete seu cadastro (nome, e-mail e telefone) antes de agendar.");
    }
    const profile = profileSnap.data();

    const businessPublicSnap = await getDoc(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId));
    if (!businessPublicSnap.exists() || businessPublicSnap.data().onlineBooking?.enabled !== true) {
        throw new Error("Agendamento online indisponível para esta empresa.");
    }

    const serviceSnap = await getDoc(
        doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.PUBLIC_SERVICES, serviceId)
    );
    if (!serviceSnap.exists()) {
        throw new Error("Serviço indisponível para agendamento online.");
    }
    const service = serviceSnap.data();

    const slotStart = new Date(slotISO);
    if (Number.isNaN(slotStart.getTime())) {
        throw new Error("Horário inválido.");
    }

    // 1) Garante o vínculo cliente<->empresa (escrita separada, já confirmada
    // antes de seguir — ver comentário na função acima).
    const clientId = await ensureClientLink({ uid: user.uid, businessId, profile });

    // 2) Cria o agendamento + reserva os blocos de horário, tudo numa única
    // transação: se qualquer bloco já estiver ocupado, a transação inteira
    // falha e nada é gravado.
    const blockIds = computeBlockIds(slotStart, service.duration, BUSY_SLOT_GRANULARITY_MINUTES);
    const appointmentRef = doc(collection(db, COLLECTIONS.APPOINTMENTS));

    try {
        await runTransaction(db, async (tx) => {
            // ── leitura: confere se algum bloco já está ocupado ──────────
            const blockRefs = blockIds.map((id) =>
                doc(db, COLLECTIONS.BUSINESSES_PUBLIC, businessId, COLLECTIONS.BUSY_SLOTS, id)
            );
            const blockSnaps = await Promise.all(blockRefs.map((ref) => tx.get(ref)));
            if (blockSnaps.some((s) => s.exists())) {
                throw new Error("SLOT_TAKEN");
            }

            // ── escrita: reserva os blocos + cria o agendamento ──────────
            blockRefs.forEach((ref) => {
                tx.set(ref, { appointmentId: appointmentRef.id, createdAt: serverTimestamp() });
            });

            tx.set(appointmentRef, {
                businessId,
                clientId,
                customerUid: user.uid,
                clientName: profile.name || "",
                serviceId,
                serviceName: service.name || "",
                date: Timestamp.fromDate(slotStart),
                duration: Number(service.duration) || 30,
                professional: "",
                notes: "",
                status: "scheduled",
                source: "online",
                busySlotIds: blockIds,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });
    } catch (err) {
        if (err.message === "SLOT_TAKEN") {
            throw new Error("Este horário não está mais disponível. Escolha outro.");
        }
        throw err;
    }

    // 3) Log e notificação para o painel do empreendedor — feito depois, à
    // parte, para não arriscar a transação principal por causa de um
    // registro secundário.
    try {
        const batch = writeBatch(db);
        batch.set(doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)), {
            businessId,
            action: "appointment_created",
            description: `Agendamento online criado para "${profile.name || "Cliente"}" (${service.name || ""})`,
            createdAt: serverTimestamp(),
        });
        batch.set(doc(collection(db, COLLECTIONS.NOTIFICATIONS)), {
            businessId,
            type: "appointment_online",
            title: "Novo agendamento online",
            message: `${profile.name || "Cliente"} · ${service.name || ""}`,
            read: false,
            createdAt: serverTimestamp(),
        });
        await batch.commit();
    } catch (err) {
        console.warn("[TLGestão] Agendamento criado, mas log/notificação falhou:", err);
    }

    return { success: true, appointmentId: appointmentRef.id };
}

export async function cancelOnlineAppointment(appointmentId) {
    const user = auth.currentUser;
    if (!user) throw new Error("Você precisa estar logado.");

    const apptRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    const apptSnap = await getDoc(apptRef);
    if (!apptSnap.exists()) throw new Error("Agendamento não encontrado.");
    const appt = apptSnap.data();

    if (appt.customerUid !== user.uid) {
        throw new Error("Você só pode cancelar seus próprios agendamentos.");
    }
    if (appt.status === "cancelled") {
        throw new Error("Este agendamento já está cancelado.");
    }

    const batch = writeBatch(db);
    batch.update(apptRef, { status: "cancelled", updatedAt: serverTimestamp() });
    (appt.busySlotIds || []).forEach((slotId) => {
        batch.delete(doc(db, COLLECTIONS.BUSINESSES_PUBLIC, appt.businessId, COLLECTIONS.BUSY_SLOTS, slotId));
    });
    batch.set(doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)), {
        businessId: appt.businessId,
        action: "appointment_status_changed",
        description: `Agendamento de "${appt.clientName}" cancelado pelo cliente (online)`,
        createdAt: serverTimestamp(),
    });
    batch.set(doc(collection(db, COLLECTIONS.NOTIFICATIONS)), {
        businessId: appt.businessId,
        type: "appointment_cancelled",
        title: "Agendamento cancelado pelo cliente",
        message: `${appt.clientName} · ${appt.serviceName}`,
        read: false,
        createdAt: serverTimestamp(),
    });

    try {
        await batch.commit();
    } catch (err) {

        if (err.code === "permission-denied") {
            throw new Error(
                "Não foi possível cancelar. O prazo pode ter passado ou esta empresa não permite cancelamento online — entre em contato diretamente com ela."
            );
        }
        throw err;
    }

    return { success: true };
}
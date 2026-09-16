import { collection, getDocs, limit, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";

const STEP_LABELS = {
    companyConfigured: "Configure sua empresa",
    servicesCreated: "Cadastre seus serviços",
    clientsCreated: "Cadastre seus primeiros clientes",
    firstUseDone: "Comece a utilizar o sistema",
};

async function collectionHasAnyDoc(collectionName, businessId) {
    const q = query(
        collection(db, collectionName),
        where("businessId", "==", businessId),
        limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
}

/**
 * Calcula o progresso real do onboarding consultando os dados existentes,
 * em vez de confiar apenas em flags que poderiam ficar desatualizadas
 * (ex: se o usuário excluir todos os serviços depois de cadastrar um).
 */
export async function getOnboardingProgress(business, businessId) {
    const [hasServices, hasClients, hasSales, hasAppointments] = await Promise.all([
        collectionHasAnyDoc(COLLECTIONS.SERVICES, businessId),
        collectionHasAnyDoc(COLLECTIONS.CLIENTS, businessId),
        collectionHasAnyDoc(COLLECTIONS.SALES, businessId),
        collectionHasAnyDoc(COLLECTIONS.APPOINTMENTS, businessId),
    ]);

    const stepStates = {
        companyConfigured: !!business?.businessName,
        servicesCreated: hasServices,
        clientsCreated: hasClients,
        firstUseDone: hasSales || hasAppointments,
    };

    const steps = Object.entries(STEP_LABELS).map(([key, label]) => ({
        key,
        label,
        done: stepStates[key],
    }));

    const completedCount = steps.filter((s) => s.done).length;

    return { steps, completedCount, totalCount: steps.length };
}

export async function dismissOnboarding(businessId) {
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, businessId), {
        "onboarding.dismissed": true,
    });
}

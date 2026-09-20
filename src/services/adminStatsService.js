import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { ACCOUNT_STATUS, getAccountStatus } from "../utils/accountStatus";

/**
 * Escuta em tempo real TODAS as contas (businesses) do sistema.
 *
 * Só funciona para quem tem `role: "admin"` — a regra do Firestore
 * (Fase 8) garante isso: `isAdmin()` não depende de qual documento está
 * sendo lido, então a consulta à coleção inteira é permitida para o
 * admin e negada para qualquer outra conta.
 */
export function subscribeAllBusinesses(callback, onError) {
    return onSnapshot(
        collection(db, COLLECTIONS.BUSINESSES),
        (snap) => {
            const businesses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            callback(businesses);
        },
        (err) => {
            console.error("[TLGestão] Erro ao carregar contas administrativas:", err);
            onError?.(err);
        }
    );
}

/**
 * Calcula os indicadores do dashboard administrativo a partir da lista
 * real de contas — nenhum número aqui é fixo/fictício, tudo vem do
 * que está de fato salvo no Firestore no momento da chamada.
 */
export function computeAccountStats(businesses) {
    const stats = {
        total: businesses.length,
        pending: 0,
        active: 0,
        blocked: 0,
        inactive: 0,
        newLast7Days: 0,
    };

    const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;

    businesses.forEach((business) => {
        switch (getAccountStatus(business)) {
            case ACCOUNT_STATUS.PENDING:
                stats.pending += 1;
                break;
            case ACCOUNT_STATUS.ACTIVE:
                stats.active += 1;
                break;
            case ACCOUNT_STATUS.BLOCKED:
                stats.blocked += 1;
                break;
            case ACCOUNT_STATUS.INACTIVE:
                stats.inactive += 1;
                break;
            default:
                break;
        }

        const createdAt = business.createdAt?.toDate ? business.createdAt.toDate() : null;
        if (createdAt && createdAt.getTime() >= sevenDaysAgoMs) {
            stats.newLast7Days += 1;
        }
    });

    return stats;
}
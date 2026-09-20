import {
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { COLLECTIONS } from "../firebase/collections";
import { ACCOUNT_STATUS } from "../utils/accountStatus";

async function logAdminAction({ adminEmail, business, action, description }) {
    await addDoc(collection(db, COLLECTIONS.ADMIN_LOGS), {
        adminEmail: adminEmail || null,
        targetBusinessId: business.id,
        targetName: business.businessName || business.email || business.id,
        action,
        description,
        createdAt: serverTimestamp(),
    });
}

export async function releaseAccount(business, adminEmail) {
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, business.id), {
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        updatedAt: serverTimestamp(),
    });
    await logAdminAction({
        adminEmail,
        business,
        action: "account_released",
        description: `Acesso liberado para "${business.businessName || business.email}"`,
    });
}

export async function blockAccount(business, reason, adminEmail) {
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, business.id), {
        accountStatus: ACCOUNT_STATUS.BLOCKED,
        updatedAt: serverTimestamp(),
    });
    await logAdminAction({
        adminEmail,
        business,
        action: "account_blocked",
        description: reason
            ? `Conta "${business.businessName || business.email}" bloqueada — motivo: ${reason}`
            : `Conta "${business.businessName || business.email}" bloqueada`,
    });
}

export async function deactivateAccount(business, adminEmail) {
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, business.id), {
        accountStatus: ACCOUNT_STATUS.INACTIVE,
        updatedAt: serverTimestamp(),
    });
    await logAdminAction({
        adminEmail,
        business,
        action: "account_deactivated",
        description: `Conta "${business.businessName || business.email}" desativada`,
    });
}

export async function reactivateAccount(business, adminEmail) {
    await updateDoc(doc(db, COLLECTIONS.BUSINESSES, business.id), {
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        updatedAt: serverTimestamp(),
    });
    await logAdminAction({
        adminEmail,
        business,
        action: "account_reactivated",
        description: `Conta "${business.businessName || business.email}" reativada`,
    });
}

// Todas as coleções que guardam dados de um negócio, identificadas
// pelo campo "businessId". Usado só na exclusão de conta, pra apagar
// tudo que pertence a quem está sendo excluído.
const BUSINESS_DATA_COLLECTIONS = [
    COLLECTIONS.CLIENTS,
    COLLECTIONS.SERVICES,
    COLLECTIONS.PRODUCTS,
    COLLECTIONS.APPOINTMENTS,
    COLLECTIONS.SALES,
    COLLECTIONS.SALE_ITEMS,
    COLLECTIONS.TRANSACTIONS,
    COLLECTIONS.NOTIFICATIONS,
    COLLECTIONS.ACTIVITY_LOGS,
];

async function deleteAllDocsInCollection(collectionName, businessId) {
    const q = query(collection(db, collectionName), where("businessId", "==", businessId));
    const snap = await getDocs(q);
    const docs = snap.docs;

    // Firestore permite no máximo 500 operações por lote — 450 por
    // segurança, deixando margem.
    for (let i = 0; i < docs.length; i += 450) {
        const chunk = docs.slice(i, i + 450);
        const batch = writeBatch(db);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
    }
}

/**
 * Exclui todos os dados de uma conta no Firestore (documento da
 * empresa + todas as coleções relacionadas) e registra a ação no log
 * administrativo.
 *
 * ⚠️ LIMITAÇÃO CONHECIDA: isto NÃO remove o usuário do Firebase
 * Authentication. Excluir a conta de autenticação de outra pessoa só é
 * possível com o Admin SDK, rodando em backend (Cloud Functions) —
 * nunca deve ser feito no frontend, pois exigiria expor credenciais
 * administrativas no navegador. Este projeto ainda não usa Cloud
 * Functions (decisão tomada na Fase 8), então esse passo final precisa
 * ser feito manualmente: Firebase Console → Authentication → localizar
 * o usuário pelo UID (retornado por esta função) → excluir.
 */
export async function deleteAccountData(business, adminEmail) {
    for (const collectionName of BUSINESS_DATA_COLLECTIONS) {
        await deleteAllDocsInCollection(collectionName, business.id);
    }

    await deleteDoc(doc(db, COLLECTIONS.BUSINESSES, business.id));

    await logAdminAction({
        adminEmail,
        business,
        action: "account_deleted",
        description: `Conta "${business.businessName || business.email}" excluída (dados do Firestore removidos — exclusão do Authentication ainda pendente, feita manualmente)`,
    });

    return business.id; // UID, para a tela mostrar onde excluir no Authentication
}
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Documento único, fora de qualquer businessId — é uma configuração
// global do sistema, não de uma conta específica.
const ADMIN_ACCESS_DOC = doc(db, "systemConfig", "adminAccess");

/**
 * Escuta em tempo real o interruptor global do painel administrativo.
 * Se o documento ainda não existir (primeira vez que alguém abre o
 * painel), trata como habilitado por padrão — só fica desabilitado
 * depois que um admin desativa explicitamente pela tela.
 */
export function subscribeAdminAccess(callback) {
    return onSnapshot(
        ADMIN_ACCESS_DOC,
        (snap) => {
            if (!snap.exists()) {
                callback({ enabled: true });
                return;
            }
            callback(snap.data());
        },
        () => callback({ enabled: true })
    );
}

/**
 * Liga/desliga o painel administrativo. Só quem tem `role: "admin"`
 * consegue de fato escrever aqui — a regra do Firestore (Fase 8) barra
 * qualquer outra conta, então isso não depende só do frontend.
 */
export async function setAdminAccessEnabled(enabled, adminEmail) {
    await setDoc(
        ADMIN_ACCESS_DOC,
        {
            enabled,
            updatedAt: serverTimestamp(),
            updatedBy: adminEmail || null,
        },
        { merge: true }
    );
}
// Constantes e helpers de status de conta e papel do usuário (controle de acesso do TLGestão).
// Centralizado aqui para não espalhar strings mágicas pelo projeto — mesmo padrão já
// usado em firebase/collections.js para nomes de coleções.

export const ACCOUNT_STATUS = {
    PENDING: "pending",
    ACTIVE: "active",
    BLOCKED: "blocked",
    INACTIVE: "inactive",
};

export const ACCOUNT_STATUS_LABELS = {
    [ACCOUNT_STATUS.PENDING]: "Pendente",
    [ACCOUNT_STATUS.ACTIVE]: "Ativo",
    [ACCOUNT_STATUS.BLOCKED]: "Bloqueado",
    [ACCOUNT_STATUS.INACTIVE]: "Inativo",
};

export const ROLES = {
    USER: "user",
    ADMIN: "admin",
};

/**
 * Retorna o status de um documento de `businesses`.
 *
 * Contas criadas antes deste recurso existir não possuem o campo
 * `accountStatus` no Firestore. Em vez de rodar uma migração escrevendo em
 * todos os documentos existentes (arriscado e desnecessário), tratamos a
 * ausência do campo como "active": quem já usava o sistema continua
 * usando normalmente, sem interrupção.
 */
export function getAccountStatus(business) {
    return business?.accountStatus || ACCOUNT_STATUS.ACTIVE;
}

/** Contas antigas sem o campo `role` são tratadas como usuário comum. */
export function getRole(business) {
    return business?.role || ROLES.USER;
}

export function isAccountActive(business) {
    return getAccountStatus(business) === ACCOUNT_STATUS.ACTIVE;
}

export function isAccountPending(business) {
    return getAccountStatus(business) === ACCOUNT_STATUS.PENDING;
}

export function isAccountBlocked(business) {
    return getAccountStatus(business) === ACCOUNT_STATUS.BLOCKED;
}

export function isAccountInactive(business) {
    return getAccountStatus(business) === ACCOUNT_STATUS.INACTIVE;
}

export function isAdmin(business) {
    return getRole(business) === ROLES.ADMIN;
}
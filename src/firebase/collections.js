export const COLLECTIONS = {
  BUSINESSES: "businesses",
  CLIENTS: "clients",
  SERVICES: "services",
  PRODUCTS: "products",
  APPOINTMENTS: "appointments",
  SALES: "sales",
  SALE_ITEMS: "saleItems",
  TRANSACTIONS: "transactions",
  NOTIFICATIONS: "notifications",
  ACTIVITY_LOGS: "activityLogs",
  ADMIN_LOGS: "adminLogs",

  // ── Portal do Cliente / Autoagendamento (Fase 1 + Fase 2) ─────────────
  CUSTOMER_PROFILES: "customerProfiles", // identidade global do cliente final
  CUSTOMER_BUSINESSES: "customerBusinesses", // vínculo cliente <-> empresa
  BUSINESSES_PUBLIC: "businessesPublic", // espelho público (escrito pelo dono)
  PUBLIC_SERVICES: "publicServices", // subcoleção de businessesPublic/{businessId}
  BUSY_SLOTS: "busySlots", // subcoleção de businessesPublic/{businessId} — trava de horário
  PUBLIC_SLUGS: "publicSlugs", // slug -> businessId
};

/**
 * Monta o ID determinístico do vínculo cliente <-> empresa.
 * Usado tanto no frontend quanto nas Firestore Rules (que fazem o mesmo
 * "split" / concatenação para validar o vínculo com um get() direto).
 */
export function customerBusinessRelationshipId(customerUid, businessId) {
  return `${customerUid}_${businessId}`;
}
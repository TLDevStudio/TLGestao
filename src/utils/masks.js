/** Aplica máscara de telefone brasileiro: (11) 98765-4321 */
export function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Converte um valor digitado (ex: "1250,90") para número em reais. */
export function parseCurrencyInput(value) {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(normalized) || 0;
}

/**
 * Máscara de moeda estilo "caixa eletrônico": o usuário digita só números
 * e o valor vai se formatando como reais (ex: digitar "4500" vira "45,00").
 * Retorna a string formatada (sem "R$") — use junto de parseCurrencyInput
 * para obter o número antes de salvar no Firestore.
 */
export function maskCurrency(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Máscara simples de CPF: 000.000.000-00 */
export function maskCPF(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Máscara simples de CNPJ: 00.000.000/0000-00 */
export function maskCNPJ(value) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/**
 * Configuração central do(s) plano(s) e do contato via WhatsApp.
 *
 * Por enquanto existe um único plano ("Profissional"). Quando o negócio
 * crescer e fizer sentido ter múltiplos planos com limites diferentes
 * (ex: nº de clientes, nº de usuários), basta:
 *   1) adicionar novos itens no array PLANS abaixo;
 *   2) implementar a restrição de uso em algum lugar do backend/regras do
 *      Firestore (isso é trabalho novo, não é só mexer aqui).
 *
 * Trocar preço, nome do plano ou número de WhatsApp: mexa SÓ neste arquivo.
 */

// Número de WhatsApp em formato internacional (só dígitos, sem espaços/traços).
// 55 = Brasil, 21 = DDD, restante = número.
export const WHATSAPP_NUMBER = "5521975930204";

export const PLANS = [
    {
        id: "profissional",
        name: "Plano Mensal",
        price: 49.9,
        priceLabel: "R$ 49,90",
        period: "/mês",
        tagline: "Tudo que seu negócio precisa para sair da planilha.",
        features: [
            "Clientes e histórico ilimitados",
            "Agendamentos com status em tempo real",
            "Controle de estoque com alerta de produto em falta",
            "Financeiro: receitas, despesas e lucro",
            "Relatórios e TL Insights",
            "Suporte direto pelo WhatsApp",
        ],
        highlight: true,
    },
];

/**
 * Monta o link do WhatsApp já com a mensagem preenchida.
 * Ex: buildWhatsAppLink("Profissional") ->
 *   https://wa.me/5521975930204?text=Ol%C3%A1!%20Quero%20assinar...
 */
export function buildWhatsAppLink(planName, customMessage) {
    const message =
        customMessage || `Olá! Quero assinar o plano ${planName} do TLGestão.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Link genérico (sem plano específico) usado, por ex., na tela de conta pendente.
export function buildWhatsAppSupportLink(customMessage) {
    const message =
        customMessage ||
        "Olá! Minha conta no TLGestão está aguardando liberação. Pode me ajudar?";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

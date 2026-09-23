/* Configuração central dos planos e do contato via WhatsApp. */
export const WHATSAPP_NUMBER = "5521975930204";

export const PLANS = [
    {
        id: "mensal",
        name: "Plano Mensal",
        price: 49.9,
        priceLabel: "R$ 49,90",
        period: "/mês",
        setupLabel: "Sem taxa de implantação",
        tagline: "Você configura e começa a usar.",
        features: [
            "Clientes e histórico ilimitados",
            "Agendamentos com status em tempo real",
            "Controle de estoque com alerta de produto em falta",
            "Financeiro: receitas, despesas e lucro",
            "Relatórios e TL Insights",
            "Suporte direto pelo WhatsApp",
            "Você mesmo configura seus dados",
        ],
        buttonLabel: "Quero o Plano Mensal",
        whatsappMessage:
            "Olá! Vi o Plano Mensal do TLGestão e quero contratar o sistema por R$ 49,90/mês.",
        highlight: false,
    },

    {
        id: "pronto",
        name: "Plano Pronto",
        price: 49.9,
        priceLabel: "R$ 49,90",
        period: "/mês",
        setupLabel: "+ R$ 89,90 de implantação única",
        tagline: "Eu configuro o essencial para você começar.",
        features: [
            "Tudo do Plano Mensal",
            "Configuração inicial da empresa",
            "Cadastro de até 50 clientes",
            "Cadastro de até 50 produtos ou serviços",
            "Organização inicial do sistema",
            "Acompanhamento no primeiro mês",
            "Suporte direto pelo WhatsApp",
        ],
        buttonLabel: "Quero meu sistema pronto",
        whatsappMessage:
            "Olá! Vi o Plano Pronto do TLGestão e quero deixar meu sistema configurado. Quero saber como funciona a implantação de R$ 89,90 + R$ 49,90/mês.",
        highlight: true,
        badge: "Comece com tudo pronto",
    },

    {
        id: "implantacao",
        name: "Implantação Completa",
        price: 49.9,
        priceLabel: "R$ 49,90",
        period: "/mês",
        setupLabel: "+ R$ 149,90 de implantação única",
        tagline: "Eu configuro seu sistema e organizo seus dados para você começar.",
        features: [
            "Tudo do Plano Pronto",
            "Cadastro de até 150 clientes",
            "Cadastro de até 150 produtos ou serviços",
            "Configuração inicial de estoque",
            "Configuração financeira inicial",
            "Organização completa dos dados enviados",
            "Acompanhamento personalizado no primeiro mês",
        ],
        buttonLabel: "Quero implantação completa",
        whatsappMessage:
            "Olá! Tenho interesse na Implantação Completa do TLGestão. Vi que inclui a configuração inicial por R$ 149,90 + R$ 49,90/mês.",
        highlight: false,
    },
];

/* Monta o link do WhatsApp com mensagem personalizada por plano. */
export function buildWhatsAppLink(planName, customMessage) {
    const message =
        customMessage ||
        `Olá! Quero contratar o ${planName} do TLGestão.`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* Link genérico de suporte. */
export function buildWhatsAppSupportLink(customMessage) {
    const message =
        customMessage ||
        "Olá! Minha conta no TLGestão está aguardando liberação. Pode me ajudar?";

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
    getFinancialReport,
    getClientsReport,
    getServicesReport,
    getProductsReport,
} from "./reportService";

/**
 * Nexo Insights — análises automáticas do negócio.
 *
 * Arquitetura pensada para evoluir: hoje as regras abaixo são puro JavaScript
 * (comparação de números, ordenação, filtros), sem custo de API e sem
 * dependência externa — exatamente como pedido inicialmente. Se no futuro
 * quiser trocar por uma IA generativa, o ponto de extensão é este arquivo:
 * troque o corpo de generateInsights() por uma chamada a uma API de IA
 * (por exemplo, enviando os mesmos dados agregados de `reportService` como
 * contexto), mantendo o mesmo formato de retorno (array de InsightItem)
 * para não precisar tocar na UI.
 */
export async function generateInsights(businessId) {
    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const previousMonth = subMonths(now, 1);
    const previousStart = startOfMonth(previousMonth);
    const previousEnd = endOfMonth(previousMonth);

    const [financialCurrent, financialPrevious, clients, services, products] = await Promise.all([
        getFinancialReport(businessId, currentStart, currentEnd),
        getFinancialReport(businessId, previousStart, previousEnd),
        getClientsReport(businessId, currentStart, currentEnd),
        getServicesReport(businessId, currentStart, currentEnd),
        getProductsReport(businessId, currentStart, currentEnd),
    ]);

    const insights = [];

    // 1. Crescimento de faturamento em relação ao mês anterior
    if (financialPrevious.income > 0) {
        const growth = ((financialCurrent.income - financialPrevious.income) / financialPrevious.income) * 100;
        if (Math.abs(growth) >= 1) {
            insights.push({
                id: "revenue_growth",
                tone: growth >= 0 ? "success" : "danger",
                icon: growth >= 0 ? "up" : "down",
                text:
                    growth >= 0
                        ? `Seu faturamento aumentou ${growth.toFixed(0)}% neste mês em relação ao mês anterior.`
                        : `Seu faturamento caiu ${Math.abs(growth).toFixed(0)}% neste mês em relação ao mês anterior.`,
            });
        }
    } else if (financialCurrent.income > 0) {
        insights.push({
            id: "first_revenue",
            tone: "success",
            icon: "up",
            text: "Você já registrou as primeiras receitas do negócio neste mês.",
        });
    }

    // 2. Serviço mais vendido do mês
    if (services.length > 0) {
        insights.push({
            id: "top_service",
            tone: "pine",
            icon: "scissors",
            text: `"${services[0].name}" é o seu serviço mais vendido este mês.`,
        });
    }

    // 3. Produto mais vendido do mês
    if (products.topSold.length > 0) {
        insights.push({
            id: "top_product",
            tone: "pine",
            icon: "package",
            text: `"${products.topSold[0].name}" é o produto mais vendido este mês.`,
        });
    }

    // 4. Clientes inativos há mais de 60 dias
    if (clients.inactiveClients.length > 0) {
        insights.push({
            id: "inactive_clients",
            tone: "amber",
            icon: "user_x",
            text: `Você possui ${clients.inactiveClients.length} cliente(s) que não retornam há mais de 60 dias.`,
        });
    }

    // 5. Estoque baixo
    if (products.lowStock.length > 0) {
        const first = products.lowStock[0];
        const extra = products.lowStock.length - 1;
        insights.push({
            id: "low_stock",
            tone: "amber",
            icon: "alert",
            text:
                extra > 0
                    ? `Seu estoque de "${first.name}" e mais ${extra} produto(s) está abaixo do mínimo.`
                    : `Seu estoque de "${first.name}" está abaixo do mínimo.`,
        });
    }

    return insights;
}

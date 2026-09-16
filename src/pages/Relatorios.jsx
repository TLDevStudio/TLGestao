import { useState } from "react";
import {
    Download,
    Printer,
    TrendingUp,
    TrendingDown,
    Wallet,
    Percent,
    UserPlus,
    Repeat,
    UserX,
    Crown,
    Scissors,
    Package,
    AlertTriangle,
    Boxes,
} from "lucide-react";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import { Spinner } from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import { useReports } from "../hooks/useReports";
import { PERIOD_OPTIONS } from "../utils/periodHelpers";
import { toDateInputValue } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatters";
import { exportToCSV } from "../utils/csvExport";

export default function Relatorios() {
    const [period, setPeriod] = useState("month");
    const [customStart, setCustomStart] = useState(toDateInputValue(new Date()));
    const [customEnd, setCustomEnd] = useState(toDateInputValue(new Date()));

    const { data, loading, error } = useReports({ period, customStart, customEnd });

    return (
        <div className="space-y-6">
            {/* Filtros + ações */}
            <div className="flex flex-col gap-3 no-print sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                    <div className="w-full sm:w-44">
                        <label className="mb-1.5 block text-sm font-medium text-ink">Período</label>
                        <Select options={PERIOD_OPTIONS} value={period} onChange={(e) => setPeriod(e.target.value)} />
                    </div>
                    {period === "custom" && (
                        <>
                            <Input
                                type="date"
                                label="De"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                containerClassName="w-full sm:w-40"
                            />
                            <Input
                                type="date"
                                label="Até"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                containerClassName="w-full sm:w-40"
                            />
                        </>
                    )}
                </div>
                <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                    Imprimir
                </Button>
            </div>

            {error && (
                <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {loading || !data ? (
                <div className="flex justify-center py-16">
                    <Spinner size={28} />
                </div>
            ) : (
                <>
                    <FinancialSection financial={data.financial} />
                    <ClientsSection clients={data.clients} />
                    <ServicesSection services={data.services} />
                    <ProductsSection products={data.products} />
                </>
            )}
        </div>
    );
}

function SectionHeader({ title, onExport }) {
    return (
        <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {onExport && (
                <Button variant="outline" size="sm" icon={Download} onClick={onExport} className="no-print">
                    Exportar CSV
                </Button>
            )}
        </div>
    );
}

function FinancialSection({ financial }) {
    return (
        <section>
            <SectionHeader title="Financeiro" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetricCard label="Receita" value={formatCurrency(financial.income)} icon={TrendingUp} tone="text-success" />
                <MetricCard label="Despesa" value={formatCurrency(financial.expense)} icon={TrendingDown} tone="text-danger" />
                <MetricCard
                    label="Lucro"
                    value={formatCurrency(financial.profit)}
                    icon={Wallet}
                    tone={financial.profit >= 0 ? "text-ink" : "text-danger"}
                />
                <MetricCard label="Margem" value={`${financial.margin.toFixed(1)}%`} icon={Percent} tone="text-ink" />
            </div>
        </section>
    );
}

function ClientsSection({ clients }) {
    const handleExport = () =>
        exportToCSV(
            "relatorio-clientes-que-mais-gastaram",
            clients.topSpenders,
            [
                { key: "name", label: "Nome" },
                { key: "totalSpent", label: "Total gasto" },
                { key: "visitsCount", label: "Atendimentos" },
            ]
        );

    return (
        <section>
            <SectionHeader title="Clientes" />
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetricCard label="Novos clientes" value={clients.newClients} icon={UserPlus} tone="text-pine-800" />
                <MetricCard label="Recorrentes" value={clients.recurringCount} icon={Repeat} tone="text-pine-800" />
                <MetricCard label="Inativos (60+ dias)" value={clients.inactiveClients.length} icon={UserX} tone="text-amber-600" />
                <MetricCard label="Total de clientes" value={clients.totalClients} icon={Crown} tone="text-ink" />
            </div>

            {clients.topSpenders.length === 0 ? (
                <EmptyState
                    icon={Crown}
                    title="Nenhum cliente com gastos registrados neste período."
                    description="Assim que houver vendas associadas a clientes, o ranking aparece aqui."
                />
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-end no-print">
                        <Button variant="outline" size="sm" icon={Download} onClick={handleExport}>
                            Exportar CSV
                        </Button>
                    </div>
                    <Table columns={[
                        { key: "name", label: "Cliente" },
                        { key: "spent", label: "Total gasto" },
                        { key: "visits", label: "Atendimentos", className: "text-right" },
                    ]}>
                        {clients.topSpenders.map((c) => (
                            <tr key={c.id}>
                                <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                                <td className="px-4 py-3 text-ink">{formatCurrency(c.totalSpent)}</td>
                                <td className="px-4 py-3 text-right text-ink-soft">{c.visitsCount || 0}</td>
                            </tr>
                        ))}
                    </Table>
                </div>
            )}
        </section>
    );
}

function ServicesSection({ services }) {
    const handleExport = () =>
        exportToCSV("relatorio-servicos", services, [
            { key: "name", label: "Serviço" },
            { key: "quantity", label: "Quantidade vendida" },
            { key: "revenue", label: "Receita" },
        ]);

    return (
        <section>
            <SectionHeader title="Serviços" onExport={services.length > 0 ? handleExport : undefined} />
            {services.length === 0 ? (
                <EmptyState
                    icon={Scissors}
                    title="Nenhum serviço vendido neste período."
                    description="Os serviços mais vendidos aparecerão aqui assim que houver vendas."
                />
            ) : (
                <Table columns={[
                    { key: "name", label: "Serviço" },
                    { key: "quantity", label: "Quantidade" },
                    { key: "revenue", label: "Receita", className: "text-right" },
                ]}>
                    {services.map((s) => (
                        <tr key={s.name}>
                            <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                            <td className="px-4 py-3 text-ink-soft">{s.quantity}</td>
                            <td className="px-4 py-3 text-right text-ink">{formatCurrency(s.revenue)}</td>
                        </tr>
                    ))}
                </Table>
            )}
        </section>
    );
}

function ProductsSection({ products }) {
    const handleExportTop = () =>
        exportToCSV("relatorio-produtos-mais-vendidos", products.topSold, [
            { key: "name", label: "Produto" },
            { key: "quantity", label: "Quantidade vendida" },
            { key: "revenue", label: "Receita" },
        ]);

    return (
        <section>
            <SectionHeader title="Produtos" />
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard
                    label="Valor total em estoque"
                    value={formatCurrency(products.totalStockValue)}
                    icon={Boxes}
                    tone="text-ink"
                />
                <MetricCard label="Produtos cadastrados" value={products.totalProducts} icon={Package} tone="text-ink" />
                <MetricCard
                    label="Com estoque baixo"
                    value={products.lowStock.length}
                    icon={AlertTriangle}
                    tone="text-amber-600"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-ink-soft">Mais vendidos</h3>
                        {products.topSold.length > 0 && (
                            <Button variant="outline" size="sm" icon={Download} onClick={handleExportTop} className="no-print">
                                CSV
                            </Button>
                        )}
                    </div>
                    {products.topSold.length === 0 ? (
                        <EmptyState icon={Package} title="Nenhum produto vendido neste período." />
                    ) : (
                        <div className="space-y-2">
                            {products.topSold.map((p) => (
                                <div key={p.name} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-sm">
                                    <span className="text-ink">{p.name}</span>
                                    <Badge tone="pine">{p.quantity} un · {formatCurrency(p.revenue)}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-medium text-ink-soft">Estoque baixo</h3>
                    {products.lowStock.length === 0 ? (
                        <EmptyState icon={Boxes} title="Nenhum produto com estoque baixo." />
                    ) : (
                        <div className="space-y-2">
                            {products.lowStock.map((p) => (
                                <div key={p.id} className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-100/60 px-3 py-2 text-sm">
                                    <span className="text-ink">{p.name}</span>
                                    <Badge tone="amber">{p.stock} / mín. {p.minStock}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function MetricCard({ label, value, icon: Icon, tone }) {
    return (
        <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between">
                <p className="text-sm text-ink-soft">{label}</p>
                <Icon size={16} className={tone} />
            </div>
            <p className={`mt-2 font-display text-xl font-semibold sm:text-2xl ${tone}`}>{value}</p>
        </div>
    );
}

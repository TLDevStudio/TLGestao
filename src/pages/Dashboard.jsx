import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  CalendarCheck,
  Scissors,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import DashboardCard from "../components/dashboard/DashboardCard";
import ChartCard from "../components/dashboard/ChartCard";
import InsightsCard from "../components/dashboard/InsightsCard";
import OnboardingBanner from "../components/dashboard/OnboardingBanner";
import Badge from "../components/ui/Badge";
import { useDashboardData } from "../hooks/useDashboardData";
import { formatCurrency } from "../utils/formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#E6E3D8" }, ticks: { callback: (v) => formatCurrency(v) } },
  },
};

export default function Dashboard() {
  const { data, loading, error } = useDashboardData();

  const revenueChartData = {
    labels: data?.charts.revenueLast7Days.map((d) => d.label) || [],
    datasets: [
      {
        data: data?.charts.revenueLast7Days.map((d) => d.total) || [],
        backgroundColor: "#244d42",
        borderRadius: 6,
        maxBarThickness: 36,
      },
    ],
  };

  const hasWeekData = data?.charts.revenueLast7Days.some((d) => d.total > 0);
  const hasServicesData = data?.charts.topServices.length > 0;
  const hasProductsData = data?.charts.topProducts.length > 0;

  return (
    <div className="space-y-6">
      <OnboardingBanner />

      {error && (
        <p className="rounded-xl bg-danger-100 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {data?.lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-100 px-4 py-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-sm text-ink">
            <strong>{data.lowStockProducts.length} produto(s)</strong> com estoque abaixo do
            mínimo:{" "}
            {data.lowStockProducts.map((p) => p.name).slice(0, 3).join(", ")}
            {data.lowStockProducts.length > 3 ? "..." : ""}
          </p>
        </div>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard
          label="Faturamento do dia"
          value={formatCurrency(data?.revenueToday)}
          icon={DollarSign}
          loading={loading}
        />
        <DashboardCard
          label="Faturamento do mês"
          value={formatCurrency(data?.revenueMonth)}
          icon={TrendingUp}
          loading={loading}
        />
        <DashboardCard
          label="Despesas do mês"
          value={formatCurrency(data?.expensesMonth)}
          icon={Wallet}
          loading={loading}
        />
        <DashboardCard
          label="Lucro estimado"
          value={formatCurrency(data?.profit)}
          icon={TrendingUp}
          loading={loading}
        />
        <DashboardCard
          label="Clientes"
          value={data?.clientsCount ?? 0}
          icon={Users}
          loading={loading}
        />
        <DashboardCard
          label="Agendamentos hoje"
          value={data?.appointmentsToday ?? 0}
          icon={CalendarCheck}
          loading={loading}
        />
        <DashboardCard
          label="Serviços realizados"
          value={data?.servicesCount ?? 0}
          icon={Scissors}
          loading={loading}
        />
        <DashboardCard
          label="Produtos vendidos"
          value={data?.productsCount ?? 0}
          icon={Package}
          loading={loading}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Faturamento dos últimos 7 dias"
          loading={loading}
          isEmpty={!hasWeekData}
        >
          <Bar data={revenueChartData} options={chartOptions} />
        </ChartCard>

        <ChartCard
          title="Serviços mais vendidos"
          subtitle="Por faturamento no mês"
          loading={loading}
          isEmpty={!hasServicesData}
        >
          <div className="space-y-3">
            {data?.charts.topServices.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span className="text-ink">{s.name}</span>
                <Badge tone="pine">{formatCurrency(s.total)}</Badge>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Produtos mais vendidos"
          subtitle="Por faturamento no mês"
          loading={loading}
          isEmpty={!hasProductsData}
        >
          <div className="space-y-3">
            {data?.charts.topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-ink">{p.name}</span>
                <Badge tone="amber">{formatCurrency(p.total)}</Badge>
              </div>
            ))}
          </div>
        </ChartCard>

        <InsightsCard />
      </div>
    </div>
  );
}

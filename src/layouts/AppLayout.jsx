import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

const TITLES = {
  "/app/dashboard": "Dashboard",
  "/app/clientes": "Clientes",
  "/app/agendamentos": "Agendamentos",
  "/app/servicos": "Serviços",
  "/app/produtos": "Produtos",
  "/app/vendas": "Vendas",
  "/app/financeiro": "Financeiro",
  "/app/relatorios": "Relatórios",
  "/app/historico": "Histórico",
  "/app/configuracoes": "Configurações",
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/").slice(1, 3).join("/");
  const title = TITLES[location.pathname] || TITLES[basePath] || "NexoGestão";

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

const ADMIN_TITLES = {
    "/admin/dashboard": "Dashboard administrativo",
    "/admin/contas": "Contas",
    "/admin/logs": "Logs administrativos",
    "/admin/seguranca": "Segurança",
};

/**
 * Layout do painel administrativo — separado do AppLayout do cliente.
 * Não compartilha Sidebar/Header com a área do cliente de propósito:
 * são ambientes diferentes e não devem se misturar visualmente nem
 * estruturalmente (ver Fase 7, seção 13 do documento original).
 */
export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const title = ADMIN_TITLES[location.pathname] || "Painel administrativo";

    return (
        <div className="flex min-h-screen bg-paper">
            <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex min-h-screen flex-1 flex-col">
                <AdminHeader title={title} onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
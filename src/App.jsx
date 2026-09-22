import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import RouteTracker from "./components/RouteTracker";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import ClienteDetalhes from "./pages/ClienteDetalhes";
import Servicos from "./pages/Servicos";
import Produtos from "./pages/Produtos";
import Agendamentos from "./pages/Agendamentos";
import Vendas from "./pages/Vendas";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Historico from "./pages/Historico";
import Configuracoes from "./pages/Configuracoes";
import AccountStatusGuard from "./routes/AccountStatusGuard";

import AdminGuard from "./routes/AdminGuard";
import AdminLayout from "./layouts/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSecurity from "./pages/admin/AdminSecurity";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <RouteTracker />
              <Routes>
                {/* Pública */}
                <Route path="/" element={<Landing />} />

                {/* Autenticação */}
                <Route element={<AuthLayout />}>
                  <Route path="/entrar" element={<Login />} />
                  <Route path="/criar-conta" element={<Register />} />
                  <Route path="/recuperar-senha" element={<ForgotPassword />} />
                </Route>

                {/* Área logada */}
                <Route
                  path="/app"
                  element={
                    <PrivateRoute>
                      <AccountStatusGuard>
                        <AppLayout />
                      </AccountStatusGuard>
                    </PrivateRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="clientes/:id" element={<ClienteDetalhes />} />
                  <Route path="agendamentos" element={<Agendamentos />} />
                  <Route path="servicos" element={<Servicos />} />
                  <Route path="produtos" element={<Produtos />} />
                  <Route path="vendas" element={<Vendas />} />
                  <Route path="financeiro" element={<Financeiro />} />
                  <Route path="relatorios" element={<Relatorios />} />
                  <Route path="historico" element={<Historico />} />
                  <Route path="configuracoes" element={<Configuracoes />} />
                </Route>

                {/* Painel administrativo — separado da área do cliente */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="contas" element={<AdminAccounts />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="seguranca" element={<AdminSecurity />} />
                </Route>

                {/* Qualquer rota não mapeada cai aqui, em vez de tela em branco */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./routes/PrivateRoute";
import CustomerAuthGuard from "./routes/CustomerAuthGuard";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerAuthLayout from "./layouts/CustomerAuthLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import RouteTracker from "./components/RouteTracker";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";

import Landing from "./pages/Landing";
import Termos from "./pages/legal/Termos";
import Privacidade from "./pages/legal/Privacidade";
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

// ── Portal do Cliente (Fase 4) ────────────────────────────────────────────
import CustomerPortal from "./pages/customer/CustomerPortal";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerForgotPassword from "./pages/customer/CustomerForgotPassword";
import CustomerAppointments from "./pages/customer/CustomerAppointments";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerBusinessRedirect from "./pages/customer/CustomerBusinessRedirect";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <CustomerAuthProvider>
            <ThemeProvider>
              <ToastProvider>
                <RouteTracker />
                <ScrollToTop />
                <CookieConsent />
                <Routes>
                  {/* Pública */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/termos" element={<Termos />} />
                  <Route path="/privacidade" element={<Privacidade />} />

                  {/* Autenticação (empreendedor) */}
                  <Route element={<AuthLayout />}>
                    <Route path="/entrar" element={<Login />} />
                    <Route path="/criar-conta" element={<Register />} />
                    <Route path="/recuperar-senha" element={<ForgotPassword />} />
                  </Route>

                  {/* Área logada (empreendedor) */}
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

                  {/* ── Portal do Cliente (Fase 4) ──────────────────────── */}

                  {/* Link público da empresa — sem login, qualquer visitante acessa */}
                  <Route path="/agendar/:slug" element={<CustomerLayout />}>
                    <Route index element={<CustomerPortal />} />
                  </Route>

                  {/* Autenticação (cliente final) — layout visual próprio */}
                  <Route element={<CustomerAuthLayout />}>
                    <Route path="/cliente/entrar" element={<CustomerLogin />} />
                    <Route path="/cliente/criar-conta" element={<CustomerRegister />} />
                    <Route path="/cliente/esqueci-senha" element={<CustomerForgotPassword />} />
                  </Route>

                  {/* Área logada (cliente final) */}
                  <Route
                    path="/cliente"
                    element={
                      <CustomerAuthGuard>
                        <CustomerLayout />
                      </CustomerAuthGuard>
                    }
                  >
                    <Route index element={<Navigate to="meus-agendamentos" replace />} />
                    <Route path="meus-agendamentos" element={<CustomerAppointments />} />
                    <Route path="perfil" element={<CustomerProfile />} />
                    {/* Citadas no documento original — redirecionam para o link público /agendar/:slug */}
                    <Route path="empresa/:businessId" element={<CustomerBusinessRedirect />} />
                    <Route path="agendar/:businessId" element={<CustomerBusinessRedirect />} />
                  </Route>

                  {/* Qualquer rota não mapeada cai aqui, em vez de tela em branco */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ToastProvider>
            </ThemeProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "./routes/PrivateRoute";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
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
                    <AppLayout />
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
            </Routes>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

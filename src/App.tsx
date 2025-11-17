// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { RequireAuth, PublicOnly } from "@/features/auth/guards";
import EmpresaDetailsPage from "@/pages/EmpresaDetailsPage";
import HomePage from "@/pages/HomePage";
import CreatePage from "@/pages/create/CreatePage";
import DetailsPage from "@/pages/details/DetailsPage";
import LoginPage from "@/pages/auth/LoginPage";
import EmpresasPage from "@/pages/EmpresasPage";
import NovaEmpresaPage from "@/pages/NovaEmpresaPage";
import SettingsHome from "@/pages/config/SettingsHome";
import SmtpPage from "@/pages/config/smtp/SmtpPage";
import PerfilPage from "@/pages/config/perfil/PerfilPage";
import SessionTimer from "@/components/SessionTimer"; // ← Mantido
import FlowList from "@/pages/flow/FlowList";
import FlowEditor from "@/pages/flow/FlowEditor";
import FlowSettings from "@/pages/flow/FlowSettings";
import AdvancedConfigPage from "@/pages/details/AdvancedConfigPage";
import UsersAdminPage from "@/pages/config/users/UsersAdminPage"; // 👈 NOVO


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />

        {/* ===== HOME COM TIMER ===== */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="relative">
                <HomePage />
                <SessionTimer /> {/* ← Agora só aparece na Home */}
              </div>
            </RequireAuth>
          }
        />
        {/* ========================= */}

        <Route
          path="/novo"
          element={
            <RequireAuth>
              <CreatePage />
            </RequireAuth>
          }
        />

        <Route
          path="/app/:ref"
          element={
            <RequireAuth>
              <DetailsPage />
            </RequireAuth>
          }
        />

        <Route
          path="/apps/:id/advanced-config"
          element={
            <RequireAuth>
              <AdvancedConfigPage  />
            </RequireAuth>
          }
        />


        

        <Route
          path="/empresas"
          element={
            <RequireAuth>
              <EmpresasPage />
            </RequireAuth>
          }
        />

        <Route
          path="/empresas/nova"
          element={
            <RequireAuth>
              <NovaEmpresaPage />
            </RequireAuth>
          }
        />

        <Route
          path="/empresas/:id"
          element={
            <RequireAuth>
              <EmpresaDetailsPage />
            </RequireAuth>
          }
        />

        {/* ========== FLOWS ========== */}
        <Route
          path="/flows"
          element={
            <RequireAuth>
              <FlowList />
            </RequireAuth>
          }
        />
        <Route
          path="/flow/new"
          element={
            <RequireAuth>
              <FlowEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/flow/:id"
          element={
            <RequireAuth>
              <FlowEditor />
            </RequireAuth>
          }
        />
        <Route
          path="/flow/:id/settings"
          element={
            <RequireAuth>
              <FlowSettings />
            </RequireAuth>
          }
        />
        <Route
          path="/app/:appId/workflow/:id"
          element={
            <RequireAuth>
              <FlowEditor />
            </RequireAuth>
          }
        />

        {/* Config */}
        <Route
          path="/config"
          element={
            <RequireAuth>
              <SettingsHome />
            </RequireAuth>
          }
        />
        <Route
          path="/config/smtp"
          element={
            <RequireAuth>
              <SmtpPage />
            </RequireAuth>
          }
        />
        <Route
          path="/config/perfil"
          element={
            <RequireAuth>
              <PerfilPage />
            </RequireAuth>
          }
        />
        <Route
          path="/config/seguranca"
          element={
            <RequireAuth>
              <div className="p-6 text-white">Em breve: Segurança</div>
            </RequireAuth>
          }
        />
        <Route
          path="/config/api-keys"
          element={
            <RequireAuth>
              <div className="p-6 text-white">Em breve: API Keys</div>
            </RequireAuth>
          }
        />
                {/* 👇 NOVO: página de usuários (conteúdo já faz check de superuser) */}
        <Route
          path="/config/users"
          element={
            <RequireAuth>
              <UsersAdminPage />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ← REMOVA O SessionTimer daqui! */}
    </AuthProvider>
  );
}
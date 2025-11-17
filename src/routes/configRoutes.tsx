// src/routes/configRoutes.tsx
import { Navigate } from "react-router-dom";
import SettingsHome from "@/pages/config/SettingsHome";
import SmtpPage from "@/pages/config/smtp/SmtpPage";
import PerfilPage from "@/pages/config/perfil/PerfilPage";
import UsersAdminPage from "@/pages/config/users/UsersAdminPage"; // 👈 NOVO

export const configRoutes = [
  { path: "/config", element: <SettingsHome /> },
  { path: "/config/smtp", element: <SmtpPage /> },
  { path: "/config/perfil", element: <PerfilPage /> },

  // 👇 NOVO: página de gestão/criação de usuários (só superadmin vai ver/usar)
  { path: "/config/users", element: <UsersAdminPage /> },

  // placeholders pra não quebrar
  { path: "/config/seguranca", element: <div className="p-6 text-white">Em breve: Segurança</div> },
  { path: "/config/api-keys", element: <div className="p-6 text-white">Em breve: API Keys</div> },

  { path: "/", element: <Navigate to="/config" replace /> }, // opcional
];

// src/routes/configRoutes.tsx
import { Navigate } from "react-router-dom";
import SettingsHome from "@/pages/config/SettingsHome";
import SmtpPage from "@/pages/config/smtp/SmtpPage";
import PerfilPage from "@/pages/config/perfil/PerfilPage";

export const configRoutes = [
  { path: "/config", element: <SettingsHome /> },
  { path: "/config/smtp", element: <SmtpPage /> },
  { path: "/config/perfil", element: <PerfilPage /> },

  // placeholders pra não quebrar
  { path: "/config/seguranca", element: <div className="p-6 text-white">Em breve: Segurança</div> },
  { path: "/config/api-keys", element: <div className="p-6 text-white">Em breve: API Keys</div> },

  { path: "/", element: <Navigate to="/config" replace /> }, // opcional
];

// src/pages/auth/EmpresaLoginPage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/http";

import { TextField } from "./components/TextField";
import { PasswordField } from "./components/PasswordField";
import LOGO from "@/assets/LOGO.png";
import LOGO_ANIM from "@/assets/LOGO_ANIMADA_1920x1080.gif";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function EmpresaLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // splash animada

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError(null);

    const nextErrors: FieldErrors = {};
    if (!email) nextErrors.email = "Informe o e-mail da empresa.";
    if (!password) nextErrors.password = "Informe a senha.";
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);

      const res = await api.post("/empresas/login", { email, password });
      const { token, empresa } = res.data;

      // guarda token / info da empresa
      localStorage.setItem("empresaToken", token);
      localStorage.setItem("empresaInfo", JSON.stringify(empresa));

      // splash + redirecionamento
      setRedirecting(true);
      setTimeout(() => {
        // ajusta a rota conforme seu portal de empresa
        navigate(`/empresa-portal/${empresa.id}`, { replace: true });
      }, 2200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Erro ao fazer login da empresa.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 grid place-items-center p-4">
      {/* Splash de carregamento ao entrar no portal da empresa */}
      {redirecting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white animate-fadeIn">
          <div className="flex flex-col items-center">
            <img
              src={LOGO_ANIM}
              alt="Carregando portal da empresa"
              className="w-[360px] max-w-[90vw] h-auto mb-6 object-contain"
            />
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="animate-spin w-5 h-5" />
              <span className="font-medium text-lg">
                Entrando no portal da empresa...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <header className="mb-6 text-center">
          <img
            src={LOGO}
            alt="Logo"
            className="mx-auto mb-4 h-12 w-auto object-contain"
          />
          <h1 className="text-2xl font-semibold text-blue-800">
            Login da Empresa
          </h1>
          <p className="text-sm text-slate-500">
            Acesse o portal da sua empresa na AppSystem
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="E-mail da empresa"
            placeholder="empresa@dominio.com.br"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={errors.email}
            autoFocus
            autoComplete="email"
            inputMode="email"
          />

          <PasswordField
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          {apiError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Autenticando..." : "Entrar na empresa"}
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} — Portal da Empresa • AppSystem
        </footer>
      </div>
    </div>
  );
}

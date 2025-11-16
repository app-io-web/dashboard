import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthProvider";
import { TextField } from "./components/TextField";
import { PasswordField } from "./components/PasswordField";
import LOGO from "@/assets/LOGO.png"; // logo principal (azul)
import LOGO_ANIM from "@/assets/LOGO_ANIMADA_1920x1080.gif"; // opcional, se quiser usar a gif
import { Loader2 } from "lucide-react"; // ícone animado (girando)

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [q] = useSearchParams();
  const from = useMemo(() => q.get("from") || "/", [q]);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [redirecting, setRedirecting] = useState(false); // splash

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErr: typeof errors = {};
    if (!email) nextErr.email = "Informe o e-mail.";
    if (!password) nextErr.password = "Informe a senha.";
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;

    await login({ email, password, remember });

    // ativa splash e segura o redirecionamento
    setRedirecting(true);
    setTimeout(() => nav(from, { replace: true }), 2500); // 2.5s pra animação aparecer bem
  }, [email, password, remember, login, nav, from]);

  return (
    <div className="min-h-screen bg-white text-slate-900 grid place-items-center p-4">
      {/* Splash branco com logo e texto "Carregando..." */}
      {redirecting && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-white animate-fadeIn">
            <div className="flex flex-col items-center">
              <img
                src={LOGO_ANIM}
                alt="Carregando"
                className="w-[360px] max-w-[90vw] h-auto mb-6 object-contain"
              />
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="animate-spin w-5 h-5" />
                <span className="font-medium text-lg">Carregando...</span>
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
          <h1 className="text-2xl font-semibold text-blue-800">Entrar</h1>
          <p className="text-sm text-slate-500">Acesse o dashboard dos apps</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            label="E-mail"
            placeholder="voce@empresa.com"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={remember}
                onChange={(e) => setRemember(e.currentTarget.checked)}
              />
              Lembrar de mim
            </label>

            <Link to="/recuperar-senha" className="text-sm text-blue-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <footer className="mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} — Dashboard de Progressão
        </footer>
      </div>
    </div>
  );
}

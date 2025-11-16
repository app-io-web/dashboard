import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "@/lib/http";
import { pushToast } from "@/lib/toast";
import { clearAuth, getUser, saveAuth, type AuthUser } from "@/lib/auth";

type LoginInput = { email: string; password: string; remember?: boolean };
type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async ({ email, password, remember }: LoginInput) => {
    setLoading(true);
    try {
      // backend: POST /auth/login { email, password }
      const { data } = await api.post("/auth/login", { email, password });
      // espera: { accessToken, user }
      saveAuth(data, !!remember);
      setUser(data.user);
      pushToast("Login realizado.", "success");
    } catch (e: any) {
      pushToast(e?.message || "Falha ao entrar.", "error");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    pushToast("Sessão encerrada.", "info");
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

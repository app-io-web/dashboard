// src/components/SessionTimer.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { decodeJwt } from "@/features/auth/jwt";
import { api } from "@/lib/http";
import { clearAuth, getAccessToken } from "@/lib/auth";

function msToClock(ms: number) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function SessionTimer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [now, setNow] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(() => getAccessToken?.() ?? localStorage.getItem("accessToken"));
  const [refreshing, setRefreshing] = useState(false);
  const triedAutoRefresh = useRef(false);

  // Atualiza token quando a rota muda
  useEffect(() => {
    const current = getAccessToken?.() ?? localStorage.getItem("accessToken");
    setToken(current);
  }, [location.pathname]);

  // Atualiza token quando outra aba mudar
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "accessToken") setToken(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Tick de 1s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Decodifica exp/iat
  const { exp, iat } = useMemo(() => {
    const dec = decodeJwt(token);
    return { exp: dec?.exp, iat: dec?.iat };
  }, [token]);

  const remainingMs = useMemo(() => (exp ? exp * 1000 - now : 0), [exp, now]);
  const totalMs = useMemo(() => (exp && iat ? (exp - iat) * 1000 : 60 * 60 * 1000), [exp, iat]);
  const pct = useMemo(() => {
    if (!totalMs) return 0;
    return Math.max(0, Math.min(1, remainingMs / totalMs));
  }, [remainingMs, totalMs]);

  // Auto-refresh < 30s
  useEffect(() => {
    if (!exp) return;
    if (remainingMs <= 30_000 && remainingMs > 0 && !triedAutoRefresh.current && !refreshing) {
      triedAutoRefresh.current = true;
      handleRefresh();
    }
  }, [remainingMs, exp]); // eslint-disable-line

  // Expirou? tenta refresh; se falhar, logout
  useEffect(() => {
    if (!exp) return;
    if (remainingMs <= 0) {
      if (triedAutoRefresh.current) {
        handleLogout();
      } else {
        triedAutoRefresh.current = true;
        handleRefresh().catch(handleLogout);
      }
    }
  }, [remainingMs, exp]); // eslint-disable-line

  async function handleRefresh() {
    try {
      setRefreshing(true);
      const { data } = await api.post("/auth/refresh", {});
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setToken(data.accessToken);
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleLogout() {
    clearAuth?.();
    try { localStorage.removeItem("accessToken"); } catch {}
    navigate("/login");
  }

  if (!token || !exp) return null;

  // SVG progress circle
  const size = 44;             // px do ícone
  const stroke = 4;            // espessura
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct); // 1 -> 0

  return (
    <div className="fixed right-4 bottom-4 z-50 group">
      {/* Botão/ícone minimalista */}
      <div
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-md cursor-default"
        aria-label="Tempo de sessão"
      >
        <svg
          width={size}
          height={size}
          className="absolute inset-0"
          role="presentation"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* trilha */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgb(226 232 240)" // slate-200
            strokeWidth={stroke}
            fill="none"
          />
          {/* progresso */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgb(59 130 246)" // blue-500
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-500 ease-linear"
          />
        </svg>

        {/* Relógiozinho animado */}
        <Clock
          size={18}
          className="text-slate-700 animate-[spin_60s_linear_infinite]" // ponteiro vibe: 1 volta/min
        />
      </div>

      {/* Tooltip on hover */}
      <div
        className="pointer-events-none absolute bottom-14 right-0 w-56 translate-y-2 opacity-0 transition
                   group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">Sessão</span>
            <span className="text-xs font-medium text-slate-700">
              {refreshing ? "Renovando..." : msToClock(remainingMs)}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 active:bg-blue-200 disabled:opacity-50"
            >
              Renovar
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 active:bg-red-200"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

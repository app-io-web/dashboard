// src/pages/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppCard from "@/components/AppCard";
import MetricsBar, { type Metrics } from "@/components/MetricsBar";
import { Plus, RefreshCw, LogOut, PanelLeft } from "lucide-react";
import { api } from "@/lib/http";
import { clearAuth } from "@/lib/auth";
import SideMenu from "@/components/SideMenu";
import OnboardingModal from "@/components/onboarding/OnboardingModal"; // 👈 NOVO

/** Filtros visíveis no UI */
type StatusFiltro = "Todos" | "Desenvolvimento" | "Corrigindo Erros" | "Projeto Finalizado";
type SortKey = "recente" | "valor_desc" | "valor_asc" | "nome_asc";

/** Modelo flexível pra bater com o back sem quebrar */
export type AppItem = {
  id: number | string;
  titulo?: string | null;
  nome?: string | null;
  descricao?: string | null;
  email?: string | null;
  preco?: number | null;
  valor?: number | null;
  price?: number | null;
  status?: string | null;
  criadoEm?: string | null;

  // 👇 campos comuns de soft delete (qualquer API maluca que vier)
  deletedAt?: string | Date | null;
  isDeleted?: boolean | number | null;
  deleted?: boolean | number | null;
  disabled?: boolean | number | null;
  ativo?: boolean | number | null; // se for false/0 => deletado/arquivado
  archivedAt?: string | Date | null;
};

const CREATE_ROUTE = "/novo";

function normalizeList(payload: unknown): AppItem[] {
  const arr =
    Array.isArray(payload)
      ? payload
      : (payload as any)?.items ??
        (payload as any)?.data ?? [];
  return Array.isArray(arr) ? (arr as AppItem[]) : [];
}

// pega preço de qualquer campo comum
const getPrice = (a: AppItem) =>
  Number(a.preco ?? a.valor ?? a.price ?? 0) || 0;

// normaliza status pra comparações robustas
const normStatus = (s?: string | null) =>
  (s ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .trim();

/** ---------- Soft delete helpers robustos ---------- */

// trata 0/1, "0"/"1", true/false
const boolish = (v: unknown) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return ["1", "true", "yes", "sim"].includes(v.toLowerCase());
  return false;
};

// data válida?
const hasDate = (v: unknown) => {
  if (!v) return false;
  const t = typeof v === "string" || v instanceof Date ? new Date(v as any).getTime() : NaN;
  return Number.isFinite(t);
};

// status arquivado/deletado?
const isDeletedStatus = (s?: string | null) => {
  const n = normStatus(s);
  return n === "deleted" || n === "deletado" || n === "arquivado" || n === "archived" || n === "removido";
};

const isSoftDeleted = (a: AppItem | Record<string, any>) => {
  // sinais fortes
  if (hasDate((a as any).deletedAt)) return true;
  if (hasDate((a as any).archivedAt)) return true;

  // flags clássicas
  if (boolish((a as any).isDeleted)) return true;
  if (boolish((a as any).deleted)) return true;
  if (boolish((a as any).disabled)) return true;

  // ativo=false também conta como “não mostrar”
  if ((a as any).ativo !== undefined) {
    const ativo = boolish((a as any).ativo);
    if (!ativo) return true;
  }

  // status textual do além
  if (isDeletedStatus((a as any).status)) return true;

  return false;
};

/** -------------------------------------------------- */

export default function HomePage() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFiltro>("Todos");
  const [sort, setSort] = useState<SortKey>("recente");
  const [menuOpen, setMenuOpen] = useState(false);

  // 👇 NOVO: estado do onboarding
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [smtpOk, setSmtpOk] = useState(false);
  const [hasEmpresa, setHasEmpresa] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  async function fetchApps() {
    try {
      setLoading(true);
      setErr(null);
      const { data } = await api.get("/apps");
      const list = normalizeList(data).filter((a) => !isSoftDeleted(a));
      setApps(list);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? "Falha ao carregar apps");
    } finally {
      setLoading(false);
    }
  }

  // 👇 NOVO: checar SMTP + empresas na entrada
  // 👇 NOVO: checar SMTP + empresas na entrada
  async function checkInitialSetup() {
    try {
      setCheckingSetup(true);

      const [smtpRes, empRes] = await Promise.all([
        api.get("/smtp"),      // 👈 ERA /smtp/status
        api.get("/empresas"),
      ]);

      const smtpData = smtpRes.data;
      const empresasData = empRes.data;

      // GET /smtp do back retorna: { configured: boolean, username, fromName, fromEmail, verifiedAt, lastTestAt }
      const smtpConfigured = !!smtpData?.configured;

      const empresasArray =
        Array.isArray(empresasData)
          ? empresasData
          : empresasData?.items ??
            empresasData?.data ??
            [];

      const hasEmpresaReal = Array.isArray(empresasArray) && empresasArray.length > 0;

      setSmtpOk(smtpConfigured);
      setHasEmpresa(hasEmpresaReal);

      // se faltar qualquer coisa, abre o onboarding
      if (!smtpConfigured || !hasEmpresaReal) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Erro ao verificar setup inicial:", error);
      // em caso de erro não travamos o usuário, só não abrimos o onboarding
    } finally {
      setCheckingSetup(false);
    }
  }


  useEffect(() => {
    fetchApps();
    checkInitialSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  // métricas (robustas a variações de status/valor)
  const metrics: Metrics = useMemo(() => {
    const totalApps = apps.length;

    const emDesenvolvimento = apps.filter((a) => {
      const s = normStatus(a.status);
      return s.includes("desenvolv") || s === "em desenvolvimento";
    }).length;

    const finalizados = apps.filter((a) => {
      const s = normStatus(a.status);
      return s.includes("finaliz") || s.includes("public") || s.includes("produc");
    }).length;

    const totalValor = apps.reduce((acc, a) => acc + getPrice(a), 0);

    return { totalApps, emDesenvolvimento, finalizados, totalValor };
  }, [apps]);

  // filtro + busca + ordenação
  const filtered = useMemo(() => {
    const byStatus =
      status === "Todos"
        ? apps
        : apps.filter((a) => {
            const s = normStatus(a.status);
            if (status === "Desenvolvimento") return s.includes("desenvolv");
            if (status === "Corrigindo Erros") return s.includes("erro") || s.includes("bug");
            if (status === "Projeto Finalizado") return s.includes("finaliz");
            return true;
          });

    const q = query.trim().toLowerCase();
    const bySearch = q
      ? byStatus.filter((a) => {
          const titulo = a.titulo ?? a.nome ?? "";
          const alvo = `${titulo} ${a.email ?? ""} ${a.descricao ?? ""}`.toLowerCase();
          return alvo.includes(q);
        })
      : byStatus;

    const sorted = [...bySearch].sort((a, b) => {
      const va = getPrice(a);
      const vb = getPrice(b);
      const na = (a.titulo ?? a.nome ?? "").toString();
      const nb = (b.titulo ?? b.nome ?? "").toString();
      const ta = a.criadoEm ? +new Date(a.criadoEm) : Number(a.id) || 0;
      const tb = b.criadoEm ? +new Date(b.criadoEm) : Number(b.id) || 0;

      switch (sort) {
        case "valor_desc": return vb - va;
        case "valor_asc":  return va - vb;
        case "nome_asc":   return na.localeCompare(nb);
        case "recente":
        default:           return tb - ta;
      }
    });

    return sorted;
  }, [apps, query, status, sort]);

  return (
    <>
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-xl border border-gray-200 bg-white/90 backdrop-blur px-3 py-2 shadow hover:bg-white"
        title="Abrir menu"
      >
        <span className="sr-only">Abrir menu</span>
        <PanelLeft size={18} />
      </button>

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mt-4 mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 transition"
              title="Sair da conta"
            >
              <LogOut size={16} /> Sair
            </button>

            <button
              type="button"
              onClick={fetchApps}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              title="Recarregar"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-60"
              onClick={() => navigate(CREATE_ROUTE)}
              disabled={loading}
            >
              <Plus size={18} /> Novo App
            </button>
          </div>
        </div>

        <MetricsBar {...metrics} />

        {err && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-[repeat(auto-fill,minmax(360px,1fr))] justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            Nenhum app encontrado.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-[repeat(auto-fill,minmax(360px,1fr))] justify-center">
            {filtered.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>

      {/* 👇 MODAL DE ONBOARDING - só aparece se faltar algo */}
      {showOnboarding && !checkingSetup && (
        <OnboardingModal
          smtpOk={smtpOk}
          hasEmpresa={hasEmpresa}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}

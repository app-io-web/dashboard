// src/pages/empresa/EmpresaDetailsPage.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getEmpresa } from "@/features/empresas/api";
import { RefreshCw, Building2, ChevronRight, Plus } from "lucide-react";

type AppStatus =
  | "Desenvolvimento"
  | "Corrigindo Erros"
  | "Projeto Finalizado"
  | "Em_testes"
  | string;

// ---------- helpers de soft delete (iguais aos da Home) ----------
const normStatus = (s?: string | null) =>
  (s ?? "")
    .toLowerCase()
    .replace(/_/g, " ")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .trim();

const boolish = (v: unknown) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return ["1", "true", "yes", "sim"].includes(v.toLowerCase());
  return false;
};

const hasDate = (v: unknown) => {
  if (!v) return false;
  const t = typeof v === "string" || v instanceof Date ? new Date(v as any).getTime() : NaN;
  return Number.isFinite(t);
};

const isDeletedStatus = (s?: string | null) => {
  const n = normStatus(s);
  return n === "deleted" || n === "deletado" || n === "arquivado" || n === "archived" || n === "removido";
};

const isSoftDeleted = (a: any) => {
  if (hasDate(a?.deletedAt)) return true;
  if (hasDate(a?.archivedAt)) return true;
  if (boolish(a?.isDeleted)) return true;
  if (boolish(a?.deleted)) return true;
  if (boolish(a?.disabled)) return true;
  if (a?.ativo !== undefined && !boolish(a?.ativo)) return true;
  if (isDeletedStatus(a?.status)) return true;
  return false;
};
// ---------------------------------------------------------------

export default function EmpresaDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<any>(null);

  const fetchEmpresa = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setErr(null);
      const data = await getEmpresa(id, signal);
      setEmpresa(data);
    } catch (e: any) {
      const canceled =
        axios.isCancel?.(e) ||
        e?.code === "ERR_CANCELED" ||
        e?.name === "CanceledError" ||
        signal?.aborted;
      if (!canceled) setErr(e?.response?.data?.error ?? e?.message ?? "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const ac = new AbortController();
    fetchEmpresa(ac.signal);
    return () => ac.abort();
  }, [fetchEmpresa]);

  // apps visíveis (sem deletados/arquivados/etc.)
  const apps = useMemo(() => (empresa?.apps ?? []).filter((a: any) => !isSoftDeleted(a)), [empresa]);

  function statusPill(raw: string) {
    const label = raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const base =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors duration-150";
    const map: Record<string, string> = {
      "Em Testes": "bg-indigo-50 text-indigo-700 border-indigo-200",
      Desenvolvimento: "bg-blue-50 text-blue-700 border-blue-200",
      "Corrigindo Erros": "bg-amber-50 text-amber-700 border-amber-200",
      "Projeto Finalizado": "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return (
      <span className={`${base} ${map[label] ?? "bg-slate-50 text-slate-700 border-slate-200"}`}>
        {label}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 bg-slate-200 rounded" />
          <div className="h-5 w-1/4 bg-slate-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-1/3 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{err}</div>
        <button
          onClick={() => fetchEmpresa()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-blue-600 text-white hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!empresa) return <div className="p-6">Empresa não encontrada.</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="px-5 py-5 sm:px-6 sm:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid place-items-center w-12 h-12 rounded-xl bg-blue-50 border border-blue-100">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{empresa.nome}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                {/* usa o count filtrado/local se o back não fornecer o certo */}
                <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5">
                  {(empresa.appsCountFiltered ?? apps.length)} app(s)
                </span>
                {empresa.cnpj && (
                  <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-0.5">
                    CNPJ: {empresa.cnpj}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/empresas"
              className="rounded-xl px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
            >
              Voltar
            </Link>
            <button
              onClick={() => fetchEmpresa()}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>
            <button
              onClick={() => navigate(`/create?empresaId=${empresa.id}`)}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Novo app
            </button>
          </div>
        </div>
      </div>

      {/* LISTA DE APPS */}
      <div className="mt-6">
        {apps.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {apps.map((app: any) => (
              <Link
                key={app.id}
                to={`/app/${app.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all hover:-translate-y-[1px]"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {app.imageSquareUrl ? (
                      <img
                        src={app.imageSquareUrl}
                        alt={app.nome}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 grid place-items-center rounded-lg bg-slate-50 border border-slate-200">
                        {/* ícone placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 7.5h18m-12 9h6m-9 3h12M5.25 4.5h13.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H5.25A1.5 1.5 0 013.75 18V6a1.5 1.5 0 011.5-1.5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold text-slate-900">{app.nome}</div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-500" />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-slate-500">#{app.codigo}</span>
                      {statusPill(app.status as AppStatus)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl grid place-items-center bg-blue-50 border border-blue-100 mb-3">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-slate-900 font-semibold">Sem apps ainda</p>
            <p className="text-slate-600 mt-1">Crie seu primeiro app para esta empresa.</p>
            <button
              onClick={() => navigate(`/create?empresaId=${empresa.id}`)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Criar app
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

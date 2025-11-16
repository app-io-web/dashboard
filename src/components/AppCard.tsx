// src/components/AppCard.tsx
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { AppItem } from "@/pages/HomePage";
import { api } from "@/lib/http";
import fallbackLogo from "@/assets/LOGO.jpg";

const brl = (v: unknown) => {
  const n =
    typeof v === "number"
      ? v
      : typeof v === "string"
      ? Number(v.replace(/[^\d,-]/g, "").replace(",", "."))
      : 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
};

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const base = "rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none shadow-sm border";
  switch (status) {
    case "Desenvolvimento":
      return <span className={`${base} bg-blue-50 text-blue-700 border-blue-100`}>Em estruturação</span>;
    case "Corrigindo Erros":
      return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-100`}>Corrigindo</span>;
    case "Projeto Finalizado":
      return <span className={`${base} bg-green-50 text-green-700 border-green-100`}>Publicado</span>;
    default:
      return <span className={`${base} bg-gray-50 text-gray-700 border-gray-100`}>{status}</span>;
  }
}

/** cache bobo em memória pro nome da empresa */
const empresaNameCache = new Map<string, string>();

function useEmpresaName(empresaId?: string | null) {
  const [nome, setNome] = useState<string | null | undefined>(undefined); // undefined = carregando

  useEffect(() => {
    if (!empresaId) {
      setNome(null);
      return;
    }
    if (empresaNameCache.has(empresaId)) {
      setNome(empresaNameCache.get(empresaId)!);
      return;
    }

    let alive = true;
    (async () => {
      try {
        // espera-se GET /empresas/:id -> { id, nome }
        const { data } = await api.get(`/empresas/${encodeURIComponent(empresaId)}`);
        const n = data?.nome ?? data?.name ?? null;
        if (!alive) return;
        if (n) {
          empresaNameCache.set(empresaId, n);
          setNome(n);
        } else {
          setNome(null);
        }
      } catch {
        setNome(null);
      }
    })();

    return () => {
      alive = false;
    };
  }, [empresaId]);

  return nome;
}

export default function AppCard({ app }: { app: AppItem }) {
  const titulo = (app.titulo ?? app.nome ?? "Aplicativo").toString();
  const email = app.email ?? "";
  const desc = app.descricao ?? "";
  const precoFmt = brl((app as any).preco ?? (app as any).valor ?? 0);
  const ref = encodeURIComponent(String(app.id));
  const logoUrl = (app as any).imageSquareUrl ?? (app as any).logoUrl ?? fallbackLogo;

  // pega empresa
  const empresaId: string | undefined =
    (app as any).empresaId ?? (app as any).empresa?.id ?? undefined;
  const empresaNome = useEmpresaName(empresaId);

  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md w-[420px] max-w-full">
      {/* badge pequena no topo-direito */}
      <div className="absolute right-4 top-4">
        <StatusBadge status={(app as any).status} />
      </div>

      <div className="flex items-start gap-5">
        {/* texto */}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-[18px] font-extrabold tracking-wide text-gray-900 leading-6">
            {titulo.toUpperCase()}
          </h3>

          {email && (
            <div className="mb-2 flex items-center gap-1.5 text-sm text-gray-700">
              <Mail size={14} /> <span className="truncate">{email}</span>
            </div>
          )}

          {desc && (
            <p className="mb-3 text-[13px] leading-5 text-gray-700 line-clamp-3">
              {desc}
            </p>
          )}

          {/* empresa: mostra quando tiver nome; se undefined, está carregando (skeleton sutil) */}
          {empresaNome === undefined ? (
            <span className="inline-flex h-[24px] w-28 animate-pulse rounded-md bg-gray-100" />
          ) : empresaNome ? (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              {empresaNome}
            </span>
          ) : null}
        </div>

        {/* logo menor */}
        <div className="shrink-0">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-xl border border-gray-200 bg-white">
            <img
              src={logoUrl || fallbackLogo}
              onError={(e) => ((e.currentTarget.src = fallbackLogo))}
              alt={titulo}
              className="h-16 w-16 object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* rodapé */}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-[15px] font-bold text-gray-900">{precoFmt}</span>
        <Link
          to={`/app/${ref}`}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Ver detalhes
          <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

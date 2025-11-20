// src/features/empresa-home/EmpresaAppCard.tsx
import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

type AppItem = {
  id: string;
  nome: string;
  status?: string | null;
  descricao?: string | null;
  iconUrl?: string | null;
};

type Props = {
  app: AppItem;
  empresaId: string;
};

export default function EmpresaAppCard({ app, empresaId }: Props) {
  const status = (app.status || "").toLowerCase();

  const statusColor =
    status.includes("erro") || status.includes("bug")
      ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
      : status.includes("teste") || status.includes("test")
      ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
      : status.includes("prod") ||
        status.includes("ativo") ||
        status.includes("online")
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : "bg-slate-700/30 text-slate-300 border-slate-600/60";

  return (
    <Link
      to={`/apps/${app.id}?empresaId=${empresaId}`}
      className="group block rounded-2xl border border-slate-800 bg-slate-950/70 p-3 shadow-md shadow-slate-950/50 transition hover:border-emerald-500/60 hover:bg-slate-900/80"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-slate-700/70">
          {app.iconUrl ? (
            <img
              src={app.iconUrl}
              alt={app.nome}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-100">
              {app.nome?.[0]?.toUpperCase() || "A"}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate text-sm font-semibold text-slate-50">
              {app.nome}
            </h4>
            {status && (
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColor}`}
              >
                <BadgeCheck size={11} />
                {app.status}
              </span>
            )}
          </div>
          <p className="line-clamp-2 text-[11px] text-slate-400">
            {app.descricao || "Sem descrição cadastrada para este app."}
          </p>
        </div>
      </div>
    </Link>
  );
}

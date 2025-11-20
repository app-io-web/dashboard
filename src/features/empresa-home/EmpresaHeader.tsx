// src/features/empresa-home/EmpresaHeader.tsx
import { ArrowLeft, Building2 } from "lucide-react";

type Empresa = {
  id: string;
  nome: string;
  slug?: string | null;
  logoUrl?: string | null;
  descricao?: string | null;
};

type Props = {
  empresa: Empresa;
  onBack: () => void;
};

export default function EmpresaHeader({ empresa, onBack }: Props) {
  const initials =
    empresa.nome
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "EM";

  return (
    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-950 to-slate-950 px-4 py-4 shadow-lg shadow-slate-950/50 md:flex-row md:items-center lg:px-6 lg:py-5">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 hidden rounded-full border border-slate-700/70 bg-slate-900/70 p-1.5 text-slate-300 hover:bg-slate-800 md:inline-flex"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-slate-700/80">
          {empresa.logoUrl ? (
            // se tiver logo
            <img
              src={empresa.logoUrl}
              alt={empresa.nome}
              className="h-full w-full rounded-2xl object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-100">
              {initials}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-50 md:text-xl">
              {empresa.nome}
            </h2>
            {empresa.slug && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                {empresa.slug}
              </span>
            )}
          </div>
          <p className="max-w-2xl text-xs text-slate-400 md:text-sm">
            {empresa.descricao ||
              "Resumo da empresa, área de atuação, produtos e serviços."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-300">
          <Building2 size={16} className="text-slate-400" />
          <span>ID: {empresa.id}</span>
        </div>
      </div>
    </section>
  );
}

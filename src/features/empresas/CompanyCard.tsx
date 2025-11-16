// src/features/empresas/CompanyCard.tsx
import { Building2, ChevronRight, Globe2 } from "lucide-react";
import type { Empresa } from "./types";
import { Link } from "react-router-dom";

type Props = { empresa: Empresa; to?: string };

const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

export default function CompanyCard({ empresa, to = `/empresas/${empresa.id}` }: Props) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:border-sky-300 transition-colors shadow-sm"
    >
      <div className="p-5 flex items-start gap-4">
        {/* ícone azul claro/escuro */}
        <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-sky-50 border border-sky-200">
          <Building2 className="w-6 h-6 text-sky-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-900 text-lg">{empresa.nome}</h3>
            <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
          </div>

          <div className="mt-1 text-sm text-slate-600">
            Criada em <span className="text-slate-700">{fmtDate(empresa.criadoEm)}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
            {empresa.dominio && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                <Globe2 className="w-3.5 h-3.5" />
                {empresa.dominio}
              </span>
            )}
            {typeof empresa.appsCount === "number" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                {empresa.appsCount} app{empresa.appsCount === 1 ? "" : "s"}
              </span>
            )}
            {typeof empresa.valorTotal === "number" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                {empresa.valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

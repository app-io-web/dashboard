import CompanyCard from "@/features/empresas/CompanyCard";
import CompanySkeleton from "@/features/empresas/CompanySkeleton";
import type { Empresa } from "./types";
import { Link } from "react-router-dom";

export default function EmpresaList({
  loading, err, filtered,
}: {
  loading: boolean;
  err: string | null;
  filtered: Empresa[];
}) {
  if (err) {
    return <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">{err}</div>;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (<CompanySkeleton key={i} />))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-slate-900 font-medium">Nada por aqui ainda</p>
        <p className="text-slate-600 mt-1">Crie sua primeira empresa para começar.</p>
        <Link
          to="/empresas/nova"
          className="inline-flex items-center gap-2 mt-4 rounded-xl px-4 py-2.5 bg-sky-500 text-white font-semibold hover:bg-sky-600 transition"
        >
          Nova empresa
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filtered.map((e) => (<CompanyCard key={e.id} empresa={e} />))}
    </div>
  );
}

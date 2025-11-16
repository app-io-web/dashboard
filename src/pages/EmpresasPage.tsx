import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, PanelLeft, LogOut } from "lucide-react";
import { listEmpresas } from "@/features/empresas/api";
import type { Empresa } from "@/features/empresas/types";
import EmpresaFilters from "@/features/empresas/EmpresaFilters";
import EmpresaList from "@/features/empresas/EmpresaList";
import { Link, useNavigate } from "react-router-dom";
import SideMenu from "@/components/SideMenu";
import { clearAuth } from "@/lib/auth";

type SortKey = "nome_asc" | "nome_desc" | "recente" | "antigas";

export default function EmpresasPage() {
  const navigate = useNavigate();

  // --- SideMenu controlado
  const [menuOpen, setMenuOpen] = useState(false);
  function handleLogout() {
    clearAuth();
    navigate("/login");
  }
  // ---

  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("recente");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setErr(null);
    listEmpresas(ac.signal)
      .then(setEmpresas)
      .catch((e: any) => {
        if (e?.code === "ERR_CANCELED" || e?.name === "CanceledError" || e?.name === "AbortError") return;
        setErr(e?.message ?? "Falha ao carregar empresas");
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = empresas.filter((e) => (term ? e.nome.toLowerCase().includes(term) : true));
    list = list.sort((a, b) => {
      if (sort === "nome_asc") return a.nome.localeCompare(b.nome, "pt-BR");
      if (sort === "nome_desc") return b.nome.localeCompare(a.nome, "pt-BR");
      const da = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const db = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      if (sort === "recente") return db - da;
      return da - db;
    });
    return list;
  }, [empresas, q, sort]);

  return (
    <>
      {/* Drawer do menu lateral */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Botão de abrir menu */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm hover:bg-slate-50"
              title="Abrir menu"
            >
              <span className="sr-only">Abrir menu</span>
              <PanelLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
              <p className="text-slate-600 text-sm">Empresas associadas à sua conta</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/empresas/nova"
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow"
            >
              <Plus className="w-4 h-4" />
              Nova empresa
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition"
              title="Recarregar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Logout (opcional aqui também) */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2.5 text-red-700 hover:bg-red-100 transition"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <EmpresaFilters q={q} setQ={setQ} sort={sort} setSort={setSort} />

        {/* Lista */}
        <EmpresaList loading={loading} err={err} filtered={filtered} />
      </div>
    </>
  );
}

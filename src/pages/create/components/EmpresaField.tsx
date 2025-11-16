// src/pages/create/components/EmpresaField.tsx
import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { api } from "@/lib/http";

export type Empresa = { id: string; nome: string };

export function EmpresaField({
  value,
  onChange,
  label = "Empresa",
  hint = "Selecione a empresa dona do app, ou cadastre uma nova.",
}: {
  value: string | null;              // empresaId selecionado
  onChange: (empresaId: string | null) => void;
  label?: string;
  hint?: string;
}) {
  const [list, setList] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const ordered = useMemo(
    () => [...list].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [list]
  );

  async function fetchEmpresas() {
    setLoading(true);
    try {
      const res = await api.get("/empresas"); // << rota simples de listagem
      setList(res.data as Empresa[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // carrega uma vez
    fetchEmpresas();
  }, []);

  async function handleCreate() {
    const nome = novoNome.trim();
    if (!nome) return;
    setCreating(true);
    try {
      const res = await api.post("/empresas", { nome });
      const nova = res.data as Empresa;
      setList((s) => [nova, ...s]);
      onChange(nova.id);             // seleciona automaticamente a recém-criada
      setNovoNome("");
    } catch (e: any) {
      alert(e?.response?.data?.error || "Erro ao criar empresa.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div className="mt-1 flex gap-2">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
          disabled={loading}
        >
          <option value="">{loading ? "Carregando..." : "— Selecione uma empresa —"}</option>
          {ordered.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nome}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={fetchEmpresas}
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm hover:shadow transition"
          title="Atualizar lista"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <p className="mt-1 text-xs text-slate-500">{hint}</p>

      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Cadastrar nova empresa (nome)"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400"
        />
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 font-medium text-white shadow-sm hover:bg-emerald-500 transition disabled:opacity-60"
          disabled={creating || !novoNome.trim()}
          title="Criar empresa"
        >
          <Plus size={18} />
          Criar
        </button>
      </div>
    </div>
  );
}

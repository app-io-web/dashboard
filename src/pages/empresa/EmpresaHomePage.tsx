// src/pages/empresa/EmpresaHomePage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/http";
import EmpresaHomeLayout from "@/features/empresa-home/EmpresaHomeLayout";
import EmpresaHeader from "@/features/empresa-home/EmpresaHeader";
import EmpresaAppsGrid from "@/features/empresa-home/EmpresaAppsGrid";

type Empresa = {
  id: string;
  nome: string;
  slug?: string | null;
  logoUrl?: string | null;
  descricao?: string | null;
};

type AppItem = {
  id: string;
  nome: string;
  status?: string | null;
  descricao?: string | null;
  iconUrl?: string | null;
};

export default function EmpresaHomePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [empresaRes, appsRes] = await Promise.all([
          api.get(`/empresas/${id}`),
          api.get("/apps", { params: { empresaId: id } }),
        ]);

        setEmpresa(empresaRes.data);
        // ajuste conforme o shape da sua API (items / data / etc)
        setApps(appsRes.data.items ?? appsRes.data ?? []);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.message ||
            "Não foi possível carregar os dados da empresa."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function handleBack() {
    navigate("/empresas");
  }

  function handleNewApp() {
    // ajuste a rota de criação de app conforme seu projeto
    navigate(`/apps/novo?empresaId=${id}`);
  }

  return (
    <EmpresaHomeLayout>
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          Carregando empresa...
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Voltar para lista de empresas
          </button>
        </div>
      ) : !empresa ? (
        <div className="flex flex-1 items-center justify-center text-slate-400">
          Empresa não encontrada.
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 px-4 pb-6 pt-4 lg:px-8 lg:pt-6">
          <EmpresaHeader empresa={empresa} onBack={handleBack} />

          <EmpresaAppsGrid
            empresa={empresa}
            apps={apps}
            onNewApp={handleNewApp}
          />

          {/* Exemplo de rodapé / links extras */}
          <div className="mt-4 text-xs text-slate-500">
            <span>Gerenciando apps de </span>
            <span className="font-medium text-slate-300">{empresa.nome}</span>
            <span> • </span>
            <Link
              to={`/empresa/${empresa.id}/config`}
              className="text-cyan-400 hover:underline"
            >
              Configurações da empresa
            </Link>
          </div>
        </div>
      )}
    </EmpresaHomeLayout>
  );
}

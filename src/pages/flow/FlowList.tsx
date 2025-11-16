import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeft } from "lucide-react";

import SideMenu from "@/components/SideMenu";
import { clearAuth } from "@/lib/auth";

import { useFlows } from "../flow/hooks/useFlows";
import EmpresaSelector from "@/components/flow/EmpresaSelector";
import FlowGrid from "@/components/flow/FlowGrid";
import CreateFlowModal from "@/components/flow/CreateFlowModal/CreateFlowModal";
import FlowListHeader from "@/components/flow/FlowListHeader";

export default function FlowList() {
  const {
    empresas,
    selectedEmpresa,
    selectEmpresa,
    flows,
    flowApps, // Record<flowId, AppItem | null>
    loadingEmpresas,
    loadingFlows,
    loadingAppMap,
    setSelectedEmpresa,
  } = useFlows();

  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <>
      {/* Drawer lateral padrão do projeto */}
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(to) => navigate(to)}
        onLogout={handleLogout}
      />

      {/* Botão flutuante de menu (igual HomePage) */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-xl border border-gray-200 bg-white/90 backdrop-blur px-3 py-2 shadow hover:bg-white"
        title="Abrir menu"
      >
        <span className="sr-only">Abrir menu</span>
        <PanelLeft size={18} />
      </button>

      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {loadingEmpresas ? (
            <div className="mt-24 grid place-items-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-4 border-blue-600" />
                <p className="mt-4 text-gray-600">Carregando suas empresas…</p>
              </div>
            </div>
          ) : !selectedEmpresa ? (
            <>
              <div className="mt-4 mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Fluxos</h1>
                <p className="text-sm text-gray-500">
                  Selecione uma empresa para visualizar e criar fluxos.
                </p>
              </div>

              <EmpresaSelector empresas={empresas} onSelect={selectEmpresa} />
            </>
          ) : (
            <>
              <FlowListHeader
                empresa={selectedEmpresa}
                onBack={() => setSelectedEmpresa(null)}
                onCreate={() => setModalOpen(true)}
              />

              {loadingFlows ? (
                <div className="grid place-items-center py-24">
                  <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600" />
                </div>
              ) : flows.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 px-6 text-center text-gray-500">
                  Nenhum fluxo ainda. Clique em{" "}
                  <span className="font-medium">“Novo Fluxo”</span> para começar.
                </div>
              ) : (
                <FlowGrid
                  flows={flows}
                  flowApps={flowApps}
                  loadingAppMap={loadingAppMap}
                  empresaId={selectedEmpresa.id}
                />
              )}
            </>
          )}
        </div>
        
        {selectedEmpresa && (
          <CreateFlowModal
            open={modalOpen}
            empresa={selectedEmpresa}
            onClose={() => setModalOpen(false)}
          />
        )}
      </main>
    </>
  );
}


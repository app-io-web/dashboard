// pages/flow/FlowEditor.tsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import type { Node as RFNode } from "reactflow";
import { PanelLeft, PanelRight } from "lucide-react";

import FlowCanvas from "./components/FlowCanvas";
import Sidebar from "./components/Sidebar";
import NodePanel from "./components/NodePanel";
import Toolbar from "./components/Toolbar";
import useFlowEditor from "./hooks/useFlowEditor";

export default function FlowEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const empresaId = searchParams.get("empresaId") || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!empresaId && id !== "new") {
      navigate("/flows");
    }
  }, [empresaId, id, navigate]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <ReactFlowProvider>
        <FlowEditorInner idParam={id ?? null} empresaId={empresaId} />
      </ReactFlowProvider>
    </div>
  );
}

function FlowEditorInner({
  idParam,
  empresaId,
}: {
  idParam: string | null;
  empresaId: string;
}) {
  const navigate = useNavigate();

  const {
    flow,
    app,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    saveFlow,
    isSaving,
    isLoading,
    onDrop,
    onDragOver,
    addNode,
  } = useFlowEditor(
    idParam === "new" ? null : idParam,
    empresaId,
    () => navigate(`/flows?empresaId=${empresaId}`)
  );

  // app atual detectado pelo Toolbar
  const [currentApp, setCurrentApp] = useState<any>(app ?? null);

  // responsivo
  const [isMobile, setIsMobile] = useState(false);
  const [openBlocks, setOpenBlocks] = useState(false);
  const [openInspector, setOpenInspector] = useState(false);

  useEffect(() => {
    setCurrentApp(app ?? null);
  }, [app]);

  useEffect(() => {
    const check = () => {
      // menor que lg (1024px) vira "mobile/tablet em pé"
      setIsMobile(window.innerWidth < 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg">Carregando editor...</div>
      </div>
    );
  }

  if (!flow && idParam !== "new") {
    return <div className="p-8 text-red-600">Fluxo não encontrado.</div>;
  }

  const flowId = flow?.id;

  const handleSave = () => {
    saveFlow();
  };

  const handleBack = () => {
    navigate(`/flows?empresaId=${empresaId}`);
  };

  const handleNodeUpdate = (updated: RFNode | null) => {
    setSelectedNode(updated);

    if (!updated) return;

    // em mobile, se atualizou/selecionou, garante painel aberto
    if (isMobile) {
      setOpenInspector(true);
    }

    onNodesChange([
      {
        id: updated.id,
        type: "replace",
        item: updated,
      } as any,
    ]);
  };

  return (
    <>
      <Toolbar
        title={flow?.titulo ?? "Novo fluxo"}
        onSave={handleSave}
        isSaving={isSaving}
        onBack={handleBack}
        flowId={flowId}
        empresaId={empresaId}
        onAppDetected={(appDetectado) => setCurrentApp(appDetectado)}
      />

      {/* DESKTOP / TABLET LARGO – layout antigo */}
      {!isMobile && (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onAddNode={addNode} />

          <div className="flex-1 relative">
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              onDrop={onDrop}
              onDragOver={onDragOver}
            />
          </div>

          <NodePanel
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            appId={currentApp?.id ?? null}
          />
        </div>
      )}

      {/* MOBILE / TABLET EM PÉ – canvas full + drawers */}
      {isMobile && (
        <div className="relative flex-1 overflow-hidden">
          <FlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => {
              setSelectedNode(node);
              setOpenInspector(true);
            }}
            onPaneClick={() => setSelectedNode(null)}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />

          {/* botões flutuantes */}
          <div className="absolute top-3 left-3 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => setOpenBlocks(true)}
              className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-medium shadow-md border border-gray-200"
            >
              <PanelLeft className="w-4 h-4" />
              Blocos
            </button>

            <button
              type="button"
              disabled={!selectedNode}
              onClick={() => selectedNode && setOpenInspector(true)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-md border ${
                selectedNode
                  ? "bg-white/95 border-gray-200"
                  : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
            >
              <PanelRight className="w-4 h-4" />
              Editar nó
            </button>
          </div>

          {/* Drawer: BLOCOs (Sidebar) */}
          {openBlocks && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpenBlocks(false)}
              />
              <div className="absolute inset-y-0 left-0 w-[320px] max-w-[80%] bg-white shadow-2xl border-r border-gray-200 flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    Blocos
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenBlocks(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Fechar
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar onAddNode={addNode} />
                </div>
              </div>
            </div>
          )}

          {/* Drawer: INSPECTOR (NodePanel) */}
          {openInspector && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setOpenInspector(false)}
              />
              <div className="absolute inset-y-0 right-0 w-[360px] max-w-[90%] bg-white shadow-2xl border-l border-gray-200 flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    Edição do nó
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenInspector(false)}
                    className="text-xs text-gray-500 hover:text-gray-800"
                  >
                    Fechar
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <NodePanel
                    node={selectedNode}
                    onUpdate={handleNodeUpdate}
                    appId={currentApp?.id ?? null}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

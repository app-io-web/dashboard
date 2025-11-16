// pages/flow/FlowEditor.tsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import type { Node as RFNode } from "reactflow";

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

  // se o hook mudar o app (ex: recarregou), sincroniza
  useEffect(() => {
    setCurrentApp(app ?? null);
  }, [app]);

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

  // id do fluxo atual (pode ser undefined em "novo")
  const flowId = flow?.id;

  const handleSave = () => {
    // se tiver alguma lógica extra de validação, coloca aqui
    saveFlow();
  };

  const handleBack = () => {
    navigate(`/flows?empresaId=${empresaId}`);
  };

  const handleNodeUpdate = (updated: RFNode | null) => {
    // Atualiza o painel
    setSelectedNode(updated);

    // E atualiza o array de nodes do React Flow
    if (!updated) return;

    onNodesChange([
      {
        id: updated.id,
        type: "replace",
        item: updated,
      } as any, // NodeChange "replace"
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
        // Toolbar faz a mágica: consulta /apps, descobre qual app está
        // vinculado a ESTE fluxo e devolve aqui
        onAppDetected={(appDetectado) => setCurrentApp(appDetectado)}
      />

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
    </>
  );
}

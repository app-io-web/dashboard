// pages/flow/FlowEditor.tsx
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ReactFlowProvider,
  type Node as RFNode,
  type Connection,
  type Edge as RFEdge,
} from "reactflow";

import { PanelLeft, PanelRight, Trash2, Link2, Unlink2 } from "lucide-react";

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

  // 🔗 Modo conectar (mobile)
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

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

    // ❌ não abre mais o inspector automaticamente no mobile
    onNodesChange([
      {
        id: updated.id,
        type: "replace",
        item: updated,
      } as any,
    ]);
  };

  // 🔴 Deletar nó selecionado
  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;

    onNodesChange([
      {
        id: nodeId,
        type: "remove",
      } as any,
    ]);

    setSelectedNode(null);
    setOpenInspector(false);

    // garante que não fique preso em modo conexão com nó que já sumiu
    if (connectSourceId === nodeId) {
      setConnectSourceId(null);
      setConnectMode(false);
    }
  };

  // 🔌 Desconectar todas as conexões do nó selecionado (mobile)
  const handleDisconnectSelectedNode = () => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;

    // filtra as edges que tocam nesse nó
    const connectedEdges = edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );

    if (connectedEdges.length === 0) return;

    // cria mudanças de remoção para cada edge
    const changes = connectedEdges.map(
      (edge) =>
        ({
          id: edge.id,
          type: "remove",
        } as any)
    );

    onEdgesChange(changes);
  };

  // se dá pra desconectar (tem nó selecionado E alguma edge ligada nele)
  const canDisconnect =
    !!selectedNode &&
    edges.some(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );

  // 🔍 Helper: achar nó pelo id
  const findNodeById = (id: string | null | undefined): RFNode | undefined => {
    if (!id) return undefined;
    return nodes.find((n) => n.id === id);
  };

  type EdgeKind = "data" | "decision-yes" | "decision-no";

  // 🧠 Descobre se essa conexão devia ser "data" ou "decision-(yes/no)"
  const inferEdgeKind = (
    source?: RFNode,
    _target?: RFNode,
    existingEdges?: RFEdge[]
  ): EdgeKind => {
    if (!source) return "data";

    const edgesList = existingEdges ?? (edges as RFEdge[]);
    const sourceType = (source.type ?? "").toLowerCase();

    // Convenção: qualquer nó que tenha "decision", "cond" ou "if" no type é nó de decisão
    const isDecisionSource =
      sourceType.includes("decision") ||
      sourceType.includes("cond") ||
      sourceType.includes("if");

    if (!isDecisionSource) return "data";

    const outgoing = edgesList.filter((e) => e.source === source.id);
    const hasYes = outgoing.some((e) => (e.data as any)?.kind === "decision-yes");
    const hasNo = outgoing.some((e) => (e.data as any)?.kind === "decision-no");

    // 1ª saída do nó de decisão → SIM
    if (!hasYes) return "decision-yes";
    // 2ª saída → NÃO
    if (!hasNo) return "decision-no";

    // Já tem SIM e NÃO: o resto vira "data" mesmo (ou você pode bloquear)
    return "data";
  };

  // 🚫 Regra: evita enfiar várias entradas de dado num nó que deveria ter uma só
  const canConnectDataToTarget = (target?: RFNode, existingEdges?: RFEdge[]): boolean => {
    if (!target) return true;

    const edgesList = existingEdges ?? (edges as RFEdge[]);
    const targetType = (target.type ?? "").toLowerCase();

    // Nó que explicitamente aceita múltiplas entradas (merge, join, router etc)
    const allowsMultipleInputs =
      targetType.includes("merge") ||
      targetType.includes("join") ||
      targetType.includes("router");

    if (allowsMultipleInputs) return true;

    const incomingData = edgesList.filter(
      (e) =>
        e.target === target.id &&
        (((e.data as any)?.kind as EdgeKind | undefined) ?? "data") === "data"
    );

    // Se já tem uma entrada de dado, bloqueia novas
    return incomingData.length === 0;
  };

  // 💡 Conector inteligente: usado tanto no desktop quanto no mobile
  const handleSmartConnect = (connection: Connection) => {
    const sourceNode = findNodeById(connection.source);
    const targetNode = findNodeById(connection.target);

    if (!sourceNode || !targetNode) {
      // fallback: se não achar, manda pro onConnect normal
      onConnect(connection);
      return;
    }

    const kind = inferEdgeKind(sourceNode, targetNode, edges as RFEdge[]);

    // Se for conexão de dado e o target já tem uma entrada, bloqueia
    if (kind === "data" && !canConnectDataToTarget(targetNode, edges as RFEdge[])) {
      console.warn("[Flow] Ignorando conexão: alvo já tem entrada de dados.");
      return;
    }

    const previousData = (connection as any).data ?? {};
    const previousLabel = (connection as any).label;

    const label =
      kind === "decision-yes"
        ? "Sim"
        : kind === "decision-no"
        ? "Não"
        : previousLabel;

    const enhanced: Connection = {
      ...connection,
      data: {
        ...previousData,
        kind,
      },
      label,
      animated: kind === "data" ? true : (connection as any).animated,
    };

    onConnect(enhanced);
  };

  // 🔗 Lógica de clique em nó no MOBILE (tap-to-connect)
  const handleMobileNodeClick = (node: RFNode) => {
    // Se estiver em modo conectar, usamos toques pra criar aresta
    if (connectMode) {
      // 1º toque: escolhe a origem
      if (!connectSourceId) {
        setConnectSourceId(node.id);
        setSelectedNode(node);
        return;
      }

      // 2º toque: escolhe o destino
      if (connectSourceId && connectSourceId !== node.id) {
        const connection: Connection = {
          source: connectSourceId,
          target: node.id,
        };

        // 🧠 usa o conector inteligente
        handleSmartConnect(connection);
      }

      // Reseta estado depois da tentativa
      setConnectSourceId(null);
      setConnectMode(false);
      return;
    }

    // Comportamento normal: **apenas selecionar** o nó
    // o drawer só abre ao clicar no botão "Editar nó"
    setSelectedNode(node);
  };

  // Quando clica no "vazio" do canvas em mobile
  const handleMobilePaneClick = () => {
    setSelectedNode(null);
    setOpenInspector(false);

    // Sai do modo conectar e limpa origem
    setConnectMode(false);
    setConnectSourceId(null);
  };

  // Quando alterna o modo conectar
  const toggleConnectMode = () => {
    setConnectMode((prev) => {
      const next = !prev;
      if (!next) {
        setConnectSourceId(null);
      }
      return next;
    });
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
              onConnect={handleSmartConnect}
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
            onConnect={handleSmartConnect}
            onNodeClick={(_, node) => handleMobileNodeClick(node)}
            onPaneClick={handleMobilePaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />

          {/* botões flutuantes topo-esquerda */}
          <div className="absolute top-3 left-3 z-20 flex gap-2 flex-wrap">
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

            {/* 🔗 Botão de modo conectar */}
            <button
              type="button"
              onClick={toggleConnectMode}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-md border ${
                connectMode
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white/95 border-gray-200 text-gray-800"
              }`}
            >
              <Link2 className="w-4 h-4" />
              {connectMode ? "Toque em 2 nós" : "Conectar nós"}
            </button>

            {/* 🔌 Botão de desconectar nó */}
            <button
              type="button"
              disabled={!canDisconnect}
              onClick={handleDisconnectSelectedNode}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-md border ${
                canDisconnect
                  ? "bg-white/95 border-gray-200 text-gray-800"
                  : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
            >
              <Unlink2 className="w-4 h-4" />
              Desconectar nó
            </button>

            {/* 🧨 Botão de excluir nó ao lado dos outros */}
            <button
              type="button"
              disabled={!selectedNode}
              onClick={handleDeleteSelectedNode}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium shadow-md border ${
                selectedNode
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-gray-100 border-gray-200 text-gray-400"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              Excluir nó
            </button>
          </div>

          {/* Dica visual quando estiver em modo conectar com origem escolhida */}
          {connectMode && connectSourceId && (
            <div className="absolute bottom-4 left-4 z-20 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-gray-700 shadow-md border border-blue-100">
              Origem selecionada. Toque no nó destino para criar a conexão.
            </div>
          )}

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

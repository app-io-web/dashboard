// pages/flow/components/FlowCanvas.tsx
import React, { memo, useMemo, useCallback } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, MarkerType, Position,
  type Node, type Edge, type OnNodesChange, type OnEdgesChange,
  type FitViewOptions, type NodeTypes as ReactFlowNodeTypes, type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "../nodes";

type NodeTypes = ReactFlowNodeTypes;

interface Props {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (c: Connection | Edge) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
}

const fitViewOptions: FitViewOptions = { padding: 0.3, duration: 800 };

// --- helpers -------------------------------------------------------
const edgeLabelFromHandle = (h?: string | null) =>
  h === "true" ? "SIM" : h === "false" ? "NÃO" : undefined;

const posFromHandle = (h?: string | null) =>
  h === "true"  ? Position.Right :
  h === "false" ? Position.Bottom :
  undefined;

const defaultTargetPos = Position.Top;

const EDGE_BASE: Partial<Edge> = {
  type: "step",
  animated: true,
  style: { strokeWidth: 1.5, strokeDasharray: "6 6" },
  // @ts-expect-error pathOptions é aceito no "step"
  pathOptions: { offset: 12, borderRadius: 8 },
  markerEnd: { type: MarkerType.ArrowClosed },
};


const dumpEdge = (tag: string, e: any) => {
  // eslint-disable-next-line no-console
 /* console.log(`[EDGE/${tag}]`, {
    id: e?.id,
    source: e?.source,
    target: e?.target,
    sourceHandle: e?.sourceHandle,
    targetHandle: e?.targetHandle,
    label: e?.label,
    type: e?.type,
    sourcePosition: e?.sourcePosition,
    targetPosition: e?.targetPosition,
  });*/
};


const FlowCanvas: React.FC<Props> = ({
  nodes, edges,
  onNodesChange, onEdgesChange,
  onConnect,
  onNodeClick, onPaneClick,
  onDrop, onDragOver,
}) => {
  const memoizedNodeTypes = useMemo(() => nodeTypes as unknown as NodeTypes, []);

  // 1) Normaliza e LOGA cada edge que entra (incl. backend)
  const normalizedEdges = useMemo<Edge[]>(() => {
    const ne = (edges ?? []).map((e) => {
      const sourceHandle = (e as any).sourceHandle as string | undefined;
      const targetHandle = (e as any).targetHandle as string | undefined;

      // tenta inferir posição pelo handle, mas respeita se já vier pronta
      let sourcePosition = (e as any).sourcePosition ?? posFromHandle(sourceHandle);
      let targetPosition = (e as any).targetPosition ?? defaultTargetPos;

      // “airbag”: se rótulo/handle dizem NÃO e posição não for Bottom, corrigimos e logamos
      const inferredLabel = e.label ?? edgeLabelFromHandle(sourceHandle);
      if ((sourceHandle === "false" || inferredLabel === "NÃO") && sourcePosition !== Position.Bottom) {
        // eslint-disable-next-line no-console
        console.warn("[EDGE/FIX] forçando sourcePosition=Bottom para edge NÃO", { id: e.id });
        sourcePosition = Position.Bottom;
      }
      if ((sourceHandle === "true" || inferredLabel === "SIM") && sourcePosition !== Position.Right) {
        // eslint-disable-next-line no-console
        console.warn("[EDGE/FIX] forçando sourcePosition=Right para edge SIM", { id: e.id });
        sourcePosition = Position.Right;
      }

      const out: Edge = {
        ...EDGE_BASE,
        ...e,
        type: e.type ?? "step",
        animated: e.animated ?? true,
        markerEnd: e.markerEnd ?? { type: MarkerType.ArrowClosed },
        style: { ...(EDGE_BASE.style as any), ...(e.style ?? {}) },
        label: inferredLabel,
        sourcePosition,
        targetPosition,
        ...(sourceHandle ? { sourceHandle } : {}),
        ...(targetHandle ? { targetHandle } : {}),
      };

      dumpEdge("IN", e);
      dumpEdge("NORM", out);
      return out;
    });

    return ne;
  }, [edges]);

  // 2) LOGA a conexão e já cria com tudo certo
  const handleConnect = useCallback(
    (c: Connection) => {
      // eslint-disable-next-line no-console
      console.log("[CONNECT]", c);
      const sourcePosition = posFromHandle(c.sourceHandle);
      const targetPosition = defaultTargetPos;

      const payload: Edge = {
        ...(EDGE_BASE as any),
        ...(c as any),
        id: `edge-${c.source}-${c.sourceHandle || 'main'}-${c.target}-${c.targetHandle || 'main'}-${Date.now()}`,
        type: "step",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { ...(EDGE_BASE.style as any) },
        label: edgeLabelFromHandle(c.sourceHandle),
        sourcePosition,
        targetPosition,
      };

      dumpEdge("CREATE", payload);
      onConnect(payload);
    },
    [onConnect]
  );

  // 3) (opcional) LOGA mudanças nos edges
  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    // eslint-disable-next-line no-console
    console.log("[EDGES/CHANGES]", changes);
    onEdgesChange(changes);
  }, [onEdgesChange]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={normalizedEdges}
      onConnect={handleConnect}
      defaultEdgeOptions={EDGE_BASE}
      onNodesChange={onNodesChange}
      onEdgesChange={handleEdgesChange}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={memoizedNodeTypes}
      fitView
      fitViewOptions={fitViewOptions}
      className="bg-gray-50"
      preventScrolling={false}
    >
      <Background color="#ccc" gap={20} />
      <Controls showZoom showFitView showInteractive />
      <MiniMap nodeColor="#3b82f6" maskColor="rgba(0,0,0,0.05)" zoomable pannable />
    </ReactFlow>
  );
};

export default memo(FlowCanvas);

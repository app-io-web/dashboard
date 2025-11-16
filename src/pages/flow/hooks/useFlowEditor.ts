// pages/flow/hooks/useFlowEditor.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from "reactflow";
import useFlowSync from "./useFlowSync";
import { api } from "@/lib/http";

type AppBasic = {
  id: string;
  codigo: number;
  nome: string;
  descricao?: string | null;
  logoUrl?: string | null;
  imageSquareUrl?: string | null;
  imageWideUrl?: string | null;
  status: string;
  empresaId: string | null;
  empresa?: { id: string; nome: string } | null;
  flowId?: string | null; // AQUI ESTÁ O SEGREDO
};

type OnNotFound = () => void;
type Flow = {
  id?: string;
  titulo: string;
  descricao?: string | null;
  empresaId: string;
};

export default function useFlowEditor(
  flowIdParam: string | null,
  empresaId: string,
  onNotFound?: OnNotFound
) {
  const rf = useReactFlow();
  const { screenToFlowPosition, fitView } = rf;

  const preserveViewport = useCallback(<T,>(fn: () => T): T => {
    const { x, y, zoom } = rf.getViewport();
    const result = fn();
    requestAnimationFrame(() => rf.setViewport({ x, y, zoom }));
    return result;
  }, [rf]);

  const [flow, setFlow] = useState<Flow | null>(
    flowIdParam && flowIdParam !== "new"
      ? null
      : { titulo: "Novo Fluxo", descricao: null, empresaId }
  );
  const [isLoading, setIsLoading] = useState<boolean>(!!(flowIdParam && flowIdParam !== "new"));
  const [isSaving, setIsSaving] = useState(false);
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<Edge>([]);
  const [selectedNode, _setSelectedNode] = useState<Node | null>(null);
  const [app, setApp] = useState<AppBasic | null>(null);
  const loadedForFlowIdRef = useRef<string | null>(null);
  const createOnceRef = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);
  const syncTimerRef = useRef<number | null>(null);
  const syncingRef = useRef<boolean>(false);
  const { syncToBackend } = useFlowSync(flowIdParam, empresaId);

  const clearSyncTimer = () => {
    if (syncTimerRef.current != null) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  const debouncedSync = useCallback(
    (n: Node[], e: Edge[]) => {
      if (!flow?.id || isLoading) return;
      clearSyncTimer();
      syncTimerRef.current = window.setTimeout(async () => {
        if (syncingRef.current) return;
        syncingRef.current = true;
        try {
          await syncToBackend(n, e);
        } finally {
          syncingRef.current = false;
        }
      }, 600);
    },
    [flow?.id, isLoading, syncToBackend]
  );

  const createFlow = useCallback(async () => {
    if (createOnceRef.current) return;
    createOnceRef.current = true;
    const { data } = await api.post("/flows", {
      titulo: "Novo Fluxo",
      descricao: "Criado automaticamente",
      empresaId,
      isTemplate: false,
    });
    const newFlow = (data?.flow ?? data) as Flow;
    setFlow(newFlow);
    window.history.replaceState(null, "", `/flow/${newFlow.id}?empresaId=${empresaId}`);
    loadedForFlowIdRef.current = String(newFlow.id);
    setIsLoading(false);
    return String(newFlow.id);
  }, [empresaId]);

  // ============================
  // LOAD FLOW + APP VINCULADO (SEM ROTA /app!)
  // ============================
  useEffect(() => {
    if (!flowIdParam || flowIdParam === "new") {
      if (empresaId) void createFlow();
      else setIsLoading(false);
      return;
    }

    if (loadedForFlowIdRef.current === flowIdParam) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const { data, status } = await api.get(`/flows/${flowIdParam}`, {
          params: { empresaId },
          validateStatus: () => true,
          signal: ctrl.signal as AbortSignal,
        });

        if (ctrl.signal.aborted) return;

        if (status === 404 || data?.ok === false) {
          onNotFound?.();
          return;
        }

        const flowNormalized: Flow = {
          id: data.id,
          empresaId: data.empresaId,
          titulo: data.name,
          descricao: data.description ?? null,
        };
        setFlow(flowNormalized);

        // CARREGA APP VINCULADO VIA /apps (NÃO USA /flows/:id/app)
        try {
          const appsRes = await api.get("/apps", {
            params: { empresaId },
            signal: ctrl.signal as AbortSignal,
          });

          if (!ctrl.signal.aborted) {
            const appsList = (appsRes.data?.items ?? []).map((a: any) => ({
              ...a,
              flowId: a.flowId ?? null,
            }));

            const vinculado = appsList.find((a: any) => a.flowId === flowIdParam);
            setApp(vinculado ?? null);
          }
        } catch (err: any) {
          if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
            console.warn("Erro ao carregar apps para vinculação:", err);
            setApp(null);
          }
        }

        const v = data.version ?? data.currentVersion ?? { nodes: [], edges: [] };

        const toVisualType = (raw?: string, data?: any) => {
          const t = (raw ?? "step").toString();
          const tl = t.toLowerCase();

          // variantes que podem vir do backend
          if (tl === "subflow" || tl === "callflow" || tl === "call_flow" || tl === "flow:call")
            return "callFlow";

          if (t === "step" && data?.kind) return `step:${data.kind}`;
          return t;
        };

        // 👇 garante que todos os nodes carregados sabem de qual fluxo fazem parte
        const currentFlowId = String(flowIdParam);

        const loadedNodes: Node[] = (v.nodes ?? []).map((n: any) => {
          const baseType = n.type ?? "step";
          const data = n.data ?? {};
          const type = toVisualType(baseType, data);
          return {
            id: n.key ?? n.id,
            type,
            position: { x: n.x ?? n.position?.x ?? 0, y: n.y ?? n.position?.y ?? 0 },
            data: {
              label: n.label ?? data.label ?? "",
              ...data,
              // 👇 campo usado pelo SubflowEditor para não listar o próprio fluxo
              flowId: data.flowId ?? currentFlowId,
            },
          };
        });

        const loadedEdges: Edge[] = (v.edges ?? []).map((e: any, idx: number) => ({
          id: e.key ?? e.id ?? `${e.sourceKey}-${e.targetKey}-${idx}`,
          source: e.sourceKey ?? e.source,
          target: e.targetKey ?? e.target,
          type: e.edgeType ?? e.type ?? "smoothstep",
          sourceHandle: e.sourceHandle ?? e.data?.handles?.source ?? undefined,
          targetHandle: e.targetHandle ?? e.data?.handles?.target ?? undefined,
          label: e.label ?? undefined,
          data: e.data ?? undefined,
          animated: e.animated ?? true,
          markerEnd: { type: MarkerType.ArrowClosed },
          pathOptions: e.pathOptions ?? e.data?.pathOptions ?? { offset: 12, borderRadius: 8 },
          style: { strokeWidth: 1.5 },
        }));

        const nodeMap = new Map(loadedNodes.map(n => [n.id, n]));
        const correctedEdges = loadedEdges.map(edge => {
          const src = nodeMap.get(edge.source);
          if (!src || src.type !== "decision") return edge;
          const yes = (src.data?.trueLabel ?? "SIM").trim() || "SIM";
          const no  = (src.data?.falseLabel ?? "NÃO").trim() || "NÃO";
          if (edge.sourceHandle === "true")  return { ...edge, label: yes };
          if (edge.sourceHandle === "false") return { ...edge, label: no };
          return edge;
        });

        setNodes(loadedNodes);
        setEdges(correctedEdges);
        loadedForFlowIdRef.current = flowIdParam;

      } catch (err: any) {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          onNotFound?.();
        }
      } finally {
        if (!ctrl.signal.aborted) setIsLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [flowIdParam, empresaId, createFlow, onNotFound]);

  // Sync automático
  useEffect(() => {
    if (!flow?.id || isLoading) return;
    debouncedSync(nodes, edges);
    return clearSyncTimer;
  }, [nodes, edges, flow?.id, isLoading, debouncedSync]);

  const saveFlow = useCallback(async () => {
    if (!flow?.id) return;
    setIsSaving(true);
    clearSyncTimer();
    try {
      syncingRef.current = true;
      await syncToBackend(nodes, edges);
    } finally {
      syncingRef.current = false;
      setIsSaving(false);
    }
  }, [flow?.id, nodes, edges, syncToBackend]);

  const EDGE_DEFAULTS = {
    type: "smoothstep" as const,
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: 1.5 },
    pathOptions: { offset: 12, borderRadius: 8 },
  };

  const getDecisionLabel = (c: Connection) => {
    if (!c.source) return undefined;
    const src = rf.getNode(c.source);
    if (src?.type !== "decision") return undefined;
    const yes = (src.data?.trueLabel ?? "SIM").trim() || "SIM";
    const no  = (src.data?.falseLabel ?? "NÃO").trim() || "NÃO";
    return c.sourceHandle === "true" ? yes : c.sourceHandle === "false" ? no : undefined;
  };

  const onConnect: OnConnect = useCallback(
    (c: Connection) => {
      const label = getDecisionLabel(c);
      setEdges((eds) =>
        addEdge(
          {
            ...EDGE_DEFAULTS,
            id: `${c.source}-${c.target}-${Date.now()}`,
            source: c.source!,
            target: c.target!,
            sourceHandle: c.sourceHandle,
            targetHandle: c.targetHandle,
            label,
          },
          eds
        )
      );
    },
    [setEdges, rf]
  );

  // -----------------------------
  // Helpers para criação de nodes
  // -----------------------------
  const labelFor = (type: string) =>
    type === "step" ? "Novo passo" :
    type === "decision" ? "Decisão" :
    type === "start" ? "Início" :
    type === "end" ? "Fim" :
    type === "step:database" ? "DB Step" :
    type === "step:request"  ? "Request Step" :
    type === "step:external" ? "External Step" :
    type === "callFlow" ? "Chamar Fluxo" :
    type.charAt(0).toUpperCase() + type.slice(1);

  const defaultDataFor = (type: string) => {
    if (type === "decision") {
      return { trueLabel: "SIM", falseLabel: "NÃO", question: "" };
    }
    if (type === "step:database") {
      return { kind: "database", db: { operation: "select", table: "", connection: "" } };
    }
    if (type === "step:request") {
      return { kind: "request", req: { method: "GET", url: "", timeoutMs: 10000, headersJson: "", bodyJson: "" } };
    }
    if (type === "step:external") {
      return { kind: "external", external: { channel: "webhook", target: "", template: "" } };
    }
    if (type === "callFlow") {
      return { passContext: true, targetFlowId: null, targetFlowTitle: null };
    }
    return {};
  };

  const addNode = useCallback(
    (type: string, at?: { x: number; y: number }) => {
      // 👇 descobre o fluxo atual para já gravar no data
      const currentFlowId =
        (flow && flow.id) ||
        (flowIdParam && flowIdParam !== "new" ? flowIdParam : null);

      const node: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: at ?? { x: 300, y: 300 },
        data: {
          label: labelFor(type),
          ...defaultDataFor(type),
          // 👇 importante para o SubflowEditor filtrar o próprio fluxo
          flowId: currentFlowId,
        },
      };
      preserveViewport(() => setNodes((nds) => [...nds, node]));
      _setSelectedNode(node);
    },
    [setNodes, _setSelectedNode, preserveViewport, flow, flowIdParam]
  );

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;
    const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode(type, pos);
  }, [screenToFlowPosition, addNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const setSelectedNode = useCallback(
    (next: Node | null) => {
      _setSelectedNode(next);
      if (!next) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === next.id
            ? {
                ...n,
                type: next.type ?? n.type,
                position: next.position ?? n.position,
                data: {
                  ...n.data,
                  ...next.data,
                },
              }
            : n
        )
      );
      if (next.type === "decision") {
        setEdges((eds) =>
          eds.map((e) => {
            if (e.source !== next.id) return e;
            const yes = (next.data?.trueLabel ?? "SIM").trim() || "SIM";
            const no  = (next.data?.falseLabel ?? "NÃO").trim() || "NÃO";
            if (e.sourceHandle === "true")  return { ...e, label: yes };
            if (e.sourceHandle === "false") return { ...e, label: no };
            return e;
          })
        );
      }
    },
    [setNodes, setEdges]
  );

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChangeBase(changes);
      if (selectedNode && changes.some((c) => c.type === "remove" && (c as any).id === selectedNode.id)) {
        _setSelectedNode(null);
      }
    },
    [onNodesChangeBase, selectedNode]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => onEdgesChangeBase(changes),
    [onEdgesChangeBase]
  );

  useEffect(() => {
    return () => {
      clearSyncTimer();
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return useMemo(
    () => ({
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
    }),
    [
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
    ]
  );
}

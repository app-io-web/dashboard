// pages/flow/hooks/useFlowSync.ts
import { useCallback, useRef } from "react";
import type { Node, Edge } from "reactflow";
import { api } from "@/lib/http";

type SyncResult = { ok: boolean };

// ---- helpers ----
const toNull = <T,>(v: T | undefined): T | null => (v === undefined ? null : (v as any));
const cleanStr = (v: any) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : null;
  }
  return String(v);
};
const cleanNum = (v: any, def = 0) => {
  if (v === undefined || v === null || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

function sanitizeNodeData(data: any = {}) {
  const {
    __rf, measured, dragging, selected, zIndex,
    position, positionAbsolute,
    width, height,
    ...rest
  } = data || {};
  return rest;
}

function toCanonicalNodeType(type?: string) {
  const raw = (type ?? "step").toString();
  const tl = raw.toLowerCase();

  // ✅ normaliza todas as variantes de subfluxo para "callFlow" (pra salvar certo)
  if (tl === "subflow" || tl === "callflow" || tl === "call_flow" || tl === "flow:call") {
    return "callFlow";
  }

  // ✅ steps especializados são compactados para "step"
  if (raw.startsWith("step:")) return "step";

  return raw;
}

function ensureKindFromType(type: string | undefined, data: any) {
  const raw = (type ?? "step").toString();
  // ✅ só injeta kind nos "step:*" — não mexe em callFlow
  if (raw.startsWith("step:") && !data?.kind) {
    return { ...data, kind: raw.split(":")[1] };
  }
  return data;
}

function normalizeMarker(m: any): string | null {
  if (!m) return null;
  if (typeof m === "string") return m;
  if (typeof m === "object" && m.type) return String(m.type);
  return null;
}

// Ajustado: agora recebe empresaId como parâmetro obrigatório
export default function useFlowSync(
  flowIdParam: string | null,
  empresaId: string | null // <-- ADICIONADO: obrigatório no payload
) {
  const inflightRef = useRef<Promise<SyncResult> | null>(null);

  const mapNodes = (nodes: Node[]) =>
    nodes.map((n, idx) => {
      const originalType = n.type ?? "step";
      const type = toCanonicalNodeType(originalType);
      const cleaned = sanitizeNodeData(n.data);
      const data = ensureKindFromType(originalType, cleaned);

      return {
        key: n.id,
        type,
        label: cleanStr((n.data as any)?.label),
        description: cleanStr((n.data as any)?.description),
        x: cleanNum(n.position?.x, 0),
        y: cleanNum(n.position?.y, 0),
        order: idx,
        data,
      };
    });

  const mapEdges = (edges: Edge[]) =>
    edges.map((e, idx) => {
      const rfType = (e as any).type ?? (e.data as any)?.type ?? "smoothstep";

      const sourceKey = String(e.source || `source-${idx}`).trim();
      const targetKey = String(e.target || `target-${idx}`).trim();
      if (!sourceKey || !targetKey) {
        throw new Error("Edge sem source ou target válido");
      }

      const key = e.id && String(e.id).trim()
        ? String(e.id)
        : `edge-${sourceKey}-${e.sourceHandle || ''}-${targetKey}-${e.targetHandle || ''}-${Date.now()}-${idx}`;

      return {
        key,
        sourceKey,
        targetKey,
        sourceHandle: toNull((e as any).sourceHandle),
        targetHandle: toNull((e as any).targetHandle),
        edgeType: String(rfType),
        label: cleanStr((e as any).label),
        animated: Boolean((e as any).animated ?? true),
        style: (e as any).style ?? { strokeWidth: 1.5 },
        pathOptions: (e as any).pathOptions ?? { offset: 12, borderRadius: 8 },
        markerStart: normalizeMarker((e as any).markerStart),
        markerEnd: normalizeMarker((e as any).markerEnd) ?? "arrowclosed",
        data: e.data ?? null,
      };
    });

  const syncToBackend = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      // Validação: flowId e empresaId são obrigatórios
      if (!flowIdParam || !empresaId) {
        console.warn("[FlowSync] Sync bloqueado: faltando flowId ou empresaId", {
          flowId: flowIdParam,
          empresaId,
        });
        return { ok: false };
      }

      const payload = {
        empresaId, // Enviado explicitamente (backend exige)
        nodes: mapNodes(nodes),
        edges: mapEdges(edges),
      };

      if (inflightRef.current) return inflightRef.current;

      inflightRef.current = api
        .put(`/flows/${flowIdParam}/version/sync`, payload, { validateStatus: () => true })
        .then((res) => {
          inflightRef.current = null;
          const success = res.status < 300;
          if (!success) {
            console.error("[FlowSync] Falha no sync", { status: res.status, data: res.data });
          }
          return { ok: success };
        })
        .catch((err) => {
          inflightRef.current = null;
          console.error("[FlowSync] Erro na requisição", err);
          return { ok: false };
        });

      return inflightRef.current;
    },
    [flowIdParam, empresaId] // empresaId agora é dependência
  );

  const flushSave = useCallback(
    (nodes: Node[], edges: Edge[]) => syncToBackend(nodes, edges),
    [syncToBackend]
  );

  return { syncToBackend, flushSave };
}
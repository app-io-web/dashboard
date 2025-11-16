// src/features/flows/api.ts
import { api } from "@/lib/http";
import type { Flow, FlowListItem, SaveFlowInput } from "./types";

export async function listFlows(params?: {
  q?: string;
  empresaId?: string;
  status?: string;   // "active|draft|archived|all"
  page?: number;
  pageSize?: number;
  mine?: 1 | 0;     // se tu seguir o padrão das outras rotas
  signal?: AbortSignal;
}): Promise<{ items: FlowListItem[]; total: number; page: number; pageSize: number }> {
  const res = await api.get("/flows", { params, signal: params?.signal });
  return res.data;
}

export async function getFlow(id: string, signal?: AbortSignal): Promise<Flow> {
  const res = await api.get(`/flows/${id}`, { signal });
  return res.data;
}

export async function createFlow(input: SaveFlowInput): Promise<Flow> {
  const mappedInput = {
    empresaId: input.empresaId,
    titulo: input.name,  // ← mapeia name para titulo
    descricao: input.description ?? undefined,  // ← mapeia description para descricao
    status: input.status ?? "draft",
  };
  const res = await api.post("/flows", mappedInput);
  return res.data;
}

export async function updateFlow(id: string, patch: Partial<SaveFlowInput>): Promise<Flow> {
  const mappedPatch: any = {};
  if (patch.empresaId) mappedPatch.empresaId = patch.empresaId;
  if (patch.name) mappedPatch.titulo = patch.name;  // ← mapeia
  if (patch.description !== undefined) mappedPatch.descricao = patch.description;  // ← mapeia
  if (patch.status) mappedPatch.status = patch.status;
  const res = await api.patch(`/flows/${id}`, mappedPatch);
  return res.data;
}

export async function updateFlowSteps(id: string, steps: SaveFlowInput["steps"]): Promise<Flow> {
  const res = await api.put(`/flows/${id}/steps`, { steps });
  return res.data;
}

export async function deleteFlow(id: string): Promise<{ ok: boolean }> {
  const res = await api.delete(`/flows/${id}`);
  return res.data;
}

export async function toggleFlowStatus(id: string, status: "active" | "archived" | "draft"): Promise<Flow> {
  const res = await api.patch(`/flows/${id}/status`, { status });
  return res.data;
}

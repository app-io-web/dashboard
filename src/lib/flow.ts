// src/lib/api/flow.ts
import { api } from "@/lib/http";
import { getAccessToken } from "@/lib/auth";

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const flowApi = {
  getUserEmpresas: () => api.get("/flows/user/empresas", { headers: authHeaders() }),
  getFlows: (empresaId: string) =>
    api.get(`/flows?empresaId=${encodeURIComponent(empresaId)}`, { headers: authHeaders() }),
  getFlowApp: (flowId: string, empresaId: string) =>
    api.get(`/flows/${encodeURIComponent(flowId)}/app?empresaId=${encodeURIComponent(empresaId)}`, {
      headers: authHeaders(),
    }),
  getApps: (empresaId: string) =>
    api.get(`/apps?empresaId=${encodeURIComponent(empresaId)}`, { headers: authHeaders() }),
  createEmptyFlow: (body: any) => api.post("/flows", body, { headers: authHeaders() }),
  ensureWorkflowForApp: (appId: string) =>
    api.post(`/apps/${appId}/workflows/ensure`, {}, { headers: authHeaders() }),
};
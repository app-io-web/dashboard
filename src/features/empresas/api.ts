// src/features/empresas/api.ts
import { api } from "@/lib/http";
import type { Empresa } from "./types";

const EMPRESAS_ENDPOINT = "/empresas?mine=1"; // mantido

export async function listEmpresas(signal?: AbortSignal) {
  const { data } = await api.get<Empresa[]>(EMPRESAS_ENDPOINT, { signal });
  return data ?? [];
}

export type CreateEmpresaInput = {
  nome: string;
  emailContato?: string;
  cnpj?: string;
  responsavel?: string;
  // credencial própria da empresa (opcional, vem só no create)
  loginEmail?: string;
  loginPassword?: string;
};

export async function createEmpresa(payload: CreateEmpresaInput) {
  const { data } = await api.post<Empresa>("/empresas", payload);
  return data;
}

export async function getEmpresa(id: string, signal?: AbortSignal) {
  const { data } = await api.get(`/empresas/${id}`, { signal });
  return data as Empresa & {
    apps?: Array<{
      id: string;
      codigo: number;
      nome: string;
      status: string;
      logoUrl?: string | null;
      imageSquareUrl?: string | null;
      imageWideUrl?: string | null;
      criadoEm?: string;
    }>;
  };
}
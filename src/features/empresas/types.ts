// src/features/empresas/types.ts
export type Empresa = {
  id: string;              // uuid
  nome: string;
  criadoEm?: string | Date;
  atualizadoEm?: string | Date;

  // já existia:
  cnpj?: string | null;
  dominio?: string | null;
  appsCount?: number | null;
  valorTotal?: number | null;

  // NOVOS (opcionais; o back pode ou não retornar):
  emailContato?: string | null;
  responsavel?: string | null;
  loginEmail?: string | null; // nunca trafegar senha de volta
};

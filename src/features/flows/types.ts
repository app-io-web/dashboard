// src/features/flows/types.ts
export type FlowStatus = "draft" | "active" | "archived";

export type FlowStep = {
  id?: string;            // opcional no front enquanto não salva
  title: string;
  description?: string | null;
  order: number;          // para ordenação
  done?: boolean;         // marcação simples
};

export type Flow = {
  id: string;
  empresaId: string;
  name: string;
  description?: string | null;
  status: FlowStatus;
  createdAt: string;
  updatedAt: string;
  steps: FlowStep[];
};

// Auxiliares de listagem
export type FlowListItem = Pick<Flow, "id" | "empresaId" | "name" | "status" | "updatedAt"> & {
  stepsCount: number;
};

export type SaveFlowInput = {
  empresaId: string;
  name: string;
  description?: string;
  status?: FlowStatus;    // default "draft" no backend
  steps?: FlowStep[];     // opcional criar já com steps
};

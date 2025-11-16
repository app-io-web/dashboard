// src/pages/details/types.ts

export type AppStatus = "Em desenvolvimento" | "Em produção" | "Pausado";

export interface AppCommandGroup {
  titulo: string;   // ex: "GitHub Pages"
  linhas: string[]; // comandos em ordem
}

// cada item do histórico de atividades
export type AppActivity = {
  tipo: "status" | "descricao" | "email" | "repositorio" | "dominio" | "outro";
  texto: string;
  quando: string; // data em ISO
  meta?: Record<string, unknown>;
};

export interface AppDetails {
  id: string;
  nome: string;
  descricao: string;
  status: AppStatus;
  repositorio: string;
  ambiente: string;
  bucketS3: string;
  dominio?: string;
  comandos?: AppCommandGroup[];

  // histórico
  atividades: AppActivity[]; // 👈 atualizado

  email?: string;
  telefone?: string;
  valor?: number | null;
}

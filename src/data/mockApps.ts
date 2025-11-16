export type AppStatus = "Desenvolvimento" | "Corrigindo Erros" | "Projeto Finalizado";

export interface AppData {
  id: number;
  nome: string;
  email: string;
  empresa: string;
  descricao: string;
  preco: number;
  status: AppStatus;
  hospedagem: string;
}

export const mockApps: AppData[] = [
  {
    id: 1,
    nome: "E-commerce Dashboard",
    email: "cliente@empresa.com",
    empresa: "Empresa XYZ",
    descricao: "Dashboard completo para gestão de e-commerce com analytics em tempo real",
    preco: 15000,
    status: "Desenvolvimento",
    hospedagem: "Vercel",
  },
  {
    id: 2,
    nome: "App Mobile Delivery",
    email: "contato@delivery.com",
    empresa: "Delivery Express",
    descricao: "Aplicativo de delivery com rastreamento em tempo real",
    preco: 25000,
    status: "Corrigindo Erros",
    hospedagem: "AWS",
  },
  {
    id: 3,
    nome: "Sistema CRM",
    email: "admin@crm.com",
    empresa: "CRM Global",
    descricao: "Sistema completo de gestão de relacionamento com clientes",
    preco: 30000,
    status: "Projeto Finalizado",
    hospedagem: "Render",
  },
];

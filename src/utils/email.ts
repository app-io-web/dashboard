export function normalizeAppForEmail(app: AppDetails, newStatus: string): any {
  const nome = app.nome?.trim();
  if (!nome) {
    console.warn("App sem nome! Usando fallback.", app);
  }

  return {
    id: app.id,
    codigo: app.codigo ?? null,
    nome: nome || `App #${app.id || "sem-id"}`, // GARANTE NOME SEMPRE
    descricao: app.descricao ?? null,
    status: newStatus,
    repositorio: app.repositorio ?? null,
    ambiente: app.ambiente ?? null,
    bucketS3: app.bucketS3 ?? null,
    dominio: app.dominio ?? null,
    email: app.email ?? null,
    telefone: app.telefone ?? null,
    valor: app.valor ?? null,
    criadoEm: app.criadoEm ?? null,
    comandos: (app.comandos ?? []).map(c => ({
      titulo: c.titulo ?? "Comando",
      linguagem: c.linguagem,
      linhas: Array.isArray(c.linhas) ? c.linhas : [],
    })),
    atividades: (app.atividades ?? []).map(a => ({
      texto: a.texto ?? "",
      quando: a.quando ?? new Date().toISOString(),
      tipo: a.tipo ?? "outro",
    })),
  };
}
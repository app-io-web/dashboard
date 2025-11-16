// utils/cmd.ts
export type CmdLineLike = string | { linha?: string } | { line?: string };
export type CmdGroupLike = { titulo?: string; linhas?: CmdLineLike[] };

export function normalizeCmdGroups(input?: CmdGroupLike[]): { titulo?: string; linhas: string[] }[] {
  if (!Array.isArray(input)) return [];
  return input.map(g => ({
    titulo: g.titulo ?? "",
    linhas: (g.linhas ?? [])
      .map(x => (typeof x === "string" ? x : (x.linha ?? (x as any).line ?? "")))
      .filter(s => typeof s === "string"),
  }));
}

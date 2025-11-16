export function formatBRL(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/** Aceita "R$ 1.234,56" ou "1234,56" e devolve número (em reais) */
export function parseBRL(input: string) {
  if (!input) return null;
  // remove tudo exceto dígitos e vírgula/ponto
  const s = input.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "");
  // troca vírgula decimal por ponto
  const normalized = s.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

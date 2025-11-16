export function shortRef(s?: string) {
  if (!s) return "";
  return s.length > 8 ? s.slice(0, 8) : s;
}

export function isPublishedPretty(status?: unknown) {
  if (typeof status === "string") {
    const s = status.trim().toLowerCase();
    return s === "em produção" || s === "publicado";
  }
  if (status && typeof status === "object") {
    const label = (status as any)?.label;
    if (typeof label === "string") {
      const s = label.trim().toLowerCase();
      return s === "em produção" || s === "publicado";
    }
  }
  return false;
}

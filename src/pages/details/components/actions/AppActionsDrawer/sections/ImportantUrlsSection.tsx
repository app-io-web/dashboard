// src/pages/details/components/actions/AppActionsDrawer/sections/ImportantUrlsSection.tsx
import { useMemo } from "react";
import { Link as LinkIcon, Plus, Trash2, Pencil, Check, ExternalLink } from "lucide-react";
// ImportantUrlsSection.tsx
import type { ImportantUrl } from "../types";
import { normalizeUrl, formatUrlForDisplay, faviconUrl, iconFor, uuid } from "../types";


type UrlRow = ImportantUrl & { editing?: boolean };

export function ImportantUrlsSection({
  urls,
  setUrls,
}: {
  urls: UrlRow[];
  setUrls: (next: UrlRow[] | ((p: UrlRow[]) => UrlRow[])) => void;
}) {
  function addUrl() {
    setUrls(prev => [...prev, { id: uuid(), label: "", url: "", editing: true }]);
  }
  function updateUrl(id: string, patch: Partial<UrlRow>) {
    setUrls(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
  }
  function removeUrl(id: string) {
    setUrls(prev => prev.filter(u => u.id !== id));
  }
  function toggleEdit(id: string, next?: boolean) {
    setUrls(prev => prev.map(u => (u.id === id ? { ...u, editing: typeof next === "boolean" ? next : !u.editing } : u)));
  }

  const cleaned = useMemo(
    () =>
      urls.map(u => ({
        ...u,
        label: u.label.trim(),
        url: u.url.trim(),
      })),
    [urls]
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <LinkIcon size={18} className="text-sky-600" />
          URLs importantes
        </h3>
        <button
          onClick={addUrl}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      <div className="space-y-3">
        {cleaned.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma URL cadastrada. Clique em <strong>Adicionar</strong> para criar.
          </p>
        )}

        {cleaned.map((u, idx) => {
          const isValid = u.label.length > 0 && u.url.length > 0;
          const { Icon, cls } = iconFor(u.label);

          return (
            <div key={u.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Icon size={16} className={cls} />
                  </div>
                  <span className="truncate text-sm font-medium text-slate-700">
                    {u.label || `Item ${idx + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!u.editing && (
                    <button
                      onClick={() => toggleEdit(u.id, true)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => removeUrl(u.id)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {!u.editing && isValid && (
                <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  {faviconUrl(u.url) && (
                    <img
                      src={faviconUrl(u.url)}
                      alt=""
                      className="h-5 w-5 rounded"
                      loading="lazy"
                      onError={e => {
                        try {
                          const host = new URL(normalizeUrl(u.url)).hostname;
                          (e.currentTarget as HTMLImageElement).src =
                            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
                        } catch {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }
                      }}
                    />
                  )}
                  <a
                    href={normalizeUrl(u.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="block flex-1 truncate text-xs text-sky-700 hover:underline"
                    title={normalizeUrl(u.url)}
                  >
                    {formatUrlForDisplay(u.url)}
                  </a>
                  <a
                    href={normalizeUrl(u.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-white"
                    title="Abrir"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {(u.editing || !isValid) && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <input
                    value={u.label}
                    onChange={e => updateUrl(u.id, { label: e.target.value })}
                    placeholder='Rótulo (ex.: Acesso Técnico, "acesso técnico", Admin, Docs)'
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <div className="flex gap-2">
                    <input
                      value={u.url}
                      onChange={e => updateUrl(u.id, { url: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    />
                    <button
                      onClick={() => toggleEdit(u.id, false)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                      title="Concluir edição"
                    >
                      <Check size={16} />
                      Concluir
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Dica: pode colar sem protocolo; eu completo com <code>https://</code>.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

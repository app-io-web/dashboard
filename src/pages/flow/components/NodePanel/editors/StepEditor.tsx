// pages/flow/components/NodePanel/editors/StepEditor.tsx
import type { Node } from "reactflow";
import BaseFields from "./BaseFields";
import { useMemo, useState } from "react";
import { Link2, StickyNote, Terminal, Key, Trash2, Plus, Globe, Search  } from "lucide-react";
import IconPickerModal from "./IconPickerModal"; // ajuste o caminho se necessário

type StepComponent =
  | { id: string; type: "url"; label: string; value: string }
  | { id: string; type: "note"; text: string }
  | { id: string; type: "command"; shell: "bash" | "powershell" | "cmd"; content: string }
  | { id: string; type: "credential"; key: string; value: string; masked?: boolean };

const newComponent = (type: StepComponent["type"]): StepComponent => {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
  switch (type) {
    case "url": return { id, type, label: "Documentação", value: "" };
    case "note": return { id, type, text: "" };
    case "command": return { id, type, shell: "bash", content: "" };
    case "credential": return { id, type, key: "API_KEY", value: "", masked: true };
  }
};

export default function StepEditor({ node, onChange }: { node: Node; onChange: (n: Node) => void }) {
  const data = useMemo(() => node.data ?? {}, [node.data]);
  const components = (data.components as StepComponent[] | undefined) ?? [];
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const setData = (patch: Record<string, any>) =>
    onChange({ ...node, data: { ...data, ...patch } });

  const upsertComponent = (c: StepComponent) => {
    const next = [...components];
    const i = next.findIndex((x) => x.id === c.id);
    if (i >= 0) next[i] = c;
    else next.push(c);
    setData({ components: next });
  };

  const removeComponent = (id: string) =>
    setData({ components: components.filter((c) => c.id !== id) });

  const add = (type: StepComponent["type"]) => upsertComponent(newComponent(type));

  return (
    <div className="text-gray-800 px-1">
      <BaseFields node={node} onChange={onChange} />


      {/* ÍCONE E COR — AGORA COM ESTILO PERFEITO */}
      <div className="mt-6 space-y-5">
        {/* ÍCONE */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Globe className="w-4 h-4 text-blue-600" />
              Ícone (Lucide ou URL)
            </label>
            <button
              onClick={() => setIsIconPickerOpen(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 flex items-center gap-1 transition"
            >
              <Search className="w-3.5 h-3.5" />
              Escolher ícone
            </button>
          </div>

          <input
            type="text"
            value={(data?.icon as string) ?? ""}
            onChange={(e) => setData({ icon: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm placeholder-gray-400 
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-shadow"
            placeholder="Globe | https://logo.png"
          />
          <p className="mt-2 text-xs text-blue-600">
            Aceita <code className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Globe</code>,&nbsp;
            <code className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Link</code> ou URL.
          </p>
        </div>

        {/* COR */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 shadow-sm"></div>
            Cor
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={(data?.color as string) ?? "#2563eb"}
              onChange={(e) => setData({ color: e.target.value })}
              className="h-11 w-14 rounded-lg border border-gray-300 cursor-pointer overflow-hidden 
                        shadow-sm hover:shadow transition-shadow"
              title="Escolher cor"
            />
            <input
              type="text"
              value={(data?.color as string) ?? "#2563eb"}
              onChange={(e) => setData({ color: e.target.value })}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-mono
                        focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-shadow"
              placeholder="#2563eb"
            />
          </div>
        </div>
      </div>


      {/* COMPONENTES */}
      <div className="mt-7">
        <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          Componentes
        </h4>

        {/* BOTÕES 2x2 — PERFEITO NO ESPAÇO */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { t: "url", Icon: Link2, label: "URL" },
            { t: "note", Icon: StickyNote, label: "Nota" },
            { t: "command", Icon: Terminal, label: "Comando" },
            { t: "credential", Icon: Key, label: "Credencial" },
          ].map(({ t, Icon, label }) => (
            <button
              key={t}
              onClick={() => add(t as StepComponent["type"])}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-4 text-sm font-medium text-blue-800 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
            >
              <Icon className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
              <span className="text-xs">+ {label}</span>
            </button>
          ))}
        </div>

        {/* LISTA DE COMPONENTES */}
        <div className="space-y-4">
          {components.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-blue-100 bg-white shadow-sm hover:shadow transition p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {c.type === "url" && "LINK"}
                  {c.type === "note" && "NOTA"}
                  {c.type === "command" && "COMANDO"}
                  {c.type === "credential" && "CREDENCIAL"}
                </span>
                <button
                  onClick={() => removeComponent(c.id)}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1.5 text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>

              {/* URL */}
              {c.type === "url" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-blue-700">Rótulo</label>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => upsertComponent({ ...c, label: e.target.value })}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-blue-700">URL</label>
                    <input
                      type="url"
                      value={c.value}
                      onChange={(e) => upsertComponent({ ...c, value: e.target.value })}
                      placeholder="https://..."
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                  </div>
                </div>
              )}

              {/* NOTA */}
              {c.type === "note" && (
                <div>
                  <label className="text-xs font-medium text-blue-700">Texto da nota</label>
                  <textarea
                    rows={3}
                    value={c.text}
                    onChange={(e) => upsertComponent({ ...c, text: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none"
                  />
                </div>
              )}

              {/* COMANDO */}
              {c.type === "command" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-blue-700">Shell</label>
                    <select
                      value={c.shell}
                      onChange={(e) => upsertComponent({ ...c, shell: e.target.value as any })}
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                    >
                      <option value="bash">bash</option>
                      <option value="powershell">powershell</option>
                      <option value="cmd">cmd</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-blue-700">Comando</label>
                    <textarea
                      rows={3}
                      value={c.content}
                      onChange={(e) => upsertComponent({ ...c, content: e.target.value })}
                      placeholder="npm run dev"
                      className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition resize-none font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {/* CREDENCIAL */}
              {c.type === "credential" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-blue-700">Chave</label>
                      <input
                        type="text"
                        value={c.key}
                        onChange={(e) => upsertComponent({ ...c, key: e.target.value })}
                        placeholder="API_KEY"
                        className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-blue-700">Valor</label>
                      <input
                        type={c.masked ? "password" : "text"}
                        value={c.value}
                        onChange={(e) => upsertComponent({ ...c, value: e.target.value })}
                        className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition font-mono"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-blue-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!c.masked}
                      onChange={(e) => upsertComponent({ ...c, masked: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span>Ocultar valor por padrão</span>
                  </label>
                </div>
              )}
            </div>
          ))}

          {/* VAZIO */}
          {components.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-blue-700 font-medium">
                Nenhum componente ainda.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Use os botões acima para adicionar
              </p>
            </div>
          )}
          <IconPickerModal
            isOpen={isIconPickerOpen}
            onClose={() => setIsIconPickerOpen(false)}
            onSelect={(iconName) => {
              setData({ icon: iconName });
              setIsIconPickerOpen(false);
            }}
            currentIcon={data?.icon as string}
          />
        </div>
      </div>
    </div>
  );
}
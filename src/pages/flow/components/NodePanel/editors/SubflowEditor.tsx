// pages/flow/components/NodePanel/editors/SubflowEditor.tsx
import type { Node } from "reactflow";
import { useEffect, useMemo, useState } from "react";
import BaseFields from "./BaseFields";
import { api } from "@/lib/http";
import IconPickerModal from "./IconPickerModal";
import { icons } from "lucide-react";
import { Palette, Wand2 } from "lucide-react";

type FlowOption = { id: string; titulo: string };

type Props = {
  node: Node;
  onChange: (n: Node) => void;
  appId?: string | null;
};

export default function SubflowEditor({ node, onChange, appId }: Props) {
  const [options, setOptions] = useState<FlowOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [iconModalOpen, setIconModalOpen] = useState(false);

  const effectiveAppId =
    appId ||
    (node.data?.appId as string | undefined) ||
    (node.data?.flowAppId as string | undefined) ||
    null;

  const currentIconName =
    (node.data?.icon as string | undefined) || "Workflow" || "Activity";

  const IconPreview =
    icons[currentIconName as keyof typeof icons] || icons.Activity;

  const currentColor =
    (node.data?.color as string | undefined) ||
    (node.style?.borderColor as string | undefined) ||
    "#2563eb";

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!effectiveAppId) return;

      setLoading(true);

      try {
        const r = await api
          .get(`/apps/${effectiveAppId}/flows`)
          .catch(async () => {
            const r2 = await api.get(`/flows`, {
              params: { appId: effectiveAppId },
            });
            return r2;
          });

        if (mounted) {
          setOptions(r.data?.flows ?? r.data ?? []);
        }
      } catch (err) {
        console.error("[SubflowEditor] ERRO GERAL", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [effectiveAppId]);

  const targetId = (node.data?.targetFlowId as string) ?? "";
  const targetTitle = useMemo(
    () =>
      options.find((o) => o.id === targetId)?.titulo ??
      ((node.data?.targetFlowTitle as string) ?? ""),
    [options, targetId, node.data?.targetFlowTitle]
  );

  function updateNodeData(partial: Record<string, unknown>) {
    onChange({
      ...node,
      data: {
        ...node.data,
        ...partial,
      },
    });
  }

  function applyNodeColor(color: string) {
    if (!color) return;
    onChange({
      ...node,
      data: {
        ...node.data,
        color,
      },
      style: {
        ...(node.style || {}),
        borderColor: color,
        boxShadow: `0 0 0 1px ${color}`,
      },
    });
  }

  function handleIconSelect(iconName: string) {
    updateNodeData({ icon: iconName });
    setIconModalOpen(false);
  }

  return (
    <div className="space-y-5">
      <BaseFields node={node} onChange={onChange} />

      {/* PERSONALIZAÇÃO: ÍCONE + COR */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
              Aparência do node
            </p>
            <p className="text-xs text-gray-500">
              Ícone e cor pra destacar esse subfluxo no diagrama.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIconModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:border-blue-400 hover:text-blue-600 hover:shadow transition"
          >
            <Wand2 className="h-3 w-3" />
            Trocar ícone
          </button>
        </div>

        {/* tudo em COLUNA pra respeitar a largura do painel */}
        <div className="flex flex-col gap-3">
          {/* Preview do node */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-2 ring-white"
              style={{ backgroundColor: `${currentColor}22` }}
            >
              <IconPreview className="h-5 w-5 text-gray-800" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-gray-700">
                Ícone:{" "}
                <span className="font-mono text-[11px]">
                  {currentIconName}
                </span>
              </p>
              <p className="text-xs text-gray-700">
                Cor:{" "}
                <span className="font-mono text-[11px]">{currentColor}</span>
              </p>
            </div>
          </div>

          {/* Seleção de cor COM PICKER, também em coluna */}
          <div className="flex-1">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
              <Palette className="h-3 w-3" />
              Cor do node
            </div>

            <div className="flex flex-col gap-2">
              {/* empilha o picker e o input pra não quebrar */}
              <div className="flex flex-col gap-2">
                <input
                  type="color"
                  className="h-8 w-10 cursor-pointer rounded-md border border-gray-200 bg-transparent p-0"
                  value={currentColor}
                  onChange={(e) => applyNodeColor(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={currentColor}
                  onChange={(e) => applyNodeColor(e.target.value)}
                  placeholder="#2563eb"
                />
              </div>
              <p className="text-[11px] text-gray-500">
                Use qualquer cor em formato hex (ex: <code>#2563eb</code>).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SELECT DE FLUXO */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-800">
          Fluxo de destino
        </label>
        <p className="text-xs text-gray-500">
          Escolha qual fluxo será chamado quando esse node for executado.
        </p>

        <select
          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white/80 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
          value={targetId}
          onChange={(e) => {
            const id = e.target.value || "";
            const titulo = options.find((o) => o.id === id)?.titulo ?? null;
            onChange({
              ...node,
              data: {
                ...node.data,
                targetFlowId: id || null,
                targetFlowTitle: titulo,
              },
            });
          }}
          disabled={!effectiveAppId || loading}
        >
          {!effectiveAppId && (
            <option>Vincule a um App para listar destinos</option>
          )}
          {effectiveAppId && (
            <option value="">
              {loading ? "Carregando fluxos..." : "Selecione um fluxo…"}
            </option>
          )}
          {effectiveAppId &&
            !loading &&
            options
              .filter((o) => o.id !== (node.data?.flowId as string))
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.titulo}
                </option>
              ))}
        </select>

        {targetTitle && (
          <p className="mt-1 text-xs text-gray-500">
            Destino selecionado:{" "}
            <span className="font-medium text-gray-800">{targetTitle}</span>
          </p>
        )}
      </div>

      {/* Propagar contexto */}
      <div className="flex items-center gap-2">
        <input
          id="passContext"
          type="checkbox"
          className="rounded border-gray-300"
          checked={Boolean(node.data?.passContext ?? true)}
          onChange={(e) =>
            onChange({
              ...node,
              data: { ...node.data, passContext: e.target.checked },
            })
          }
        />
        <label htmlFor="passContext" className="text-sm text-gray-700">
          Propagar contexto para o subfluxo
        </label>
      </div>

      <IconPickerModal
        isOpen={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        onSelect={handleIconSelect}
        currentIcon={currentIconName}
      />
    </div>
  );
}

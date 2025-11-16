// pages/flow/nodes/StepNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import * as Lucide from "lucide-react";
import { Link, StickyNote, TerminalSquare, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";

type StepComponent =
  | { id: string; type: "url"; label: string; value: string }
  | { id: string; type: "note"; text: string }
  | { id: string; type: "command"; shell: "bash" | "powershell" | "cmd"; content: string }
  | { id: string; type: "credential"; key: string; value: string; masked?: boolean };

const isUrl = (v?: string) => !!v && /^https?:\/\//i.test(v);

export default function StepNode({ data, selected }: NodeProps<any>) {
  const color = data?.color || "#2563eb";
  const iconField = (data?.icon as string | undefined)?.trim();
  const iconUrl: string | null = isUrl(iconField) ? iconField! : (data?.iconUrl ?? null);
  const IconName = !iconUrl && iconField ? iconField : undefined;
  const Icon = IconName && (Lucide as any)[IconName] ? (Lucide as any)[IconName] : null;

  const components: StepComponent[] = useMemo(
    () => (Array.isArray(data?.components) ? data.components : []),
    [data?.components]
  );

  const [imgOk, setImgOk] = useState(true);

  return (
    <div
      className={`rounded-2xl bg-white px-4 py-3 shadow-sm transition-all ${
        selected ? "ring-2 ring-offset-2 ring-blue-400" : "border"
      }`}
      style={{ borderColor: color, maxWidth: 280 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        {iconUrl && imgOk ? (
          <img
            src={iconUrl}
            alt=""
            className="h-5 w-5 rounded-sm object-contain"
            onError={() => setImgOk(false)}
          />
        ) : Icon ? (
          <Icon size={18} strokeWidth={2} style={{ color }} />
        ) : null}

        <div className="text-sm font-semibold truncate" style={{ color }}>
          {data?.label ?? "Passo"}
        </div>
      </div>

      {/* Descrição */}
      {data?.description && (
        <div className="mt-1 text-xs text-gray-600">
          {data.description}
        </div>
      )}

      {/* Componentes (um por linha) */}
      {components.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {components.map((c) => {
            if (c.type === "url") {
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                >
                  <Link size={12} />
                  <span className="truncate">{c.label || "URL"}</span>
                </div>
              );
            }
            if (c.type === "note") {
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                >
                  <StickyNote size={12} />
                  <span className="truncate">Nota</span>
                </div>
              );
            }
            if (c.type === "command") {
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                >
                  <TerminalSquare size={12} />
                  <span className="truncate">{c.shell}</span>
                </div>
              );
            }
            // credential
            return (
              <div
                key={c.id}
                className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
              >
                <KeyRound size={12} />
                <span className="truncate">{("key" in c && c.key) ? c.key : "Credencial"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

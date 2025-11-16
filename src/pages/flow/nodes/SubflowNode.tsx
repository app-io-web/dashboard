// pages/flow/nodes/SubflowNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import { Share2 } from "lucide-react";
import { icons } from "lucide-react";

type Data = {
  label?: string;
  description?: string | null;
  targetFlowId?: string | null;
  targetFlowTitle?: string | null;
  icon?: string | null;
  color?: string | null;
};

export default function SubflowNode({ data, selected }: NodeProps<Data>) {
  const fallbackColor = "#2563eb";
  const color = data?.color || fallbackColor;

  const IconComponent =
    (data?.icon && icons[data.icon as keyof typeof icons]) || Share2;

  const handleOpenTargetFlow = () => {
  if (!data?.targetFlowId) return;

  // pega empresaId da query atual (do fluxo pai)
  const sp = new URLSearchParams(window.location.search);
  const empresaId = sp.get("empresaId");

  // parte da URL antes do hash (#)
  const baseWithoutHash = window.location.href.split("#")[0]; 
  const hasHashRouter = window.location.hash.startsWith("#/");

  let finalUrl: string;

  if (hasHashRouter) {
    // GitHub Pages + HashRouter
    // exemplo: https://app-io-web.github.io/dashboard/#/flow/ID?empresaId=...
    finalUrl = `${baseWithoutHash}#/flow/${data.targetFlowId}`;
    if (empresaId) {
      finalUrl += `?empresaId=${empresaId}`;
    }
  } else {
    // ambientes com BrowserRouter (ex: Netlify)
    // usa caminho relativo a partir da raiz
    finalUrl = `/flow/${data.targetFlowId}`;
    if (empresaId) {
      finalUrl += `?empresaId=${empresaId}`;
    }
  }

  window.open(finalUrl, "_blank", "noopener,noreferrer");
};



  return (
    <div
      onClick={handleOpenTargetFlow}
      className={`rounded-2xl border px-4 py-3 bg-white shadow-sm transition-all cursor-pointer ${
        selected ? "ring-2 ring-offset-1" : ""
      }`}
      style={{
        borderColor: color,
        boxShadow: selected ? `0 0 0 1px ${color}33` : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${color}1a`,
            color,
          }}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        <div
          className="text-sm font-semibold"
          style={{ color }}
        >
          {data?.label ?? "Chamar Fluxo"}
        </div>
      </div>

      {data?.targetFlowTitle && (
        <div className="mt-1 text-xs text-gray-700">
          Destino: <span className="font-medium">{data.targetFlowTitle}</span>
        </div>
      )}

      {data?.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

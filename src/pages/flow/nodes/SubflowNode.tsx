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

  // empresaId do fluxo pai
  const sp = new URLSearchParams(window.location.search);
  const empresaId = sp.get("empresaId");

  // base configurada no Vite (ex: "/dashboard/")
  const basePath =
    (import.meta as any).env?.BASE_URL && (import.meta as any).env.BASE_URL !== "/"
      ? (import.meta as any).env.BASE_URL
      : "/";

  const hasHashRouter = !!window.location.hash; // se tem "#/..." na URL

  // monta o caminho do fluxo de destino
  let path = `flow/${data.targetFlowId}`;
  if (empresaId) {
    path += `?empresaId=${empresaId}`;
  }

  let finalUrl: string;

  if (hasHashRouter) {
    // caso GitHub Pages + HashRouter => /dashboard/#/flow/...
    finalUrl = `${window.location.origin}${basePath}#/${path}`;
  } else {
    // caso Netlify/BrowserRouter => /dashboard/flow/... ou /flow/...
    // basePath já cuida se for / ou /dashboard/
    finalUrl = `${window.location.origin}${basePath}${path}`;
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

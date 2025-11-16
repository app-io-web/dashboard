// pages/flow/nodes/RequestStepNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import { Globe2 } from "lucide-react";

type Data = {
  label?: string;
  description?: string | null;
  kind?: "request";
  req?: { method?: "GET"|"POST"|"PUT"|"PATCH"|"DELETE"; url?: string; timeoutMs?: number };
};

export default function RequestStepNode({ data, selected }: NodeProps<Data>) {
  const m = data?.req?.method || "GET";
  const u = data?.req?.url || "https://api.exemplo.com";
  return (
    <div className={`rounded-2xl border px-4 py-3 bg-white shadow-sm ${selected ? "ring-2 ring-blue-400" : "border-gray-200"}`}>
      <div className="flex items-center gap-2">
        <Globe2 className="h-4 w-4 text-blue-600" />
        <div className="text-sm font-semibold text-gray-800">{data?.label || "Request Step"}</div>
      </div>
      {data?.description && <div className="text-xs text-gray-600 mt-1">{data.description}</div>}
      <div className="mt-2 text-[11px] text-gray-500 truncate">
        {m} · {u}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

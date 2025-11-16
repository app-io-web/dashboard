// pages/flow/nodes/ExternalStepNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import { MessagesSquare } from "lucide-react";

type Data = {
  label?: string;
  description?: string | null;
  kind?: "external";
  external?: { channel?: "email"|"slack"|"webhook"; target?: string; template?: string };
};

export default function ExternalStepNode({ data, selected }: NodeProps<Data>) {
  const ch = data?.external?.channel || "webhook";
  const target = data?.external?.target || "url/canal";
  return (
    <div className={`rounded-2xl border px-4 py-3 bg-white shadow-sm ${selected ? "ring-2 ring-blue-400" : "border-gray-200"}`}>
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-blue-600" />
        <div className="text-sm font-semibold text-gray-800">{data?.label || "External Step"}</div>
      </div>
      {data?.description && <div className="text-xs text-gray-600 mt-1">{data.description}</div>}
      <div className="mt-2 text-[11px] text-gray-500">
        {ch} · {target}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

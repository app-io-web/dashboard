// pages/flow/nodes/DatabaseStepNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import { Database } from "lucide-react";

type Data = {
  label?: string;
  description?: string | null;
  kind?: "database";
  db?: { connection?: string; operation?: "select"|"insert"|"update"|"delete"; table?: string };
};

export default function DatabaseStepNode({ data, selected }: NodeProps<Data>) {
  return (
    <div className={`rounded-2xl border px-4 py-3 bg-white shadow-sm ${selected ? "ring-2 ring-blue-400" : "border-gray-200"}`}>
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-blue-600" />
        <div className="text-sm font-semibold text-gray-800">{data?.label || "DB Step"}</div>
      </div>
      {data?.description && <div className="text-xs text-gray-600 mt-1">{data.description}</div>}
      <div className="mt-2 text-[11px] text-gray-500">
        {data?.db?.operation?.toUpperCase() || "OPER"} · {data?.db?.table || "tabela"} · {data?.db?.connection || "conn"}
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

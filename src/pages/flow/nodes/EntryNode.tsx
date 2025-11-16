// pages/flow/nodes/EntryNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";

export default function EntryNode({ data, selected }: NodeProps<any>) {
  return (
    <div className={`rounded-2xl border-2 px-6 py-3 bg-white shadow-sm ${selected ? "ring-2 ring-blue-400" : "border-blue-500"}`}>
      <div className="text-sm font-extrabold tracking-wide text-blue-600">{data?.label ?? "ENTRADA"}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

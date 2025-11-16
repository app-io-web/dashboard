// pages/flow/nodes/NoteNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";

export default function NoteNode({ data, selected }: NodeProps<any>) {
  return (
    <div className={`rounded-xl border shadow-sm px-4 py-3 bg-yellow-50 ${selected ? "ring-2 ring-yellow-400" : "border-yellow-200"}`}>
      <div className="text-sm font-medium text-yellow-900 whitespace-pre-wrap">{data?.text ?? "Nota"}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

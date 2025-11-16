// pages/flow/utils/nodeTypes/StepNode.tsx
import { Handle, Position } from "reactflow";

export default function StepNode({ data }: any) {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-xl shadow-lg px-5 py-4 min-w-56">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="font-bold text-blue-700">{data.label || "Passo"}</div>
      {data.description && <div className="text-sm text-gray-600 mt-1">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
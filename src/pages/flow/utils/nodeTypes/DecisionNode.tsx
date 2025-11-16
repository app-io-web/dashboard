// pages/flow/utils/nodeTypes/DecisionNode.tsx
import { Handle, Position } from "reactflow";

export default function DecisionNode({ data }: any) {
  return (
    <div className="bg-white border-2 border-purple-500 rounded-xl shadow-lg px-5 py-4 min-w-56 rotate-45">
      <div className="-rotate-45 text-center">
        <div className="font-bold text-purple-700">{data.label || "Decisão"}</div>
        {data.description && <div className="text-xs text-gray-600 mt-1">{data.description}</div>}
      </div>
      <Handle type="target" position={Position.Top} id="top" className="w-3 h-3" />
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3" />
      <Handle type="source" position={Position.Right} id="yes" className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} id="no" className="w-3 h-3" />
    </div>
  );
}
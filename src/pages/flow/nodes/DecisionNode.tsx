// pages/flow/components/Nodes/DecisionNode.tsx
import { Handle, Position, type NodeProps } from "reactflow";
import "reactflow/dist/style.css";

type DecisionData = {
  question?: string | null;
  label?: string | null;
  trueLabel?: string | null;
  falseLabel?: string | null;
};

const DecisionNode: React.FC<NodeProps<DecisionData>> = ({ data = {}, selected }) => {
  const question = (data?.question ?? data?.label ?? "Decisão") || "Decisão";
  const falseLabel = (data?.falseLabel ?? "NÃO") || "NÃO";
  const trueLabel  = (data?.trueLabel  ?? "SIM")  || "SIM";

  return (
    <>
      {/* ENTRADA EM CIMA */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        style={{ background: "#1e40af", border: "3px solid white", zIndex: 20 }}
      />

      <div
        className={`relative px-6 py-4 rounded-xl shadow-lg border-2 font-medium text-sm transition-all
          ${selected ? "border-orange-500 ring-4 ring-orange-200" : "border-orange-400"}
          bg-white min-w-56 text-center overflow-visible`}  // <- deixa elementos “pra fora”
      >
        <div className="text-orange-700 font-bold text-base">{question}</div>

        {/* SAÍDA NÃO (direita) */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          style={{
            top: "50%",
            right: -7,                     // <- joga um pouco pra fora
            transform: "translateY(-50%)",
            background: "#ef4444",
            border: "3px solid white",
            width: 14,
            height: 14,
            zIndex: 30,                    // <- acima do badge
          }}
        />

        {/* SAÍDA SIM (embaixo) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            background: "#10b981",
            border: "3px solid white",
            width: 14,
            height: 14,
            zIndex: 30,
          }}
        />

        {/* Badge NÃO – sem eventos de mouse */}
        <div className="pointer-events-none absolute right-[-64px] top-1/2 -translate-y-1/2 bg-red-100 text-red-700 font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
          {falseLabel}
        </div>

        {/* Badge SIM – sem eventos de mouse */}
        <div className="pointer-events-none absolute bottom-[-34px] left-1/2 -translate-x-1/2 bg-green-100 text-green-700 font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap">
          {trueLabel}
        </div>
      </div>
    </>
  );
};

DecisionNode.displayName = "DecisionNode";
export default DecisionNode;

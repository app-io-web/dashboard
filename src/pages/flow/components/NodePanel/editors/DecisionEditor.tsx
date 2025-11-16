import type { Node } from "reactflow";
import BaseFields from "./BaseFields";

type DecisionData = {
  question?: string | null;
  trueLabel?: string | null;
  falseLabel?: string | null;
  label?: string | null;
  description?: string | null;
};

export default function DecisionEditor({
  node,
  onChange,
}: { node: Node; onChange: (n: Node) => void }) {
  const data = (node.data ?? {}) as DecisionData;

  const update = (patch: Partial<DecisionData>) =>
    onChange({ ...node, data: { ...(node.data ?? {}), ...patch } });

  return (
    <>
      {/* remove título e mantém apenas descrição */}
      <BaseFields node={node} onChange={onChange} showTitle={false} showDescription />

      <div className="space-y-3 mt-4">
        {/* campo de Pergunta substitui o título */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título
          </label>
          <input
            type="text"
            value={data.label ?? ""}
            onChange={(e) => update({ label: e.target.value, question: e.target.value })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">
              Rótulo (Não) – direita
            </label>
            <input
              type="text"
              value={data.falseLabel ?? "NÃO"}
              onChange={(e) => update({ falseLabel: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700">
              Rótulo (Sim) – embaixo
            </label>
            <input
              type="text"
              value={data.trueLabel ?? "SIM"}
              onChange={(e) => update({ trueLabel: e.target.value })}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </>
  );
}

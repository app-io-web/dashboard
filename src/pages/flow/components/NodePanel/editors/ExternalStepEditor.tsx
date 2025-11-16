// pages/flow/components/NodePanel/editors/ExternalStepEditor.tsx
import type { Node } from "reactflow";
import BaseFields from "./BaseFields";

export default function ExternalStepEditor({ node, onChange }: { node: Node; onChange: (n: Node) => void }) {
  const data = (node.data ?? {}) as any;
  const ex = data.external ?? {};
  return (
    <>
      <BaseFields node={node} onChange={onChange} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Canal</label>
          <select
            value={ex.channel ?? "webhook"}
            onChange={(e) => onChange({ ...node, data: { ...data, external: { ...ex, channel: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          >
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700">Destino</label>
          <input
            type="text"
            value={ex.target ?? ""}
            onChange={(e) => onChange({ ...node, data: { ...data, external: { ...ex, target: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
            placeholder="email@dominio.com | #canal | https://hook..."
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Template/Mensagem</label>
        <textarea
          rows={4}
          value={ex.template ?? ""}
          onChange={(e) => onChange({ ...node, data: { ...data, external: { ...ex, template: e.target.value } } })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          placeholder="Olá {{nome}}, seu pedido #{{id}} foi atualizado..."
        />
      </div>
    </>
  );
}

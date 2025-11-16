// pages/flow/components/NodePanel/editors/RequestStepEditor.tsx
import type { Node } from "reactflow";
import BaseFields from "./BaseFields";

export default function RequestStepEditor({ node, onChange }: { node: Node; onChange: (n: Node) => void }) {
  const data = (node.data ?? {}) as any;
  const req = data.req ?? {};
  return (
    <>
      <BaseFields node={node} onChange={onChange} />
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700">Método</label>
          <select
            value={req.method ?? "GET"}
            onChange={(e) => onChange({ ...node, data: { ...data, req: { ...req, method: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          >
            {["GET","POST","PUT","PATCH","DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700">URL</label>
          <input
            type="text"
            value={req.url ?? ""}
            onChange={(e) => onChange({ ...node, data: { ...data, req: { ...req, url: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-700">Timeout (ms)</label>
          <input
            type="number"
            value={req.timeoutMs ?? 10000}
            onChange={(e) => onChange({ ...node, data: { ...data, req: { ...req, timeoutMs: Number(e.target.value) } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700">Headers (JSON)</label>
          <textarea
            rows={3}
            value={req.headersJson ?? ""}
            onChange={(e) => onChange({ ...node, data: { ...data, req: { ...req, headersJson: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
            placeholder='{"Authorization":"Bearer ..."}'
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Body (JSON)</label>
        <textarea
          rows={4}
          value={req.bodyJson ?? ""}
          onChange={(e) => onChange({ ...node, data: { ...data, req: { ...req, bodyJson: e.target.value } } })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
        />
      </div>
    </>
  );
}

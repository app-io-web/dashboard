// pages/flow/components/NodePanel/editors/DatabaseStepEditor.tsx
import type { Node } from "reactflow";
import BaseFields from "./BaseFields";

export default function DatabaseStepEditor({ node, onChange }: { node: Node; onChange: (n: Node) => void }) {
  const data = (node.data ?? {}) as any;
  const db = data.db ?? {};
  return (
    <>
      <BaseFields node={node} onChange={onChange} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Operação</label>
          <select
            value={db.operation ?? "select"}
            onChange={(e) => onChange({ ...node, data: { ...data, db: { ...db, operation: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          >
            <option value="select">SELECT</option>
            <option value="insert">INSERT</option>
            <option value="update">UPDATE</option>
            <option value="delete">DELETE</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Tabela</label>
          <input
            type="text"
            value={db.table ?? ""}
            onChange={(e) => onChange({ ...node, data: { ...data, db: { ...db, table: e.target.value } } })}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">Connection</label>
        <input
          type="text"
          value={db.connection ?? ""}
          onChange={(e) => onChange({ ...node, data: { ...data, db: { ...db, connection: e.target.value } } })}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm sm:text-sm"
        />
      </div>
    </>
  );
}

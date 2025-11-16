// pages/flow/components/NodePanel/editors/NoteEditor.tsx
import type { Node } from "reactflow";

export default function NoteEditor({ node, onChange }: { node: Node; onChange: (n: Node) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Texto</label>
      <textarea
        rows={6}
        value={(node.data?.text as string) ?? ""}
        onChange={(e) => onChange({ ...node, data: { ...node.data, text: e.target.value } })}
        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  );
}

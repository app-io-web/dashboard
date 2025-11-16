import type { Node } from "reactflow";

type Props = {
  node: Node;
  onChange: (n: Node) => void;
  showTitle?: boolean;
  showDescription?: boolean;
};

export default function BaseFields({
  node,
  onChange,
  showTitle = true,
  showDescription = true,
}: Props) {
  return (
    <>
      {showTitle && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Título</label>
          <input
            type="text"
            value={(node.data?.label as string) ?? ""}
            onChange={(e) =>
              onChange({ ...node, data: { ...node.data, label: e.target.value } })
            }
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      )}

      {showDescription && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            rows={4}
            value={(node.data?.description as string) ?? ""}
            onChange={(e) =>
              onChange({ ...node, data: { ...node.data, description: e.target.value } })
            }
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      )}
    </>
  );
}

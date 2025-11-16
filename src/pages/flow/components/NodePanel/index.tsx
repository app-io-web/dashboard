// pages/flow/components/NodePanel/index.tsx
import type { Node } from "reactflow";
import StepEditor from "./editors/StepEditor";
import DecisionEditor from "./editors/DecisionEditor";
import NoteEditor from "./editors/NoteEditor";
import SubflowEditor from "./editors/SubflowEditor";

type EditorProps = { node: Node; onChange: (n: Node) => void; appId?: string | null };

type Props = {
  node: Node | null;
  onUpdate: (node: Node | null) => void;
  appId?: string | null;
};

const EDITORS: Record<string, React.ComponentType<EditorProps>> = {
  step: StepEditor,
  decision: DecisionEditor,
  note: NoteEditor,
  entry: StepEditor,
  callFlow: SubflowEditor, // ✅ novo tipo
};

export default function NodePanel({ node, onUpdate, appId }: Props) {
  if (!node) {
    return (
      <div className="w-80 bg-white border-l border-gray-300 p-6">
        <p className="text-gray-500">Selecione um nó para editar</p>
      </div>
    );
  }
  const type = (node.type as string) ?? "step";
  const Editor = EDITORS[type] ?? StepEditor;

  return (
    <div className="w-80 bg-white border-l border-gray-300 p-6 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Editar nó</h3>
      <div className="space-y-4">
        <Editor node={node} onChange={(n) => onUpdate(n)} appId={appId} />
      </div>
    </div>
  );
}

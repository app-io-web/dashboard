// pages/flow/components/NodePanel/index.tsx
import type { Node } from "reactflow";
// ✅ estamos dentro de /components/NodePanel
import StepEditor from "../components/NodePanel/editors/StepEditor";
import DecisionEditor from "../components/NodePanel/editors/DecisionEditor";
import NoteEditor from "../components/NodePanel/editors/NoteEditor";

// ✅ novos editores
import DatabaseStepEditor from "../components/NodePanel/editors/DatabaseStepEditor";
import RequestStepEditor from "../components/NodePanel/editors/RequestStepEditor";
import ExternalStepEditor from "../components/NodePanel/editors/ExternalStepEditor";

// ✅ subfluxo
import SubflowEditor from "../components/NodePanel/editors/SubflowEditor";

type EditorProps = { node: Node; onChange: (n: Node) => void; appId?: string | null };

type Props = {
  node: Node | null;
  onUpdate: (node: Node | null) => void;
  appId?: string | null;
};

const FallbackEditor = ({ node }: EditorProps) => (
  <div className="text-sm text-gray-500">
    Sem editor para: <b>{(node.type as string) ?? "desconhecido"}</b>
  </div>
);

function normalizeType(t?: string | null) {
  const s = (t || "step").toLowerCase();

  if (s === "subflow" || s === "callflow" || s === "call_flow" || s === "flow:call") {
    return "callFlow";
  }

  if (s.startsWith("step:")) return s;

  return s || "step";
}

const EDITORS: Record<string, (p: EditorProps) => JSX.Element> = {
  step: ({ node, onChange }) => <StepEditor node={node} onChange={onChange} />,
  decision: ({ node, onChange }) => <DecisionEditor node={node} onChange={onChange} />,
  note: ({ node, onChange }) => <NoteEditor node={node} onChange={onChange} />,
  entry: ({ node, onChange }) => <StepEditor node={node} onChange={onChange} />,

  "step:database": ({ node, onChange }) => (
    <DatabaseStepEditor node={node} onChange={onChange} />
  ),
  "step:request": ({ node, onChange }) => (
    <RequestStepEditor node={node} onChange={onChange} />
  ),
  "step:external": ({ node, onChange }) => (
    <ExternalStepEditor node={node} onChange={onChange} />
  ),

  callFlow: ({ node, onChange, appId }) => (
    <SubflowEditor node={node} onChange={onChange} appId={appId} />
  ),
};

export default function NodePanel({ node, onUpdate, appId }: Props) {
  if (!node) {
    return (
      <div className="w-80 bg-white border-l border-gray-300 p-6">
        <p className="text-gray-500">Selecione um nó para editar</p>
      </div>
    );
  }

  const normType = normalizeType(node.type as string | undefined);
  const Editor = EDITORS[normType] ?? FallbackEditor;

  return (
    <div className="w-80 bg-white border-l border-gray-300 p-6 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">Editar nó</h3>
      <div className="space-y-4">
        <Editor node={node} onChange={(n) => onUpdate(n)} appId={appId} />
      </div>
    </div>
  );
}

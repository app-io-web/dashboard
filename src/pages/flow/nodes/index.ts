// pages/flow/nodes/index.ts
import StepNode from "./StepNode";
import DecisionNode from "./DecisionNode";
import NoteNode from "./NoteNode";
import EntryNode from "./EntryNode";
import DatabaseStepNode from "./DatabaseStepNode";
import RequestStepNode from "./RequestStepNode";
import ExternalStepNode from "./ExternalStepNode";
import SubflowNode from "./SubflowNode"; // 👈 novo nó: subfluxo (callFlow)

// mapa para o React Flow
export const nodeTypes = {
  step: StepNode,
  decision: DecisionNode,
  note: NoteNode,
  entry: EntryNode,

  // especializados
  "step:database": DatabaseStepNode,
  "step:request": RequestStepNode,
  "step:external": ExternalStepNode,

  // novos
  callFlow: SubflowNode, // 👈 suporte ao nó de subfluxo
} as const;

export type NodeTypeKey = keyof typeof nodeTypes;

// pages/flow/nodes/types.ts
import type { Node } from "reactflow";

export type CommonData = {
  label?: string | null;
  description?: string | null;
};

export type StepData = CommonData & {
  icon?: string | null;
  color?: string | null;
};

export type DecisionData = CommonData & {
  question?: string | null;
  trueLabel?: string | null;   // saida direita
  falseLabel?: string | null;  // saida baixo
};

export type NoteData = {
  text?: string;
};

export type EntryData = CommonData;

export type FlowNodeData = StepData | DecisionData | NoteData | EntryData;

export type FlowNode = Node<FlowNodeData>;

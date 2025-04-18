// API Flow Editor Type Definitions
export type PinType = "execution" | "input" | "output";
export type PinDataType = "string" | "number" | "boolean" | "object" | "array";

export interface Pin {
  id: string;
  type: PinType;
  dataType?: PinDataType;
  label: string;
  acceptsMultipleConnections?: boolean;
}

export interface ApiNodeData {
  label: string;
  endpoint: string;
  description?: string;
  inputs: Pin[];
  outputs: Pin[];
  executionInputs: Pin[];
  executionOutputs: Pin[];
}

// For integration with real API components
export interface ApiAppNodeData extends ApiNodeData {
  componentId: string; // ID of the actual API component
  actionId?: string; // ID of the specific action to execute
  appId: string; // ID of the app this component belongs to
  parameterMappings?: Record<string, string>; // Maps parameter IDs to pin IDs
  resultMappings?: Record<string, string>; // Maps result fields to output pin IDs
}

export interface ApiNode {
  id: string;
  type: "apiNode";
  position: { x: number; y: number };
  data: ApiNodeData;
}

// We need a separate type for ApiAppNode since the 'type' property has a different string literal
export type ApiNodeType = "apiNode" | "apiAppNode";

export interface ApiAppNode {
  id: string;
  type: "apiAppNode";
  position: { x: number; y: number };
  data: ApiAppNodeData;
}

export interface PinConnectionData {
  sourceNodeId: string;
  sourcePinId: string;
  targetNodeId: string;
  targetPinId: string;
  isExecution?: boolean;
}

// Value type for workflow variables
export type WorkflowVariableValue = string | number | boolean | object | null;

// Workflow execution context that maintains state between node executions
export interface WorkflowExecutionContext {
  variables: Record<string, WorkflowVariableValue>;
  results: Record<string, unknown>;
  currentNodeId?: string;
  error?: string;
  isExecuting: boolean;
  addVariable: (name: string, value: WorkflowVariableValue) => void;
  getVariable: (name: string) => WorkflowVariableValue;
  setResult: (nodeId: string, result: unknown) => void;
  getResult: (nodeId: string) => unknown;
}

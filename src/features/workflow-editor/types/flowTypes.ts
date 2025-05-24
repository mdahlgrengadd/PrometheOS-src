// API Flow Editor Type Definitions
import { Edge } from '@xyflow/react';

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
  successPinId?: string; // ID of the success execution pin
  errorPinId?: string; // ID of the error execution pin
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

/**
 * Context for workflow execution, used to store variables and
 * pass data between nodes during execution.
 */
export interface WorkflowExecutionContext {
  /** Variables keyed by ID, used to store values during execution */
  variables: Record<string, WorkflowVariableValue>;

  /** Store results for each node (by node ID) */
  results: Record<string, unknown>;

  /** ID of the currently executing node */
  currentNodeId: string;

  /** All edges in the workflow, useful for finding connections */
  allEdges?: Edge[];

  /** Add a variable to the execution context */
  addVariable(id: string, value: WorkflowVariableValue): void;

  /** Add a node-scoped variable to prevent data leakage between nodes */
  addNodeScopedVariable(
    nodeId: string,
    pinId: string,
    value: WorkflowVariableValue
  ): void;

  /** Get a variable from the execution context */
  getVariable(id: string): WorkflowVariableValue | undefined;

  /** Get a node-scoped variable */
  getNodeScopedVariable(
    nodeId: string,
    pinId: string
  ): WorkflowVariableValue | undefined;

  /** Set a result for a node */
  setResult(nodeId: string, result: unknown): void;

  /** Get a result for a node */
  getResult(nodeId: string): unknown;
}

// For primitive node types that provide literal values
export interface StringPrimitiveNodeData {
  label: string;
  value: string;
  outputs: Pin[];
}

export interface NumberPrimitiveNodeData {
  label: string;
  value: number;
  outputs: Pin[];
}

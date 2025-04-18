// API Flow Editor Type Definitions
export type PinType = 'execution' | 'input' | 'output';
export type PinDataType = 'string' | 'number' | 'boolean' | 'object' | 'array';

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

export interface ApiNode {
  id: string;
  type: 'apiNode';
  position: { x: number; y: number };
  data: ApiNodeData;
}

export interface PinConnectionData {
  sourceNodeId: string;
  sourcePinId: string;
  targetNodeId: string;
  targetPinId: string;
  isExecution?: boolean;
}

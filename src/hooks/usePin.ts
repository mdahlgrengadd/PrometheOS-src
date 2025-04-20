import { Pin, PinDataType, PinType } from '../features/workflow-editor/types/flowTypes';

// Counter to ensure unique IDs
let pinCounter = 0;

/**
 * Factory hook for creating data pins (input or output)
 */
export function useDataPin(
  type: "input" | "output",
  dataType: PinDataType,
  label: string
): Pin {
  const timestamp = Date.now();
  const id = `${type}-${timestamp}-${++pinCounter}`;

  return {
    id,
    type: type as PinType,
    dataType,
    label,
    acceptsMultipleConnections: type === "input" ? true : false,
  };
}

/**
 * Factory hook for creating execution pins
 */
export function useExecPin(label: string, direction: "in" | "out"): Pin {
  const timestamp = Date.now();
  const id = `exec-${
    direction === "in" ? "in" : "out"
  }-${timestamp}-${++pinCounter}`;

  return {
    id,
    type: "execution",
    label,
    acceptsMultipleConnections: true,
  };
}

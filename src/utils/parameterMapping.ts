import { ApiAppNodeData } from "../plugins/apps/blueprints/workflow-editor/types/flowTypes";

/**
 * Extended parameter mapping interface for value actions
 */
interface SetValueMapping {
  type: "setValue";
  value: unknown | null;
}

/**
 * Extended parameter mapping interface for fromOutput actions
 */
interface FromOutputMapping {
  type: "fromOutput";
  sourceNodeId: string | null;
  outputId: string | null;
}

// Union type for all parameter mapping types
type ParameterMapping = SetValueMapping | FromOutputMapping | string;

/**
 * Maps a setValue action to a node
 * Used when connecting primitive/value nodes to API app nodes
 */
export function mapSetValueAction(
  nodeData: ApiAppNodeData,
  targetHandle: string
): ApiAppNodeData {
  // Create a clone of the node data to avoid mutating the original
  const updatedData = { ...nodeData };

  // Extract the parameter name from the target handle (assumes format: 'input-timestamp-paramName')
  const paramNameMatch = targetHandle.match(/input-\d+-(.+)/);
  if (paramNameMatch && paramNameMatch[1]) {
    const paramName = paramNameMatch[1];

    // Create extended parameterMappings with the correct type
    const extendedMappings: Record<string, ParameterMapping> = {
      ...(updatedData.parameterMappings || {}),
      [paramName]: {
        type: "setValue",
        value: null, // Will be updated during execution
      },
    };

    // Update node data with the extended mappings - use type casting to match expected API format
    updatedData.parameterMappings = extendedMappings as Record<string, string>;
  }

  return updatedData;
}

/**
 * Maps a general/output-to-input action
 * Used when connecting API node outputs to other API node inputs
 */
export function mapGeneralAction(
  nodeData: ApiAppNodeData,
  targetHandle: string
): ApiAppNodeData {
  // Create a clone of the node data to avoid mutating the original
  const updatedData = { ...nodeData };

  // Extract the parameter name from the target handle (assumes format: 'input-timestamp-paramName')
  const paramNameMatch = targetHandle.match(/input-\d+-(.+)/);
  if (paramNameMatch && paramNameMatch[1]) {
    const paramName = paramNameMatch[1];

    // Create extended parameterMappings with the correct type
    const extendedMappings: Record<string, ParameterMapping> = {
      ...(updatedData.parameterMappings || {}),
      [paramName]: {
        type: "fromOutput",
        sourceNodeId: null, // Will be updated during connection
        outputId: null, // Will be updated during connection
      },
    };

    // Update node data with the extended mappings - use type casting to match expected API format
    updatedData.parameterMappings = extendedMappings as Record<string, string>;
  }

  return updatedData;
}

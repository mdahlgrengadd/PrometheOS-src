import { Connection, Edge, getOutgoers, Node } from "@xyflow/react";

import { Pin } from "../plugins/apps/api-flow-editor/workflow-editor/types/flowTypes";

/**
 * Validates if a connection is valid based on pin types, data types, and cycle detection
 */
export function validateConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; reason?: string } {
  // Prevent connections within the same node
  if (connection.source === connection.target) {
    return {
      valid: false,
      reason: "Cannot connect pins within the same node",
    };
  }

  // Check if source and target are both execution or both data
  const sourceIsExecution = connection.sourceHandle?.includes("exec") || false;
  const targetIsExecution = connection.targetHandle?.includes("exec") || false;

  if (sourceIsExecution !== targetIsExecution) {
    return {
      valid: false,
      reason: "Cannot connect execution pins to data pins",
    };
  }

  // Find the source and target nodes
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) {
    return {
      valid: false,
      reason: "Source or target node not found",
    };
  }

  // For data connections, check data type compatibility
  if (!sourceIsExecution) {
    const sourceData = sourceNode.data as { outputs?: Pin[] };
    const targetData = targetNode.data as { inputs?: Pin[] };

    const sourcePin = sourceData.outputs?.find(
      (pin) => pin.id === connection.sourceHandle
    );

    const targetPin = targetData.inputs?.find(
      (pin) => pin.id === connection.targetHandle
    );

    if (sourcePin && targetPin && sourcePin.dataType !== targetPin.dataType) {
      return {
        valid: false,
        reason: `Data type mismatch: ${sourcePin.dataType} cannot connect to ${targetPin.dataType}`,
      };
    }
  }

  // Check for cycles using DFS
  const hasCycle = (node: Node, visited = new Set<string>()): boolean => {
    if (visited.has(node.id)) return false;

    visited.add(node.id);

    for (const outgoer of getOutgoers(node, nodes, edges)) {
      if (outgoer.id === connection.source) return true;
      if (hasCycle(outgoer, visited)) return true;
    }

    return false;
  };

  if (hasCycle(targetNode)) {
    return {
      valid: false,
      reason: "Connection would create a cycle",
    };
  }

  return { valid: true };
}

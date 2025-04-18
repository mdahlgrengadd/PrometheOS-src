import { Edge, Node } from '@xyflow/react';

import {
    ApiAppNodeData, NumberPrimitiveNodeData, Pin, StringPrimitiveNodeData, WorkflowExecutionContext
} from '../types/flowTypes';
import { ApiComponentService } from './ApiComponentService';

interface ExecutionOptions {
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: unknown) => void;
  onWorkflowComplete?: () => void;
  onError?: (error: Error, nodeId?: string) => void;
}

/**
 * Service for executing workflow graphs
 */
export class WorkflowExecutionService {
  private static instance: WorkflowExecutionService;
  private apiService: ApiComponentService;

  private constructor() {
    this.apiService = ApiComponentService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WorkflowExecutionService {
    if (!WorkflowExecutionService.instance) {
      WorkflowExecutionService.instance = new WorkflowExecutionService();
    }
    return WorkflowExecutionService.instance;
  }

  /**
   * Execute a workflow starting from a specific node
   */
  public async executeWorkflow(
    startNodeId: string,
    nodes: Node[],
    edges: Edge[],
    context: WorkflowExecutionContext,
    options: ExecutionOptions = {}
  ): Promise<void> {
    // Find the start node
    const startNode = nodes.find((node) => node.id === startNodeId);
    if (!startNode) {
      throw new Error(`Start node with ID ${startNodeId} not found`);
    }

    try {
      // Start execution from the first node
      await this.executeNode(startNode, nodes, edges, context, options);

      // Workflow completed successfully
      options.onWorkflowComplete?.();
    } catch (error) {
      // Handle execution error
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err);
      throw err;
    }
  }

  /**
   * Execute a single node and follow execution flow
   */
  private async executeNode(
    node: Node,
    allNodes: Node[],
    allEdges: Edge[],
    context: WorkflowExecutionContext,
    options: ExecutionOptions
  ): Promise<void> {
    // Update context with current node
    context.currentNodeId = node.id;

    // Notify node started
    options.onNodeStart?.(node.id);

    try {
      // Process data connections to populate input values before execution
      this.processDataConnections(node, allNodes, allEdges, context);

      // Handle different node types
      if (node.type === "apiAppNode") {
        // Execute API App Node
        await this.executeApiAppNode(node, context);
      } else if (node.type === "stringPrimitive") {
        // Execute String Primitive Node
        await this.executeStringPrimitiveNode(node, context);
      } else if (node.type === "numberPrimitive") {
        // Execute Number Primitive Node
        await this.executeNumberPrimitiveNode(node, context);
      } else if (node.type === "beginWorkflow") {
        // Execute BeginWorkflow Node
        await this.executeBeginWorkflowNode(node, context);
      } else {
        // Other node types - just log for now
        console.log(
          `Executing node: ${node.id} (${node.type || "unknown type"})`
        );
        context.setResult(node.id, { message: `Node ${node.id} executed` });
      }

      // Notify node completed
      options.onNodeComplete?.(node.id, context.getResult(node.id));

      // Find outgoing execution edges
      const executionEdges = allEdges.filter(
        (edge) => edge.source === node.id && edge.sourceHandle?.includes("exec")
      );

      // Follow execution flow (sequentially to maintain order)
      for (const edge of executionEdges) {
        const nextNode = allNodes.find((n) => n.id === edge.target);
        if (nextNode) {
          await this.executeNode(
            nextNode,
            allNodes,
            allEdges,
            context,
            options
          );
        }
      }
    } catch (error) {
      // Handle error during node execution
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err, node.id);
      throw err;
    }
  }

  /**
   * Process data connections to populate input values
   * This will find all incoming data connections to the node and transfer values from source nodes
   */
  private processDataConnections(
    node: Node,
    allNodes: Node[],
    allEdges: Edge[],
    context: WorkflowExecutionContext
  ): void {
    // Find all incoming data edges (non-execution edges)
    const incomingDataEdges = allEdges.filter(
      (edge) =>
        edge.target === node.id &&
        !edge.targetHandle?.includes("exec") &&
        !edge.sourceHandle?.includes("exec")
    );

    // For each incoming data edge, get the value from the source node's output pin
    // and store it in the context for the target node's input pin
    for (const edge of incomingDataEdges) {
      const sourceNode = allNodes.find((n) => n.id === edge.source);

      if (sourceNode) {
        // Get source output pin ID
        const sourcePinId = edge.sourceHandle;
        // Get target input pin ID
        const targetPinId = edge.targetHandle;

        if (sourcePinId && targetPinId) {
          // Try to get the value from the context (should have been set when source node was executed)
          const value = context.getVariable(sourcePinId);

          if (value !== undefined) {
            console.log(
              `Transferring value from ${sourcePinId} to ${targetPinId}:`,
              value
            );
            // Store the value for the target pin
            context.addVariable(targetPinId, value);
          } else {
            console.warn(
              `No value found for source pin ${sourcePinId} from node ${sourceNode.id}`
            );

            // If this is a primitive node, we need to execute it to get its value
            if (
              sourceNode.type === "stringPrimitive" ||
              sourceNode.type === "numberPrimitive"
            ) {
              if (sourceNode.type === "stringPrimitive") {
                this.executeStringPrimitiveNode(sourceNode, context);
              } else {
                this.executeNumberPrimitiveNode(sourceNode, context);
              }

              // Now try again to get the value
              const valueAfterExecution = context.getVariable(sourcePinId);
              if (valueAfterExecution !== undefined) {
                console.log(
                  `Now transferring value after execution from ${sourcePinId} to ${targetPinId}:`,
                  valueAfterExecution
                );
                context.addVariable(targetPinId, valueAfterExecution);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Execute an API App Node by calling the actual API action
   */
  private async executeApiAppNode(
    node: Node,
    context: WorkflowExecutionContext
  ): Promise<void> {
    // Cast node.data to ApiAppNodeData with type assertion after checking type
    if (node.type !== "apiAppNode" || !node.data) {
      throw new Error(`Node ${node.id} is not a valid API App Node`);
    }

    const nodeData = node.data as unknown as ApiAppNodeData;

    if (!nodeData.componentId || !nodeData.actionId) {
      throw new Error(
        `Node ${node.id} is not properly configured with componentId and actionId`
      );
    }

    // Collect input parameters
    const parameters: Record<string, unknown> = {};

    // Map input pins to parameters based on mappings
    if (nodeData.parameterMappings && nodeData.inputs) {
      for (const input of nodeData.inputs) {
        const paramName = nodeData.parameterMappings[input.id];
        if (paramName) {
          // Try to get value from context variables - named by pin ID for simplicity
          const inputValue = context.getVariable(input.id);

          // If we got a value, use it
          if (inputValue !== undefined) {
            parameters[paramName] = inputValue;
            console.log(
              `Found value for parameter '${paramName}':`,
              inputValue
            );
          } else {
            console.warn(
              `No value found for parameter '${paramName}' (pin ${input.id})`
            );
          }
        }
      }
    }

    console.log(
      `Executing API action: ${nodeData.componentId}.${nodeData.actionId} with params:`,
      parameters
    );

    // Execute the API action
    const result = await this.apiService.executeAction(
      nodeData.componentId,
      nodeData.actionId,
      parameters
    );

    // Store the result in the context
    context.setResult(node.id, result);

    // Map result to output variables if mappings exist
    if (nodeData.resultMappings && result.data) {
      for (const [resultKey, pinId] of Object.entries(
        nodeData.resultMappings
      )) {
        // Get the value from the result data
        const value = this.getNestedValue(result.data, resultKey);
        if (value !== undefined) {
          // Store in context with the pin ID as the variable name
          // Cast to WorkflowVariableValue to satisfy TypeScript
          context.addVariable(
            pinId,
            value as string | number | boolean | object | null
          );
        }
      }
    }

    // If action failed, throw an error to stop execution
    if (!result.success) {
      throw new Error(
        result.error || `Action execution failed for node ${node.id}`
      );
    }
  }

  /**
   * Execute a String Primitive Node by storing its value and making it available for connections
   */
  private async executeStringPrimitiveNode(
    node: Node,
    context: WorkflowExecutionContext
  ): Promise<void> {
    if (node.type !== "stringPrimitive" || !node.data) {
      throw new Error(`Node ${node.id} is not a valid String Primitive Node`);
    }

    const nodeData = node.data as unknown as StringPrimitiveNodeData;
    const value = nodeData.value;

    console.log(
      `Executing String Primitive Node: ${node.id} with value:`,
      value
    );

    // Store the result in the context
    context.setResult(node.id, {
      success: true,
      data: { value: value },
    });

    // For each output pin, make the string value available as a variable
    if (nodeData.outputs && nodeData.outputs.length > 0) {
      for (const output of nodeData.outputs) {
        context.addVariable(output.id, value);
      }
    }
  }

  /**
   * Execute a Number Primitive Node by storing its value and making it available for connections
   */
  private async executeNumberPrimitiveNode(
    node: Node,
    context: WorkflowExecutionContext
  ): Promise<void> {
    if (node.type !== "numberPrimitive" || !node.data) {
      throw new Error(`Node ${node.id} is not a valid Number Primitive Node`);
    }

    const nodeData = node.data as unknown as NumberPrimitiveNodeData;
    const value = nodeData.value;

    console.log(
      `Executing Number Primitive Node: ${node.id} with value:`,
      value
    );

    // Store the result in the context
    context.setResult(node.id, {
      success: true,
      data: { value: value },
    });

    // For each output pin, make the number value available as a variable
    if (nodeData.outputs && nodeData.outputs.length > 0) {
      for (const output of nodeData.outputs) {
        context.addVariable(output.id, value);
      }
    }
  }

  /**
   * Execute a BeginWorkflow Node - this is the starting point of the workflow
   */
  private async executeBeginWorkflowNode(
    node: Node,
    context: WorkflowExecutionContext
  ): Promise<void> {
    // BeginWorkflow nodes don't have any special execution logic
    // They're just a starting point for the workflow
    console.log(`Executing BeginWorkflow node ${node.id}`);

    // Set an empty result so that connections work properly
    if (
      node.data &&
      node.data.executionOutputs &&
      Array.isArray(node.data.executionOutputs)
    ) {
      const outputs = node.data.executionOutputs as Pin[];
      for (const output of outputs) {
        context.addVariable(output.id, null);
      }
    }
  }

  /**
   * Get a value from a nested object using a dot-notation path
   */
  private getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object" || !path) {
      return undefined;
    }

    const parts = path.split(".");
    let current = obj as Record<string, unknown>;

    for (const part of parts) {
      if (
        current === null ||
        current === undefined ||
        typeof current !== "object"
      ) {
        return undefined;
      }
      current = current[part] as Record<string, unknown>;
    }

    return current;
  }
}

import { Edge, Node } from '@xyflow/react';

import { ApiAppNodeData, WorkflowExecutionContext } from '../types/flowTypes';
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
      // Handle different node types
      if (node.type === "apiAppNode") {
        // Execute API App Node
        await this.executeApiAppNode(node, context);
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
          parameters[paramName] = context.getVariable(input.id);
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

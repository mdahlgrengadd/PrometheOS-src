import { Edge, Node } from '@xyflow/react';

import { DataTypeConversionNodeData } from '../components/DataTypeConversionNode';
import {
    ApiAppNodeData, ApiNodeData, NumberPrimitiveNodeData, Pin, StringPrimitiveNodeData,
    WorkflowExecutionContext, WorkflowVariableValue
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

    // Store all edges in context for access by nodes
    context.allEdges = allEdges;

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
      } else if (node.type === "dataTypeConversion") {
        await this.executeDataTypeConversionNode(node, context);
      } else {
        // Other node types - just log for now
        console.log(
          `Executing node: ${node.id} (${node.type || "unknown type"})`
        );
        context.setResult(node.id, { message: `Node ${node.id} executed` });
      }

      // Notify node completed
      options.onNodeComplete?.(node.id, context.getResult(node.id));

      // MODIFIED SECTION: Find outgoing execution edges
      // For API App nodes with success/fail pins, only follow valid execution paths
      if (node.type === "apiAppNode" && node.data) {
        const nodeData = node.data as unknown as ApiAppNodeData;

        // Only proceed with conditional execution if the node has success/error pins
        if (nodeData.successPinId && nodeData.errorPinId) {
          const result = context.getResult(node.id);
          // Use type assertion to check for success property
          const isSuccess =
            result &&
            typeof result === "object" &&
            "success" in result &&
            (result as { success: boolean }).success === true;

          // Get the relevant pin ID based on execution result
          const activePinId = isSuccess
            ? nodeData.successPinId
            : nodeData.errorPinId;

          // Find only the edges that start from the active pin
          const activeEdges = allEdges.filter(
            (edge) =>
              edge.source === node.id && edge.sourceHandle === activePinId
          );

          // Follow execution flow only for the active edges
          for (const edge of activeEdges) {
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

          // Skip the normal execution flow handling below
          return;
        }
      }

      // Default behavior for other nodes or API nodes without conditional pins
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
    console.log(
      `Processing data connections for node ${node.id} (${node.type})`
    );

    // Debug log before processing
    this.debugLogContext(
      context,
      node.id,
      `Before processing data connections`
    );

    // Find all incoming data edges (non-execution edges)
    const incomingDataEdges = allEdges.filter(
      (edge) =>
        edge.target === node.id &&
        !edge.targetHandle?.includes("exec") &&
        !edge.sourceHandle?.includes("exec")
    );

    console.log(
      `Found ${incomingDataEdges.length} incoming data edges for node ${node.id}`
    );

    // Log details about each edge
    incomingDataEdges.forEach((edge, index) => {
      console.log(
        `Edge ${index + 1}: source=${edge.source} (${
          edge.sourceHandle
        }) → target=${edge.target} (${edge.targetHandle})`
      );
    });

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
          console.log(
            `Processing connection: ${sourceNode.id}.${sourcePinId} → ${node.id}.${targetPinId}`
          );

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

            // Try to find the value in the results directly
            const sourceNodeResult = context.getResult(sourceNode.id);
            console.log(
              `Checking source node ${sourceNode.id} result:`,
              sourceNodeResult
            );

            if (sourceNodeResult && typeof sourceNodeResult === "object") {
              // Found data in the source node result
              console.log(
                `Source node ${sourceNode.id} has result data:`,
                sourceNodeResult
              );

              // Try to extract a useful value from the result
              let extractedValue: WorkflowVariableValue | undefined = undefined;

              // Check if the result has data property (common pattern)
              if (
                "data" in sourceNodeResult &&
                sourceNodeResult.data !== undefined
              ) {
                if (
                  typeof sourceNodeResult.data === "object" &&
                  "value" in sourceNodeResult.data
                ) {
                  // Most common pattern: result.data.value
                  extractedValue = sourceNodeResult.data
                    .value as WorkflowVariableValue;
                  console.log(
                    `Using value from result.data.value:`,
                    extractedValue
                  );
                } else {
                  // Just use the data property directly
                  extractedValue =
                    sourceNodeResult.data as WorkflowVariableValue;
                  console.log(
                    `Using entire result.data as value:`,
                    extractedValue
                  );
                }
              } else {
                // Last resort: use the entire result
                extractedValue = sourceNodeResult as WorkflowVariableValue;
                console.log(`Using entire result as value:`, extractedValue);
              }

              if (extractedValue !== undefined) {
                context.addVariable(targetPinId, extractedValue);
                continue;
              }
            }

            // If the node hasn't been executed yet, execute it now to get its value
            if (
              sourceNode.type === "stringPrimitive" ||
              sourceNode.type === "numberPrimitive"
            ) {
              console.log(
                `Executing primitive node ${sourceNode.id} to get value`
              );
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
            } else if (sourceNode.type === "dataTypeConversion") {
              // For data type conversion nodes, execute them
              console.log(
                `Executing data conversion node ${sourceNode.id} to get value`
              );
              this.executeDataTypeConversionNode(sourceNode, context);

              // Now try again to get the value
              const valueAfterExecution = context.getVariable(sourcePinId);
              if (valueAfterExecution !== undefined) {
                console.log(
                  `Now transferring converted value from ${sourcePinId} to ${targetPinId}:`,
                  valueAfterExecution
                );
                context.addVariable(targetPinId, valueAfterExecution);
              }
            }
          }
        }
      }
    }

    // Debug log after processing
    this.debugLogContext(context, node.id, `After processing data connections`);
  }

  /**
   * Debug helper to log the current state of variables and pins
   */
  private debugLogContext(
    context: WorkflowExecutionContext,
    nodeId: string,
    message: string
  ): void {
    console.log(`[DEBUG ${nodeId}] ${message}`);
    console.log(`Variables:`, context.variables);
    console.log(`Results:`, context.results);
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

    // Debug log before execution
    this.debugLogContext(
      context,
      node.id,
      `Before executing ${nodeData.componentId}.${nodeData.actionId}`
    );

    // Collect input parameters
    const parameters: Record<string, unknown> = {};

    // Check if this is a setValue action
    const isSetValueAction = nodeData.actionId.includes("setValue");

    // Map input pins to parameters based on mappings
    if (nodeData.parameterMappings && nodeData.inputs) {
      for (const input of nodeData.inputs) {
        const paramName = nodeData.parameterMappings[input.id];
        if (paramName) {
          // Try to get value from context variables - named by pin ID for simplicity
          const inputValue = context.getVariable(input.id);

          // If we got a value, use it
          if (inputValue !== undefined) {
            // Handle setValue action specially - ensure value is a string
            if (isSetValueAction && paramName === "value") {
              // For setValue action, we need to ensure the value is a string
              if (typeof inputValue === "object") {
                // Try to serialize the object to a string
                try {
                  parameters[paramName] = JSON.stringify(inputValue);
                } catch (e) {
                  parameters[paramName] = String(inputValue);
                }
              } else {
                parameters[paramName] = String(inputValue);
              }
              console.log(
                `For setValue action, set '${paramName}' parameter to string:`,
                parameters[paramName]
              );
            } else {
              parameters[paramName] = inputValue;
              console.log(
                `Found value for parameter '${paramName}':`,
                inputValue
              );
            }
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

    // For setValue action, check if 'value' parameter exists and is a string
    if (
      isSetValueAction &&
      (!parameters.value || typeof parameters.value !== "string")
    ) {
      console.error(
        `setValue requires a 'value' parameter of type string. Got:`,
        parameters.value
      );
      // Force convert to string as a last resort
      if (parameters.value !== undefined) {
        parameters.value = String(parameters.value);
      } else {
        parameters.value = "";
      }
    }

    // Execute the API action
    const result = await this.apiService.executeAction(
      nodeData.componentId,
      nodeData.actionId,
      parameters
    );

    // Store the result in the context
    context.setResult(node.id, result);

    // Always set the main result to the 'result' output pin if it exists
    if (nodeData.outputs && nodeData.outputs.length > 0) {
      // Find the result output pin - typically named with 'result' or is the first output pin
      const resultPin =
        nodeData.outputs.find((pin) =>
          pin.label.toLowerCase().includes("result")
        ) || nodeData.outputs[0];

      if (resultPin) {
        console.log(
          `Setting API result to output pin ${resultPin.id}:`,
          result
        );
        context.addVariable(resultPin.id, result);
      }
    }

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
          console.log(
            `Mapped result.data.${resultKey} to pin ${pinId}:`,
            value
          );
        }
      }
    }

    // Even if there are no explicit mappings, make the entire result available
    // through all output pins to ensure data flows to the next nodes
    if (nodeData.outputs && nodeData.outputs.length > 0) {
      for (const output of nodeData.outputs) {
        // Only set if not already set through mappings
        if (context.getVariable(output.id) === undefined) {
          if (result.data) {
            // For pins with a specific data type, try to provide appropriate data
            if (output.dataType === "object") {
              context.addVariable(output.id, result.data);
              console.log(
                `Set output for pin ${output.id} to result.data:`,
                result.data
              );
            } else if (output.dataType === "string") {
              // For string pins, stringify the result
              try {
                const stringValue =
                  typeof result.data === "string"
                    ? result.data
                    : JSON.stringify(result.data);
                context.addVariable(output.id, stringValue);
                console.log(
                  `Set string output for pin ${output.id} to:`,
                  stringValue
                );
              } catch (e) {
                context.addVariable(output.id, String(result.data));
              }
            } else if (output.dataType === "boolean") {
              // For boolean pins, use success flag
              context.addVariable(output.id, !!result.success);
            } else {
              // For other types, pass the whole result
              context.addVariable(output.id, result);
            }
          } else {
            // If no data, at least provide the success status
            if (output.dataType === "boolean") {
              context.addVariable(output.id, !!result.success);
            } else {
              // For other types without data, provide the whole result
              context.addVariable(output.id, result);
            }
          }
        }
      }
    }

    // Debug log after execution
    this.debugLogContext(
      context,
      node.id,
      `After executing ${nodeData.componentId}.${nodeData.actionId}`
    );

    // MODIFIED SECTION: Handle branching based on API result
    // Instead of throwing an error, use success/error execution pins for branching

    // For backward compatibility, check if node has success/error pins
    if (nodeData.successPinId && nodeData.errorPinId) {
      // Find all outgoing execution edges from this node
      const executionEdges =
        context.allEdges?.filter(
          (edge) =>
            edge.source === node.id && edge.sourceHandle?.includes("exec")
        ) || [];

      // Find edges connected to success and error pins
      const successEdges = executionEdges.filter(
        (edge) => edge.sourceHandle === nodeData.successPinId
      );

      const errorEdges = executionEdges.filter(
        (edge) => edge.sourceHandle === nodeData.errorPinId
      );

      // Add success/error information to execution context for the node
      context.addVariable(nodeData.successPinId, result.success ? true : null);
      context.addVariable(nodeData.errorPinId, !result.success ? true : null);

      // Don't throw error - the execution will continue via appropriate pins
      // The follow-up execution will be handled by the executeNode method
    } else if (!result.success) {
      // For backward compatibility: if no success/error pins are defined, throw error as before
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
   * Execute a DataTypeConversion Node, converting from one data type to another
   */
  private async executeDataTypeConversionNode(
    node: Node,
    context: WorkflowExecutionContext
  ): Promise<void> {
    if (node.type !== "dataTypeConversion" || !node.data) {
      throw new Error(`Node ${node.id} is not a valid DataTypeConversion Node`);
    }

    const nodeData = node.data as unknown as DataTypeConversionNodeData;
    console.log(
      `Executing DataTypeConversion Node: ${node.id} converting from ${nodeData.inputDataType} to ${nodeData.outputDataType}`
    );

    // Debug log before execution
    this.debugLogContext(
      context,
      node.id,
      `Before conversion from ${nodeData.inputDataType} to ${nodeData.outputDataType}`
    );

    // Find the input pin
    const inputPin = nodeData.inputs[0];
    // Find the output pin
    const outputPin = nodeData.outputs[0];

    if (!inputPin) {
      console.error("No input pin found on DataTypeConversion node");
      return;
    }

    if (!outputPin) {
      console.error("No output pin found on DataTypeConversion node");
      return;
    }

    console.log(
      `Conversion node input pin ID: ${inputPin.id}, output pin ID: ${outputPin.id}`
    );

    // Try various methods to get input value
    const inputValue: WorkflowVariableValue | undefined = this.findValueForPin(
      inputPin.id,
      context
    );

    if (inputValue === undefined) {
      console.error(
        `No input value found for pin ${inputPin.id} after searching everywhere`
      );
      // Set a default empty value to prevent further errors
      if (nodeData.outputDataType === "string") {
        console.log(`Setting default empty string for ${outputPin.id}`);
        context.addVariable(outputPin.id, "");
        context.setResult(node.id, { success: true, data: { value: "" } });
      } else if (nodeData.outputDataType === "number") {
        console.log(`Setting default 0 for ${outputPin.id}`);
        context.addVariable(outputPin.id, 0);
        context.setResult(node.id, { success: true, data: { value: 0 } });
      } else if (nodeData.outputDataType === "boolean") {
        console.log(`Setting default false for ${outputPin.id}`);
        context.addVariable(outputPin.id, false);
        context.setResult(node.id, { success: true, data: { value: false } });
      } else {
        console.log(`Setting default empty object for ${outputPin.id}`);
        context.addVariable(outputPin.id, {});
        context.setResult(node.id, { success: true, data: { value: {} } });
      }
      return;
    }

    console.log(`DataTypeConversion input value:`, inputValue);
    let convertedValue: WorkflowVariableValue;

    // Perform the conversion based on output type
    if (nodeData.outputDataType === "string") {
      // Convert any input to string
      if (typeof inputValue === "object") {
        // For objects, use JSON.stringify without extra formatting
        try {
          convertedValue = JSON.stringify(inputValue);
        } catch (e) {
          console.error(`Error stringifying object:`, e);
          convertedValue = String(inputValue);
        }
      } else {
        // For primitives, convert directly to string
        convertedValue = String(inputValue);
      }
      console.log(`Converted to string:`, convertedValue);
    } else if (nodeData.outputDataType === "number") {
      // Try to convert to number
      convertedValue = Number(inputValue);
      if (isNaN(convertedValue as number)) {
        console.error(`Cannot convert value to number: ${inputValue}`);
        convertedValue = 0; // Default to 0 to prevent further errors
      }
    } else if (nodeData.outputDataType === "boolean") {
      // Convert to boolean
      convertedValue = Boolean(inputValue);
    } else {
      // For object or array types, parsing might be needed
      try {
        if (typeof inputValue === "string") {
          convertedValue = JSON.parse(inputValue);
        } else {
          convertedValue = inputValue; // Keep as is
        }
      } catch (error) {
        console.error(
          `Error converting to ${nodeData.outputDataType}: ${error}`
        );
        convertedValue = inputValue; // Keep as is to prevent further errors
      }
    }

    // Store the result in the context with a properly structured result object
    // to match what other nodes like primitives produce
    context.setResult(node.id, {
      success: true,
      data: { value: convertedValue },
    });

    // Make the converted value available as a variable for the output pin
    context.addVariable(outputPin.id, convertedValue);
    console.log(`Set output variable ${outputPin.id} to:`, convertedValue);

    // Debug log after execution
    this.debugLogContext(
      context,
      node.id,
      `After conversion from ${nodeData.inputDataType} to ${nodeData.outputDataType}`
    );
  }

  /**
   * Utility method to find a value for a pin ID using various search methods
   */
  private findValueForPin(
    pinId: string,
    context: WorkflowExecutionContext
  ): WorkflowVariableValue | undefined {
    // First, try to get directly from variables
    const value = context.getVariable(pinId);
    if (value !== undefined) {
      return value;
    }

    console.log(
      `No direct value found for pin ${pinId}, searching in all variables...`
    );

    // Check all variables for any matching data
    console.log(`All available variables:`, context.variables);

    // Look for any matching value in the variables
    for (const [varId, varValue] of Object.entries(context.variables)) {
      console.log(`Checking variable ${varId}:`, varValue);

      // Try to match the pin by ID suffix or other pattern
      if (varId.includes(pinId) || pinId.includes(varId)) {
        console.log(`Found potential match in variable ${varId}`);
        return varValue;
      }
    }

    console.log(`No value found in variables, checking node results...`);

    // If not found, check results from all nodes
    for (const [nodeId, result] of Object.entries(context.results)) {
      console.log(`Checking results from node ${nodeId}:`, result);

      if (result && typeof result === "object") {
        // Check for data in standard format
        if ("data" in result && result.data !== undefined) {
          console.log(`Node ${nodeId} has data property:`, result.data);

          if (typeof result.data === "object" && "value" in result.data) {
            console.log(`Found value in result.data.value:`, result.data.value);
            return result.data.value as WorkflowVariableValue;
          } else {
            console.log(`Using result.data as value:`, result.data);
            return result.data as WorkflowVariableValue;
          }
        } else {
          // Try using the whole result object
          console.log(`Using entire result as value:`, result);
          return result as WorkflowVariableValue;
        }
      }
    }

    return undefined;
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

import '@xyflow/react/dist/style.css';
import './flowStyles.css'; // Import our custom flow styles

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    addEdge, Background, BackgroundVariant, Connection, ConnectionMode, Controls, Edge, getOutgoers,
    MiniMap, Node, PanOnScrollMode, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState,
    useReactFlow
} from '@xyflow/react';

import { useApi } from '../../../api/hooks/useApi';
import {
    edgeTypes, mapGeneralAction, mapSetValueAction, nodeTypes, validateConnection
} from '../../../flowPlugins';
import { ApiComponentService } from '../services/ApiComponentService';
import { WorkflowExecutionService } from '../services/WorkflowExecutionService';
import { ApiAppNodeData, Pin, WorkflowExecutionContext } from '../types/flowTypes';
import ApiAppNode from './ApiAppNode';
import ApiNode from './ApiNode';
import BeginWorkflowNode from './BeginWorkflowNode';
import CustomEdge from './CustomEdge';
import DataTypeConversionNode from './DataTypeConversionNode';
import NodeCreationMenu from './NodeCreationMenu';
import NumberPrimitiveNode from './NumberPrimitiveNode';
import StringPrimitiveNode from './StringPrimitiveNode';

// Initialize with empty arrays
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

// Create the inner component that uses the ReactFlow hooks
const FlowCanvasInner: React.FC = () => {
  // Initialize API component service
  const apiContext = useApi();
  useEffect(() => {
    const apiService = ApiComponentService.getInstance();
    apiService.setApiContext(apiContext);
  }, [apiContext]);

  // Set up nodes and edges state with empty initial data
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultInitialEdges);

  // Workflow execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<
    Record<string, unknown>
  >({});

  // Execution context for sharing data between nodes
  const executionContext = useRef<WorkflowExecutionContext>({
    variables: {},
    results: {},
    isExecuting: false,
    addVariable: (name, value) => {
      executionContext.current.variables[name] = value;
    },
    getVariable: (name) => {
      return executionContext.current.variables[name];
    },
    setResult: (nodeId, result) => {
      executionContext.current.results[nodeId] = result;
      setExecutionResults({ ...executionContext.current.results });
    },
    getResult: (nodeId) => {
      return executionContext.current.results[nodeId];
    },
  });

  // Get the ReactFlow instance to access current nodes and edges
  const { getNodes, getEdges } = useReactFlow();

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      // Use centralized validation function
      const validationResult = validateConnection(
        connection,
        getNodes(),
        getEdges()
      );

      if (!validationResult.valid) {
        console.warn(`Invalid connection: ${validationResult.reason}`);
        return; // Don't create the connection
      }

      // Determine if this is an execution connection
      const sourceIsExecution =
        connection.sourceHandle?.includes("exec") || false;

      // Create the connection
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            data: {
              isExecution: sourceIsExecution,
            },
          },
          eds
        )
      );

      // If this is a data connection (not execution), update parameter mappings
      if (!sourceIsExecution) {
        const sourceNode = getNodes().find(
          (node) => node.id === connection.source
        );
        const targetNode = getNodes().find(
          (node) => node.id === connection.target
        );

        // Check if target is an API app node
        if (targetNode && targetNode.type === "apiAppNode" && sourceNode) {
          console.log("Setting up parameter mapping for data connection");

          // Check if source is a primitive node
          const isPrimitiveSource =
            sourceNode.type === "stringPrimitive" ||
            sourceNode.type === "numberPrimitive";

          setNodes((nodes) =>
            nodes.map((node) => {
              if (node.id === targetNode.id) {
                // Cast node.data to ApiAppNodeData
                const nodeData = node.data as unknown as ApiAppNodeData;

                // Apply mapping and convert back to Record<string, unknown> for node data
                const updatedData = isPrimitiveSource
                  ? mapSetValueAction(nodeData, connection.targetHandle!)
                  : mapGeneralAction(nodeData, connection.targetHandle!);

                return {
                  ...node,
                  data: updatedData as unknown as Record<string, unknown>,
                };
              }
              return node;
            })
          );

          console.log("Parameter mapping updated", targetNode.id);
        }
      }
    },
    [setEdges, getNodes, setNodes]
  );

  // Node selection handling
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  // Add new node
  const onAddNode = useCallback(
    (newNode: Node) => {
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Delete node and its connections
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Handle keyboard events for deletion
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNode) {
          onDeleteNode(selectedNode);
          setSelectedNode(null);
        }
      }
    },
    [selectedNode, onDeleteNode]
  );

  // Find a starting node (with execution input but no incoming execution edges)
  const findStartNode = useCallback(() => {
    // First look for beginWorkflow nodes
    const beginWorkflowNodes = nodes.filter(
      (node) => node.type === "beginWorkflow"
    );
    if (beginWorkflowNodes.length > 0) {
      return beginWorkflowNodes[0]; // Use the first Begin Workflow node
    }

    // Fall back to the existing logic for other node types
    const nodesWithExecutionInputs = nodes.filter((node) => {
      // Safely check for executionInputs array and its length
      const inputs = node.data?.executionInputs;
      return inputs && Array.isArray(inputs) && inputs.length > 0;
    });

    // For each node with execution inputs, check if it has any incoming execution edges
    for (const node of nodesWithExecutionInputs) {
      const hasIncomingExecution = edges.some(
        (edge) => edge.target === node.id && edge.targetHandle?.includes("exec")
      );

      // If no incoming execution edges, this can be a start node
      if (!hasIncomingExecution) {
        return node;
      }
    }

    return null;
  }, [nodes, edges]);

  // Find nodes that can be executed next from the current node
  const findNextNodes = useCallback(
    (nodeId: string): Node[] => {
      // Find outgoing execution edges from this node
      const outgoingExecutionEdges = edges.filter(
        (edge) => edge.source === nodeId && edge.sourceHandle?.includes("exec")
      );

      // Get the target nodes for these edges
      return outgoingExecutionEdges
        .map((edge) => nodes.find((node) => node.id === edge.target))
        .filter((node): node is Node => !!node);
    },
    [nodes, edges]
  );

  // Execute a workflow starting from a given node
  const executeWorkflow = async () => {
    const startNode = findStartNode();

    if (!startNode) {
      setExecutionError("Unable to find a suitable starting node.");
      return;
    }

    try {
      setIsExecuting(true);
      setCurrentNodeId(startNode.id);
      executionContext.current.isExecuting = true;
      executionContext.current.variables = {};
      executionContext.current.results = {};
      setExecutionResults({});

      // Create execution service
      const executionService = WorkflowExecutionService.getInstance();

      // Execute the workflow
      const result = await executionService.executeWorkflow(
        startNode.id,
        nodes,
        edges,
        executionContext.current
      );

      console.log("Workflow execution complete", result);
    } catch (error) {
      console.error("Workflow execution error", error);
      setExecutionError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during workflow execution."
      );
    } finally {
      setIsExecuting(false);
      setCurrentNodeId(null);
      executionContext.current.isExecuting = false;
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ height: "100vh" }}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <NodeCreationMenu onAddNode={onAddNode} />

      <div className="flow-controls absolute top-4 right-4 z-10">
        <button
          onClick={executeWorkflow}
          disabled={isExecuting}
          className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg ${
            isExecuting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isExecuting ? "Executing..." : "Execute Workflow"}
        </button>
      </div>

      {currentNodeId && (
        <div className="execution-indicator absolute bottom-4 right-4 z-10 bg-blue-800 text-white px-4 py-2 rounded-md shadow-lg">
          Executing node: {currentNodeId}
        </div>
      )}

      {executionError && (
        <div className="execution-error absolute bottom-4 left-4 z-10 bg-red-800 text-white p-4 max-w-md rounded-md shadow-lg">
          <h3 className="font-bold mb-2">Execution Error</h3>
          <div className="text-sm">{executionError}</div>
          <button
            onClick={() => setExecutionError(null)}
            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        selectionOnDrag={true}
        className="bg-[#1A1F2C]"
        deleteKeyCode={["Backspace", "Delete"]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#2D3748"
          gap={24}
          size={1.5}
        />
        <Controls className="bg-[#2D3748] border-[#4A5568] rounded-md" />
        <MiniMap
          nodeColor={(node) => {
            return node.selected ? "#F56565" : "#4A5568";
          }}
          maskColor="rgba(26, 31, 44, 0.7)"
          className="bg-[#2D3748] border-[#4A5568] rounded-md"
        />
      </ReactFlow>
    </div>
  );
};

// Wrapper component that provides the ReactFlow context
const FlowCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;

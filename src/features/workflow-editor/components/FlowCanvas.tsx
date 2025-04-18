import '@xyflow/react/dist/style.css';
import './flowStyles.css'; // Import our custom flow styles

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    addEdge, Background, BackgroundVariant, Connection, ConnectionMode, Controls, Edge, EdgeTypes,
    MiniMap, Node, NodeTypes, PanOnScrollMode, ReactFlow, useEdgesState, useNodesState
} from '@xyflow/react';

import { useApi } from '../../../api/hooks/useApi';
import { ApiComponentService } from '../services/ApiComponentService';
import { WorkflowExecutionService } from '../services/WorkflowExecutionService';
import { WorkflowExecutionContext } from '../types/flowTypes';
import ApiAppNode from './ApiAppNode';
import ApiNode from './ApiNode';
import BeginWorkflowNode from './BeginWorkflowNode';
import CustomEdge from './CustomEdge';
import NodeCreationMenu from './NodeCreationMenu';

// Initialize with empty arrays
const defaultInitialNodes: Node[] = [];
const defaultInitialEdges: Edge[] = [];

const FlowCanvas: React.FC = () => {
  // Initialize API component service
  const apiContext = useApi();
  useEffect(() => {
    const apiService = ApiComponentService.getInstance();
    apiService.setApiContext(apiContext);
  }, [apiContext]);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      apiNode: ApiNode,
      apiAppNode: ApiAppNode,
      beginWorkflow: BeginWorkflowNode,
    }),
    []
  );

  // Define custom edge types
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

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

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            data: {
              isExecution:
                connection.sourceHandle?.includes("exec") ||
                connection.targetHandle?.includes("exec"),
            },
          },
          eds
        )
      );
    },
    [setEdges]
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

  // Execute workflow from a starting node
  const executeWorkflow = useCallback(async () => {
    // Reset execution state
    setIsExecuting(true);
    setExecutionError(null);
    executionContext.current.results = {};
    executionContext.current.variables = {};
    executionContext.current.isExecuting = true;

    try {
      // Find a starting node
      const startNode = findStartNode();
      if (!startNode) {
        throw new Error(
          "No starting node found. Add a node with an execution input."
        );
      }

      setCurrentNodeId(startNode.id);

      // Get the workflow execution service
      const workflowService = WorkflowExecutionService.getInstance();

      // Execute the workflow with callbacks for UI updates
      await workflowService.executeWorkflow(
        startNode.id,
        nodes,
        edges,
        executionContext.current,
        {
          onNodeStart: (nodeId) => {
            setCurrentNodeId(nodeId);
            // Highlight the current node by adding a CSS class
            setNodes((nodes) =>
              nodes.map((node) =>
                node.id === nodeId
                  ? { ...node, className: "executing-node" }
                  : node
              )
            );
          },
          onNodeComplete: (nodeId, result) => {
            console.log(`Node ${nodeId} completed with result:`, result);
            // Update node appearance to show completion
            setNodes((nodes) =>
              nodes.map((node) =>
                node.id === nodeId
                  ? { ...node, className: "completed-node" }
                  : node
              )
            );
          },
          onWorkflowComplete: () => {
            console.log("Workflow execution completed successfully!");
            setIsExecuting(false);
            executionContext.current.isExecuting = false;
          },
          onError: (error, nodeId) => {
            console.error(`Error in node ${nodeId || "unknown"}:`, error);
            setExecutionError(error.message);
            // Mark the node with error
            if (nodeId) {
              setNodes((nodes) =>
                nodes.map((node) =>
                  node.id === nodeId
                    ? { ...node, className: "error-node" }
                    : node
                )
              );
            }
            setIsExecuting(false);
            executionContext.current.isExecuting = false;
          },
        }
      );
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : String(error));
      setIsExecuting(false);
      executionContext.current.isExecuting = false;
    }
  }, [findStartNode, nodes, edges, setNodes]);

  return (
    <div
      className="flow-canvas h-full w-full relative"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <NodeCreationMenu onAddNode={onAddNode} />

      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={executeWorkflow}
          disabled={isExecuting}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg flex items-center"
        >
          {isExecuting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Executing...
            </>
          ) : (
            "Run Workflow"
          )}
        </button>
      </div>

      {executionError && (
        <div className="absolute top-16 right-4 z-10 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md shadow-md">
          <div className="font-bold mb-1">Execution Error</div>
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
        fitView
        fitViewOptions={{ padding: 0.2 }}
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

export default FlowCanvas;

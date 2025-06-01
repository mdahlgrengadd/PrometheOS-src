import "@xyflow/react/dist/style.css";
import "./flowStyles.css"; // Import our custom flow styles
import "./pin-size-adjustments.css"; // Import pin size adjustments

import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  addEdge,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  getOutgoers,
  MarkerType,
  MiniMap,
  Node,
  PanOnScrollMode,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";

import { useApi } from "../../../../../api/hooks/useApi";
import {
  edgeTypes,
  mapGeneralAction,
  mapSetValueAction,
  nodeTypes,
  validateConnection,
} from "../../flowPlugins";
import { ApiComponentService } from "../services/ApiComponentService";
import { WorkflowExecutionService } from "../services/WorkflowExecutionService";
import {
  ApiAppNodeData,
  Pin,
  PinType,
  WorkflowExecutionContext,
  WorkflowVariableValue,
} from "../types/flowTypes";
import ApiAppNode from "./ApiAppNode";
import ApiNode from "./ApiNode";
import BeginWorkflowNode from "./BeginWorkflowNode";
import CustomEdge from "./CustomEdge";
import DataTypeConversionNode from "./DataTypeConversionNode";
import NodeCreationMenu from "./NodeCreationMenu";
import NumberPrimitiveNode from "./NumberPrimitiveNode";
import SkeumorphicGridBackground from "./skeumorphic-grid-background";
import StringPrimitiveNode from "./StringPrimitiveNode";

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

  // Reference to the workflow execution context
  const executionContext = useRef<WorkflowExecutionContext>({
    currentNodeId: "",
    variables: {},
    results: {},
    getVariable: function (id: string) {
      return this.variables[id];
    },
    addVariable: function (id: string, value: WorkflowVariableValue) {
      this.variables[id] = value;
    },
    addNodeScopedVariable: function (
      nodeId: string,
      pinId: string,
      value: WorkflowVariableValue
    ) {
      const scopedKey = `${nodeId}:${pinId}`;
      this.variables[scopedKey] = value;
    },
    getNodeScopedVariable: function (nodeId: string, pinId: string) {
      const scopedKey = `${nodeId}:${pinId}`;
      return this.variables[scopedKey];
    },
    setResult: function (nodeId: string, result: unknown) {
      this.results[nodeId] = result;
    },
    getResult: function (nodeId: string) {
      return this.results[nodeId];
    },
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultInitialEdges);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<
    Record<string, unknown>
  >({});

  // Get the React Flow instance
  const { getNodes, getEdges } = useReactFlow();

  // Get viewport size for node positioning
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Snap to grid state (disabled by default)
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Minimap visibility state (hidden by default)
  const [showMinimap, setShowMinimap] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      setViewportSize({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      });
    }

    // Add resize handler to update when window is resized
    const handleResize = () => {
      if (containerRef.current) {
        setViewportSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add a Begin Workflow node automatically on init
  useEffect(() => {
    // Only add the Begin Workflow node if there are no nodes yet
    if (nodes.length === 0) {
      const beginWorkflowNextPin = {
        id: `exec-out-${Date.now()}`,
        type: "execution" as PinType,
        label: "Next",
        acceptsMultipleConnections: true,
      };

      // Calculate the center position based on the container size
      // Default to reasonable values if container ref is not available yet
      const width = containerRef.current?.offsetWidth || 1000;
      const height = containerRef.current?.offsetHeight || 800;

      const beginWorkflowNode = {
        id: `begin-workflow-${Date.now()}`,
        type: "beginWorkflow",
        position: {
          x: width / 2 - 90, // Center horizontally (accounting for node width)
          y: height / 2 - 50, // Center vertically (accounting for node height)
        },
        data: {
          label: "Begin Workflow",
          executionInputs: [],
          executionOutputs: [beginWorkflowNextPin],
        },
      };

      setNodes([beginWorkflowNode]);
    }
  }, [viewportSize, nodes.length, setNodes]);

  // Connect nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Only create the connection if it's valid
      if (validateConnection(params, getNodes(), getEdges())) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, getNodes, getEdges]
  );

  // Node selection handling
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    setSelectedEdge(null); // Clear edge selection when selecting a node
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.id);
    setSelectedNode(null); // Clear node selection when selecting an edge
  }, []);

  // Delete selected edge
  const onEdgeDelete = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

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
        } else if (selectedEdge) {
          onEdgeDelete(selectedEdge);
          setSelectedEdge(null);
        }
      }
    },
    [selectedNode, selectedEdge, onDeleteNode, onEdgeDelete]
  );

  // Find a starting node (with execution input but no incoming execution edges)
  const findStartNode = useCallback(() => {
    // Only use beginWorkflow nodes as starting points
    const beginWorkflowNodes = nodes.filter(
      (node) => node.type === "beginWorkflow"
    );

    if (beginWorkflowNodes.length > 0) {
      return beginWorkflowNodes[0]; // Use the first Begin Workflow node
    }

    // If no begin workflow node is found, we don't have a valid starting point
    return null;
  }, [nodes]);

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
    }
  };

  // Check if we already have a Begin Workflow node
  const hasBeginWorkflowNode = useCallback(() => {
    return nodes.some((node) => node.type === "beginWorkflow");
  }, [nodes]);

  return (
    <div
      className="flex flex-col h-full w-full blueprints"
      style={{ height: "100%" }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      ref={containerRef}
    >
      <div className="flow-container h-full w-full relative overflow-hidden">
        <NodeCreationMenu
          onAddNode={onAddNode}
          hasBeginWorkflowNode={hasBeginWorkflowNode()}
        />

        <div className="flow-controls absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: snapToGrid
                ? "linear-gradient(to bottom, #3b82f6, #2563eb)"
                : "linear-gradient(to bottom, #6b7280, #4b5563)",
              border: "1px solid #1a1a1a",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `,
              cursor: "pointer",
            }}
          >
            Snap to Grid
          </button>
          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: showMinimap
                ? "linear-gradient(to bottom, #3b82f6, #2563eb)"
                : "linear-gradient(to bottom, #6b7280, #4b5563)",
              border: "1px solid #1a1a1a",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `,
              cursor: "pointer",
            }}
          >
            Minimap
          </button>
          <button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: isExecuting
                ? "linear-gradient(to bottom, #6b7280, #4b5563)"
                : "linear-gradient(to bottom, #16a34a, #15803d)",
              border: "1px solid #166534",
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `,
              opacity: isExecuting ? 0.5 : 1,
              cursor: isExecuting ? "not-allowed" : "pointer",
            }}
          >
            {isExecuting ? "Executing..." : "Execute Workflow"}
          </button>
        </div>

        {currentNodeId && (
          <div
            className="execution-indicator absolute bottom-4 right-4 z-10 text-white px-4 py-2 rounded-md shadow-lg"
            style={{
              background: "linear-gradient(to bottom, #0ea5e9, #0284c7)",
              border: "2px solid #1a1a1a",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.2),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                inset 1px 0 0 rgba(255,255,255,0.1),
                inset -1px 0 0 rgba(0,0,0,0.2),
                0 4px 8px rgba(0,0,0,0.4)
              `,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            Executing node: {currentNodeId}
          </div>
        )}

        {executionError && (
          <div
            className="execution-error absolute bottom-4 left-4 z-10 text-white p-4 max-w-md rounded-md shadow-lg"
            style={{
              background: "linear-gradient(to bottom, #dc2626, #b91c1c)",
              border: "2px solid #1a1a1a",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.2),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                inset 1px 0 0 rgba(255,255,255,0.1),
                inset -1px 0 0 rgba(0,0,0,0.2),
                0 4px 8px rgba(0,0,0,0.4)
              `,
              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            <h3 className="font-bold mb-2">Execution Error</h3>
            <div className="text-sm">{executionError}</div>
            <button
              onClick={() => setExecutionError(null)}
              className="absolute top-1 right-1 text-red-200 hover:text-white"
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
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={4}
          panOnScroll={true}
          panOnScrollMode={PanOnScrollMode.Free}
          selectionOnDrag={true}
          className="h-full w-full"
          deleteKeyCode={["Backspace", "Delete"]}
          defaultEdgeOptions={{
            type: "custom",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "white",
              width: 20,
              height: 20,
            },
            style: { strokeWidth: 2 },
            animated: true,
          }}
          fitView={false}
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          edgesFocusable={true}
          selectNodesOnDrag={false}
        >
          <SkeumorphicGridBackground className="absolute inset-0" />
        </ReactFlow>

        {/* Place controls directly in the app container instead of inside ReactFlow */}
        <div className="controls-wrapper absolute bottom-4 left-4 z-20">
          <Controls
            className="rounded-md"
            style={{
              background: "linear-gradient(to bottom, #4a4a4a, #2a2a2a)",
              border: "2px solid #1a1a1a",
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.2),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                inset 1px 0 0 rgba(255,255,255,0.1),
                inset -1px 0 0 rgba(0,0,0,0.2),
                0 4px 8px rgba(0,0,0,0.4)
              `,
            }}
            showInteractive={true}
            showZoom={true}
            showFitView={true}
          />
        </div>

        {/* Place minimap directly in the app container instead of inside ReactFlow */}
        {showMinimap && (
          <div className="minimap-wrapper absolute bottom-4 right-4 z-20">
            <MiniMap
              nodeColor={(node) => {
                return node.selected ? "#ffff00" : "#6b7280";
              }}
              maskColor="rgba(26, 26, 26, 0.8)"
              className="rounded-md"
              style={{
                background: "linear-gradient(to bottom, #4a4a4a, #2a2a2a)",
                border: "2px solid #1a1a1a",
                boxShadow: `
                  inset 0 1px 0 rgba(255,255,255,0.2),
                  inset 0 -1px 0 rgba(0,0,0,0.3),
                  inset 1px 0 0 rgba(255,255,255,0.1),
                  inset -1px 0 0 rgba(0,0,0,0.2),
                  0 4px 8px rgba(0,0,0,0.4)
                `,
              }}
              zoomable
              pannable
            />
          </div>
        )}
      </div>
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


import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ConnectionMode,
  NodeTypes,
  EdgeTypes,
  PanOnScrollMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ApiNode from './ApiNode';
import CustomEdge from './CustomEdge';
import NodeCreationMenu from './NodeCreationMenu';
import { initialNodes, initialEdges } from '../../../data/initialNodes';

const FlowCanvas: React.FC = () => {
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(() => ({ 
    apiNode: ApiNode,
  }), []);

  // Define custom edge types
  const edgeTypes: EdgeTypes = useMemo(() => ({
    customEdge: CustomEdge,
  }), []);

  // Set up nodes and edges state with the initial data
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'customEdge',
      data: {
        isExecution: connection.sourceHandle?.includes('exec') || connection.targetHandle?.includes('exec')
      }
    }, eds));
  }, [setEdges]);

  // Node selection handling
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  // Add new node
  const onAddNode = useCallback((newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  // Delete node and its connections
  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  // Handle keyboard events for deletion
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        onDeleteNode(selectedNode);
        setSelectedNode(null);
      }
    }
  }, [selectedNode, onDeleteNode]);

  return (
    <div className="flow-canvas h-full w-full relative" onKeyDown={onKeyDown} tabIndex={0}>
      <NodeCreationMenu onAddNode={onAddNode} />
      
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
        deleteKeyCode={['Backspace', 'Delete']}
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
            return node.selected ? '#F56565' : '#4A5568';
          }}
          maskColor="rgba(26, 31, 44, 0.7)"
          className="bg-[#2D3748] border-[#4A5568] rounded-md"
        />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;

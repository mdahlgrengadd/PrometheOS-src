
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { ApiNodeData } from '../types/flowTypes';

interface NodeCreationMenuProps {
  onAddNode: (Node: Node) => void;
}

const NodeCreationMenu: React.FC<NodeCreationMenuProps> = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodeName, setNodeName] = useState('');
  const [endpoint, setEndpoint] = useState('');

  const handleAddNode = () => {
    if (!nodeName.trim() || !endpoint.trim()) return;
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'apiNode',
      position: { 
        x: Math.random() * 300 + 50, 
        y: Math.random() * 300 + 50 
      },
      data: {
        label: nodeName,
        endpoint: endpoint,
        inputs: [
          { id: `input-${Date.now()}-1`, type: 'input', label: 'setParam', dataType: 'string' },
        ],
        outputs: [
          { id: `output-${Date.now()}-1`, type: 'output', label: 'getData', dataType: 'object' },
        ],
        executionInputs: [
          { id: `exec-in-${Date.now()}`, type: 'execution', label: 'In', acceptsMultipleConnections: true }
        ],
        executionOutputs: [
          { id: `exec-out-${Date.now()}`, type: 'execution', label: 'Out', acceptsMultipleConnections: true }
        ]
      }
    };
    
    onAddNode(newNode);
    setNodeName('');
    setEndpoint('');
    setIsOpen(false);
  };

  return (
    <div className="node-creation-menu absolute top-4 left-4 z-10">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg"
        >
          Add API Node
        </button>
      ) : (
        <div className="p-4 bg-[#2D3748] rounded-md shadow-xl border border-[#4A5568] w-64">
          <h3 className="text-white font-bold mb-3">Add New API Node</h3>
          
          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">Node Name</label>
            <input 
              type="text" 
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
              placeholder="User API"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">API Endpoint</label>
            <input 
              type="text" 
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
              placeholder="/api/users"
            />
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={() => setIsOpen(false)} 
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Cancel
            </button>
            <button 
              onClick={handleAddNode} 
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              disabled={!nodeName.trim() || !endpoint.trim()}
            >
              Add Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeCreationMenu;

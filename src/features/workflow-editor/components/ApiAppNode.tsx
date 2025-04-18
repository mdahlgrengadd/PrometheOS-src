import React, { memo, useEffect, useState } from 'react';

import { Node, NodeProps, Position, useReactFlow } from '@xyflow/react';

import { IApiAction, IApiComponent } from '../../../api/core/types';
import { ApiComponentService } from '../services/ApiComponentService';
import { ApiAppNodeData } from '../types/flowTypes';
import ExecutionPin from './ExecutionPin';
import InputPin from './InputPin';
import OutputPin from './OutputPin';

// Props type for our node - use correct type definition
interface ApiAppNodeProps {
  id: string;
  data: ApiAppNodeData;
  isConnectable: boolean;
}

const ApiAppNode = ({ id, data, isConnectable }: ApiAppNodeProps) => {
  const [apiComponent, setApiComponent] = useState<IApiComponent | null>(null);
  const [selectedAction, setSelectedAction] = useState<IApiAction | null>(null);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(!data.actionId);
  const { setNodes } = useReactFlow();

  // Fetch API component data when node is created
  useEffect(() => {
    const apiService = ApiComponentService.getInstance();
    const components = apiService.getApiComponents();
    const component = components.find((comp) => comp.id === data.componentId);

    if (component) {
      setApiComponent(component);

      if (data.actionId) {
        const action = component.actions.find(
          (act) => act.id === data.actionId
        );
        if (action) {
          setSelectedAction(action);
        }
      }
    }
  }, [data.componentId, data.actionId]);

  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    if (!apiComponent) return;

    const action = apiComponent.actions.find((act) => act.id === actionId);
    if (action) {
      setSelectedAction(action);

      // Update the node data in the React Flow graph
      const updateNode = (nds: Node[]) => {
        return nds.map((node) => {
          if (node.id === id) {
            // Create updated data with the actionId
            const updatedData = {
              ...node.data,
              actionId: action.id,
            };

            return {
              ...node,
              data: updatedData,
            };
          }
          return node;
        });
      };

      // Update nodes with the new data
      setNodes(updateNode);

      setIsConfiguring(false);
    }
  };

  // Get node category color
  const getCategoryColor = () => {
    const path = apiComponent?.path || "";
    if (path.includes("calculator")) return "bg-purple-700";
    if (path.includes("notepad")) return "bg-green-700";
    if (path.includes("audioplayer")) return "bg-red-700";
    if (path.includes("browser")) return "bg-blue-700";
    return "bg-gray-700";
  };

  // Render configuration panel
  const renderConfigPanel = () => {
    if (!apiComponent) return <div>Loading component data...</div>;

    return (
      <div className="p-3 bg-[#1A202C] rounded">
        <h3 className="text-sm font-bold mb-2 text-white">Configure Node</h3>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Select Action
          </label>
          <select
            className="w-full p-1 bg-[#2D3748] border border-[#4A5568] rounded text-white text-sm"
            onChange={(e) => handleActionSelect(e.target.value)}
            value={selectedAction?.id || ""}
          >
            <option value="">Choose an action...</option>
            {apiComponent.actions.map((action) => (
              <option key={action.id} value={action.id}>
                {action.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-right">
          <button
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            onClick={() => setIsConfiguring(false)}
            disabled={!selectedAction}
          >
            Apply
          </button>
        </div>
      </div>
    );
  };

  if (isConfiguring) {
    return (
      <div className="api-app-node rounded-md overflow-hidden shadow-lg bg-[#2D3748] border-2 border-[#4A5568] min-w-[250px]">
        {/* Header section */}
        <div
          className={`node-header px-3 py-2 ${getCategoryColor()} text-white font-bold flex items-center justify-between`}
        >
          <span className="text-sm truncate">
            {apiComponent?.type || "API Component"}
          </span>
          <span className="text-xs opacity-70">{data.appId}</span>
        </div>

        {renderConfigPanel()}
      </div>
    );
  }

  return (
    <div className="api-app-node rounded-md overflow-hidden shadow-lg bg-[#2D3748] border-2 border-[#4A5568] min-w-[250px]">
      {/* Header section with title */}
      <div
        className={`node-header px-3 py-2 ${getCategoryColor()} text-white font-bold flex items-center justify-between`}
      >
        <span className="text-sm truncate">{data.label}</span>
        <span className="text-xs opacity-70 font-mono">{data.endpoint}</span>
      </div>

      {/* Node content with pins */}
      <div className="node-content flex">
        {/* Left execution pins (input) */}
        <div className="execution-pins-left py-2 pr-1 flex flex-col justify-start border-r border-[#4A5568]">
          {data.executionInputs.map((pin) => (
            <ExecutionPin
              key={pin.id}
              pin={pin}
              position={Position.Left}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}
        </div>

        <div className="pins-container flex flex-1">
          {/* Left side for input pins */}
          <div className="input-pins px-2 py-3 flex-1">
            {data.inputs.map((pin) => (
              <InputPin
                key={pin.id}
                pin={pin}
                nodeId={id}
                isConnectable={isConnectable}
              />
            ))}
          </div>

          {/* Right side for output pins */}
          <div className="output-pins px-2 py-3 flex-1">
            {data.outputs.map((pin) => (
              <OutputPin
                key={pin.id}
                pin={pin}
                nodeId={id}
                isConnectable={isConnectable}
              />
            ))}
          </div>
        </div>

        {/* Right execution pins (output) */}
        <div className="execution-pins-right py-2 pl-1 flex flex-col justify-start border-l border-[#4A5568]">
          {data.executionOutputs.map((pin) => (
            <ExecutionPin
              key={pin.id}
              pin={pin}
              position={Position.Right}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}
        </div>
      </div>

      {/* Footer with additional info */}
      <div className="node-footer px-3 py-1 bg-[#1A202C] text-xs text-gray-400 border-t border-[#4A5568] flex justify-between">
        <span>{apiComponent?.type || "API"}</span>
        <span>{selectedAction?.name || "No Action"}</span>
      </div>
    </div>
  );
};

export default memo(ApiAppNode);

import React, { memo, useEffect, useState } from "react";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";

import { IApiAction, IApiComponent } from "../../../api/core/types";
import { usePlugins } from "../../../plugins/PluginContext";
import { PluginManifest } from "../../../plugins/types";
import { ApiComponentService } from "../services/ApiComponentService";
import { ApiAppNodeData, PinDataType } from "../types/flowTypes";
import ExecutionPin from "./ExecutionPin";
import InputPin from "./InputPin";
import OutputPin from "./OutputPin";

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
  const [appIcon, setAppIcon] = useState<React.ReactNode | null>(null);
  const { setNodes } = useReactFlow();
  const { pluginManager } = usePlugins();

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

      // Extract app ID from the component path if possible
      if (component.path) {
        const pathParts = component.path.split("/");
        if (pathParts.length >= 3 && pathParts[1] === "apps") {
          const appId = pathParts[2];

          // Get the plugin through the pluginManager
          const plugin = pluginManager.getPlugin(appId);
          if (plugin && plugin.manifest.icon) {
            setAppIcon(plugin.manifest.icon);
          }
        }
      }
    }
  }, [data.componentId, data.actionId, pluginManager]);

  // Handle action selection
  const handleActionSelect = (actionId: string) => {
    if (!apiComponent) return;

    const action = apiComponent.actions.find((act) => act.id === actionId);
    if (action) {
      setSelectedAction(action);

      // Create parameter mappings for the action's parameters
      const parameterMappings: Record<string, string> = {};

      // Map each input pin ID to the corresponding parameter name
      const updatedInputs =
        action.parameters?.map((param) => {
          const pinId = `input-${Date.now()}-${param.name}`;
          // Map the pin ID to the parameter name
          parameterMappings[pinId] = param.name;

          return {
            id: pinId,
            type: "input" as const,
            label: param.name,
            dataType: param.type as PinDataType,
          };
        }) || [];

      // Create success and error execution pins
      const successPinId = `exec-success-${Date.now()}`;
      const errorPinId = `exec-error-${Date.now()}`;

      const updatedExecutionOutputs = [
        {
          id: successPinId,
          type: "execution" as const,
          label: "Success",
        },
        {
          id: errorPinId,
          type: "execution" as const,
          label: "Error",
        },
      ];

      // Update the node data in the React Flow graph
      const updateNode = (nds: Node[]) => {
        return nds.map((node) => {
          if (node.id === id) {
            // Create updated data with the actionId, parameterMappings, and execution pins
            const updatedData = {
              ...node.data,
              actionId: action.id,
              inputs: updatedInputs,
              parameterMappings: parameterMappings,
              executionOutputs: updatedExecutionOutputs,
              successPinId: successPinId,
              errorPinId: errorPinId,
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
        <h3 className="text-sm font-bold mb-2 text-primary">Configure Node</h3>

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Select Action
          </label>
          <select
            className="w-full p-1 bg-[#2D3748] border border-[#4A5568] rounded text-primary text-sm"
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
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-primary rounded text-xs"
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
          className={`node-header px-3 py-2 ${getCategoryColor()} text-primary font-bold flex items-center justify-between`}
        >
          <span className="text-sm truncate">
            {apiComponent?.name || apiComponent?.type || "API Component"}
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
        className={`node-header px-3 py-2 ${getCategoryColor()} text-primary font-bold flex items-center justify-between`}
      >
        <span className="text-sm truncate">
          {apiComponent?.name || data.label}
        </span>
        <span className="text-xs opacity-70 font-mono">{data.endpoint}</span>
      </div>

      {/* Node content with pins */}
      <div className="node-content flex">
        {/* Left side pin container - holds both execution and data input pins */}
        <div className="left-pins-container flex flex-col gap-3 py-3 pl-0 pr-3 border-r border-[#4A5568]">
          {/* Left execution pins (input) */}
          {data.executionInputs.map((pin) => (
            <ExecutionPin
              key={pin.id}
              pin={pin}
              position={Position.Left}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}

          {/* Left data input pins */}
          {data.inputs.map((pin) => (
            <InputPin
              key={pin.id}
              pin={pin}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}
        </div>

        {/* Center content area */}
        <div className="node-center-content flex-1 px-3 py-2 flex flex-col items-center justify-center">
          {appIcon ? (
            <>
              <div className="flex items-center justify-center mb-1 w-10 h-10 transform scale-90">
                {appIcon}
              </div>
              {selectedAction && (
                <div className="text-xs text-indigo-300 text-center">
                  {selectedAction.name}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-sm text-gray-300">
              {selectedAction && (
                <div className="text-xs mt-1 text-indigo-300">
                  {selectedAction.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side pin container - holds both execution and data output pins */}
        <div className="right-pins-container flex flex-col gap-3 py-3 pl-3 pr-0 border-l border-[#4A5568]">
          {/* Right execution pins (output) */}
          {data.executionOutputs.map((pin) => (
            <ExecutionPin
              key={pin.id}
              pin={pin}
              position={Position.Right}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}

          {/* Right data output pins */}
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

      {/* Footer with additional info */}
      <div className="node-footer px-3 py-1 bg-[#1A202C] text-xs text-gray-400 border-t border-[#4A5568] flex justify-between">
        <span>{apiComponent?.type || "API"}</span>
        <span>{selectedAction?.name || "No Action"}</span>
      </div>
    </div>
  );
};

export default memo(ApiAppNode);

import React, { useEffect, useState } from 'react';

import { Node } from '@xyflow/react';

import { IApiComponent } from '../../../api/core/types';
import { useApi } from '../../../api/hooks/useApi';
import { ApiComponentService } from '../services/ApiComponentService';
import { ApiAppNodeData, PinDataType } from '../types/flowTypes';

interface NodeCreationMenuProps {
  onAddNode: (node: Node) => void;
}

const NodeCreationMenu: React.FC<NodeCreationMenuProps> = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [endpoint, setEndpoint] = useState("");

  // Node type mode state
  const [nodeMode, setNodeMode] = useState<"basic" | "app" | "primitive">(
    "basic"
  );

  // Primitive node type state
  const [primitiveType, setPrimitiveType] = useState<"string" | "number">(
    "string"
  );
  const [stringValue, setStringValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);

  // App node states
  const [availableApps, setAvailableApps] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [appComponents, setAppComponents] = useState<IApiComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");

  // Get API context for accessing components
  const apiContext = useApi();

  // Initialize the API component service
  useEffect(() => {
    const apiService = ApiComponentService.getInstance();
    apiService.setApiContext(apiContext);

    // Get available apps with API components
    const apps = apiService.getAvailableApps();
    setAvailableApps(apps);
  }, [apiContext]);

  // Load app components when an app is selected
  useEffect(() => {
    if (!selectedAppId) {
      setAppComponents([]);
      setSelectedComponentId("");
      return;
    }

    const apiService = ApiComponentService.getInstance();
    const components = apiService.getApiComponentsByApp(selectedAppId);
    setAppComponents(components);
  }, [selectedAppId]);

  // Handle adding a basic node
  const handleAddBasicNode = () => {
    if (!nodeName.trim() || !endpoint.trim()) return;

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "apiNode",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: nodeName,
        endpoint: endpoint,
        inputs: [
          {
            id: `input-${Date.now()}-1`,
            type: "input",
            label: "setParam",
            dataType: "string",
          },
        ],
        outputs: [
          {
            id: `output-${Date.now()}-1`,
            type: "output",
            label: "getData",
            dataType: "object",
          },
        ],
        executionInputs: [
          {
            id: `exec-in-${Date.now()}`,
            type: "execution",
            label: "In",
            acceptsMultipleConnections: true,
          },
        ],
        executionOutputs: [
          {
            id: `exec-out-${Date.now()}`,
            type: "execution",
            label: "Out",
            acceptsMultipleConnections: true,
          },
        ],
      },
    };

    onAddNode(newNode);
    setNodeName("");
    setEndpoint("");
    setIsOpen(false);
  };

  // The Node type expects data to be Record<string, unknown>
  // but our ApiAppNodeData is a specific interface, so we need to cast it
  const createAppNode = (nodeData: ApiAppNodeData): Node => ({
    id: `app-node-${Date.now()}`,
    type: "apiAppNode",
    position: {
      x: Math.random() * 300 + 50,
      y: Math.random() * 300 + 50,
    },
    data: nodeData as unknown as Record<string, unknown>,
  });

  // Handle adding an app-based API node
  const handleAddAppNode = () => {
    if (!selectedAppId || !selectedComponentId) return;

    const selectedComponent = appComponents.find(
      (comp) => comp.id === selectedComponentId
    );
    if (!selectedComponent) return;

    // Create an app node with information from the selected component
    const nodeData: ApiAppNodeData = {
      label: selectedComponent.type,
      endpoint: selectedComponent.path,
      description: selectedComponent.description,
      componentId: selectedComponent.id,
      appId: selectedAppId,
      // Create inputs based on the first action's parameters (if any)
      inputs:
        selectedComponent.actions[0]?.parameters?.map((param) => ({
          id: `input-${Date.now()}-${param.name}`,
          type: "input" as const,
          label: param.name,
          dataType: param.type as PinDataType,
        })) || [],
      // Create a generic output for the result
      outputs: [
        {
          id: `output-${Date.now()}-result`,
          type: "output",
          label: "Result",
          dataType: "object",
        },
      ],
      // Standard execution pins
      executionInputs: [
        {
          id: `exec-in-${Date.now()}`,
          type: "execution",
          label: "In",
          acceptsMultipleConnections: true,
        },
      ],
      executionOutputs: [
        {
          id: `exec-out-${Date.now()}`,
          type: "execution",
          label: "Success",
          acceptsMultipleConnections: true,
        },
      ],
    };

    const newNode = createAppNode(nodeData);
    onAddNode(newNode);
    setSelectedAppId("");
    setSelectedComponentId("");
    setIsOpen(false);
  };

  // Handle adding a begin workflow node
  const handleAddBeginWorkflowNode = () => {
    const newNode = {
      id: `begin-workflow-${Date.now()}`,
      type: "beginWorkflow",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: "Begin Workflow",
        executionInputs: [],
        executionOutputs: [
          {
            id: `exec-output-${Date.now()}`,
            type: "execution",
            label: "Next",
            connections: [],
          },
        ],
      },
    };

    onAddNode(newNode);
    setIsOpen(false);
  };

  // Handle adding a string primitive node
  const handleAddStringPrimitiveNode = () => {
    const newNode: Node = {
      id: `string-primitive-${Date.now()}`,
      type: "stringPrimitive",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: "String Value",
        value: stringValue,
        outputs: [
          {
            id: `output-${Date.now()}`,
            type: "output",
            label: "Value",
            dataType: "string",
          },
        ],
      },
    };

    onAddNode(newNode);
    setStringValue("");
    setIsOpen(false);
  };

  // Handle adding a number primitive node
  const handleAddNumberPrimitiveNode = () => {
    const newNode: Node = {
      id: `number-primitive-${Date.now()}`,
      type: "numberPrimitive",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: "Number Value",
        value: numberValue,
        outputs: [
          {
            id: `output-${Date.now()}`,
            type: "output",
            label: "Value",
            dataType: "number",
          },
        ],
      },
    };

    onAddNode(newNode);
    setNumberValue(0);
    setIsOpen(false);
  };

  // Render the App Node creation form
  const renderAppNodeForm = () => {
    return (
      <>
        <div className="mb-3">
          <label className="block text-gray-300 text-sm mb-1">Select App</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
          >
            <option value="">Choose an app...</option>
            {availableApps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAppId && (
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">
              Select Component
            </label>
            <select
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
            >
              <option value="">Choose a component...</option>
              {appComponents.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.type} ({component.actions.length} actions)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddAppNode}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={!selectedAppId || !selectedComponentId}
          >
            Add App Node
          </button>
        </div>
      </>
    );
  };

  // Render the Basic node creation form
  const renderBasicNodeForm = () => {
    return (
      <>
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
          <label className="block text-gray-300 text-sm mb-1">
            API Endpoint
          </label>
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
            onClick={handleAddBasicNode}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={!nodeName.trim() || !endpoint.trim()}
          >
            Add Node
          </button>
        </div>
      </>
    );
  };

  // Render primitive node form
  const renderPrimitiveNodeForm = () => {
    return (
      <>
        <div className="mb-3">
          <label className="block text-gray-300 text-sm mb-1">
            Primitive Type
          </label>
          <div className="flex space-x-2">
            <button
              className={`flex-1 py-1 text-sm ${
                primitiveType === "string"
                  ? "bg-blue-600 text-white"
                  : "bg-[#2D3748] text-gray-300"
              } rounded`}
              onClick={() => setPrimitiveType("string")}
            >
              String
            </button>
            <button
              className={`flex-1 py-1 text-sm ${
                primitiveType === "number"
                  ? "bg-green-600 text-white"
                  : "bg-[#2D3748] text-gray-300"
              } rounded`}
              onClick={() => setPrimitiveType("number")}
            >
              Number
            </button>
          </div>
        </div>

        {primitiveType === "string" ? (
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">
              Initial Value
            </label>
            <input
              type="text"
              value={stringValue}
              onChange={(e) => setStringValue(e.target.value)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
              placeholder="Enter string value..."
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-1">
              Initial Value
            </label>
            <input
              type="number"
              value={numberValue}
              onChange={(e) => setNumberValue(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-white"
              placeholder="Enter number value..."
              step="0.1"
            />
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={
              primitiveType === "string"
                ? handleAddStringPrimitiveNode
                : handleAddNumberPrimitiveNode
            }
            className={`px-3 py-1 ${
              primitiveType === "string"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white rounded`}
          >
            Add {primitiveType === "string" ? "String" : "Number"} Node
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="node-creation-menu absolute top-4 left-4 z-10">
      {!isOpen ? (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setIsOpen(true);
              setNodeMode("basic");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-lg"
          >
            Add Basic Node
          </button>
          <button
            onClick={() => {
              setIsOpen(true);
              setNodeMode("app");
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-lg"
          >
            Add App API Node
          </button>
          <button
            onClick={() => {
              setIsOpen(true);
              setNodeMode("primitive");
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-lg"
          >
            Add Primitive
          </button>
        </div>
      ) : (
        <div className="p-4 bg-[#2D3748] rounded-md shadow-xl border border-[#4A5568] w-64">
          <h3 className="text-white font-bold mb-3">
            {nodeMode === "basic"
              ? "Add Basic Node"
              : nodeMode === "app"
              ? "Add App API Node"
              : "Add Primitive Node"}
          </h3>

          {/* Tabs to switch between node types */}
          <div className="flex mb-4 bg-[#1A202C] rounded overflow-hidden">
            <button
              className={`flex-1 py-1 text-sm ${
                nodeMode === "basic"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setNodeMode("basic")}
            >
              Basic
            </button>
            <button
              className={`flex-1 py-1 text-sm ${
                nodeMode === "app" ? "bg-green-600 text-white" : "text-gray-400"
              }`}
              onClick={() => setNodeMode("app")}
            >
              App API
            </button>
            <button
              className={`flex-1 py-1 text-sm ${
                nodeMode === "primitive"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400"
              }`}
              onClick={() => setNodeMode("primitive")}
            >
              Primitive
            </button>
          </div>

          {nodeMode === "basic"
            ? renderBasicNodeForm()
            : nodeMode === "app"
            ? renderAppNodeForm()
            : renderPrimitiveNodeForm()}

          {nodeMode !== "primitive" && (
            <div className="menu-section mt-4">
              <button
                onClick={handleAddBeginWorkflowNode}
                className="menu-button w-full px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Begin Workflow
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeCreationMenu;

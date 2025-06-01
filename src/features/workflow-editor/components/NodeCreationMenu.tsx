import React, { useEffect, useState } from 'react';

import { Node } from '@xyflow/react';

import { IApiComponent } from '../../../api/core/types';
import { useApi } from '../../../api/hooks/useApi';
import { useDataPin, useExecPin } from '../../../hooks/usePin';
import { eventBus } from '../../../plugins/EventBus';
import { ApiComponentService } from '../services/ApiComponentService';
import { ApiAppNodeData, Pin, PinDataType, PinType } from '../types/flowTypes';
import { DataTypeConversionNodeData } from './DataTypeConversionNode';

interface NodeCreationMenuProps {
  onAddNode: (node: Node) => void;
  hasBeginWorkflowNode?: boolean;
}

const NodeCreationMenu: React.FC<NodeCreationMenuProps> = ({
  onAddNode,
  hasBeginWorkflowNode,
}) => {
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

  // Add data type conversion state
  const [inputDataType, setInputDataType] = useState<PinDataType>("object");
  const [outputDataType, setOutputDataType] = useState<PinDataType>("string");

  // Get API context for accessing components
  const apiContext = useApi();

  // Create pins at the component level (React hooks can only be called here)
  // Basic node pins
  const basicNodeInputPin = useDataPin("input", "string", "setParam");
  const maxTimePin = useDataPin("input", "number", "maxTime");
  const basicNodeOutputPin = useDataPin("output", "object", "result");
  const basicNodeExecInputPin = useExecPin("In", "in");
  const successExecOutputPin = useExecPin("Success", "out");
  const failExecOutputPin = useExecPin("Fail", "out");

  // Begin workflow pins
  const beginWorkflowNextPin = useExecPin("Next", "out");

  // String primitive pins
  const stringValuePin = useDataPin("output", "string", "Value");

  // Number primitive pins
  const numberValuePin = useDataPin("output", "number", "Value");

  // Data type converter pins - these depend on the selected data types
  const typeCoverterInputPin = useDataPin("input", inputDataType, "Input");
  const typeCoverterOutputPin = useDataPin("output", outputDataType, "Output");

  // API App node pins - these need to be created when the component is selected
  const createAppPins = (
    selectedComponent: IApiComponent | undefined
  ): {
    inputs: Pin[];
    outputs: Pin[];
    executionInputs: Pin[];
    executionOutputs: Pin[];
  } => {
    if (!selectedComponent) {
      return {
        inputs: [],
        outputs: [],
        executionInputs: [],
        executionOutputs: [],
      };
    }

    // Create inputs based on the action's parameters
    const inputs =
      selectedComponent.actions[0]?.parameters?.map((param) => ({
        id: `input-${Date.now()}-${param.name}`,
        type: "input" as PinType,
        label: param.name,
        dataType: param.type as PinDataType,
        acceptsMultipleConnections: true,
      })) || [];
    const isOnEvent = selectedComponent.id === "onEvent";
    // Create a standard output
    const outputs = [
      {
        id: `output-${Date.now()}-result`,
        type: "output" as PinType,
        label: "Result",
        dataType: "object" as PinDataType,
      },
    ];

    // Single execution input for all
    const executionInputs = [
      {
        id: `exec-in-${Date.now()}`,
        type: "execution" as PinType,
        label: "In",
        acceptsMultipleConnections: true,
      },
    ];

    // Execution outputs: onEvent has both Success and Error pins; others only Success
    const executionOutputs = isOnEvent
      ? [
          {
            id: `exec-success-${Date.now()}`,
            type: "execution" as PinType,
            label: "Success",
            acceptsMultipleConnections: true,
          },
          {
            id: `exec-error-${Date.now()}`,
            type: "execution" as PinType,
            label: "Error",
            acceptsMultipleConnections: true,
          },
        ]
      : [
          {
            id: `exec-out-${Date.now()}`,
            type: "execution" as PinType,
            label: "Success",
            acceptsMultipleConnections: true,
          },
        ];

    return {
      inputs,
      outputs,
      executionInputs,
      executionOutputs,
    };
  };

  // Initialize the API component service and dynamically update available apps
  useEffect(() => {
    const apiService = ApiComponentService.getInstance();
    apiService.setApiContext(apiContext);

    // Helper to refresh app list
    const updateApps = () => {
      const apps = apiService.getAvailableApps();
      setAvailableApps(apps);
    };

    // Initial load of apps
    updateApps();

    // Update on component registration/unregistration
    const unsubscribeReg = eventBus.subscribe(
      "api:component:registered",
      updateApps
    );
    const unsubscribeUnreg = eventBus.subscribe(
      "api:component:unregistered",
      updateApps
    );

    return () => {
      unsubscribeReg();
      unsubscribeUnreg();
    };
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

  // Add keyboard event handler for Escape key to close menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle adding a basic node
  const handleAddBasicNode = () => {
    if (!nodeName.trim() || !endpoint.trim()) return;

    const newNode: Node = {
      id: `rest-node-${Date.now()}`,
      type: "apiNode",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: {
        label: nodeName,
        endpoint: endpoint,
        description: "REST API Node",
        inputs: [basicNodeInputPin, maxTimePin],
        outputs: [basicNodeOutputPin],
        executionInputs: [basicNodeExecInputPin],
        executionOutputs: [successExecOutputPin, failExecOutputPin],
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

    // Create pins for the app node
    const pins = createAppPins(selectedComponent);

    // Create an app node with information from the selected component
    const nodeData: ApiAppNodeData = {
      label: selectedComponent.type,
      endpoint: selectedComponent.path,
      description: selectedComponent.description,
      componentId: selectedComponent.id,
      appId: selectedAppId,
      inputs: pins.inputs,
      outputs: pins.outputs,
      executionInputs: pins.executionInputs,
      executionOutputs: pins.executionOutputs,
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
        executionOutputs: [beginWorkflowNextPin],
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
        outputs: [stringValuePin],
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
        outputs: [numberValuePin],
      },
    };

    onAddNode(newNode);
    setNumberValue(0);
    setIsOpen(false);
  };

  // Handle adding a data type conversion node
  const handleAddDataTypeConversionNode = () => {
    const nodeData: DataTypeConversionNodeData = {
      label: `Convert ${inputDataType} to ${outputDataType}`,
      inputDataType: inputDataType,
      outputDataType: outputDataType,
      inputs: [typeCoverterInputPin],
      outputs: [typeCoverterOutputPin],
    };

    const newNode: Node = {
      id: `data-convert-${Date.now()}`,
      type: "dataTypeConversion",
      position: {
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 50,
      },
      data: nodeData as unknown as Record<string, unknown>,
    };

    onAddNode(newNode);
    setIsOpen(false);
  };

  // Render the App Node creation form
  const renderAppNodeForm = () => {
    return (
      <div className="menu-section">
        <h4 className="text-primary font-medium mb-3">API App Node</h4>

        <div className="mb-3">
          <label className="block text-gray-300 text-sm mb-1">App</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
          >
            <option value="">Select an app...</option>
            {availableApps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAppId && (
          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">
              Component
            </label>
            <select
              value={selectedComponentId}
              onChange={(e) => setSelectedComponentId(e.target.value)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            >
              <option value="">Select a component...</option>
              {appComponents.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.name || component.type}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleAddAppNode}
          disabled={!selectedAppId || !selectedComponentId}
          className={`w-full px-3 py-1 ${
            !selectedAppId || !selectedComponentId
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-primary rounded`}
        >
          Add API App Node
        </button>
      </div>
    );
  };

  // Render the Basic node creation form
  const renderBasicNodeForm = () => {
    return (
      <div className="menu-section">
        <h4 className="text-primary font-medium mb-3">REST API Node</h4>

        <div className="mb-3 text-sm text-gray-300">
          <p>Creates a REST API call node with:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Execution pin for triggering the call</li>
            <li>"Success" execution output for successful API calls</li>
            <li>"Fail" execution output for failed or timed-out calls</li>
            <li>maxTime input for setting timeout in milliseconds</li>
            <li>Result output with the API response data</li>
          </ul>
        </div>

        <div className="mb-3">
          <label className="block text-gray-300 text-sm mb-1">Name</label>
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            placeholder="Node name"
          />
        </div>

        <div className="mb-3">
          <label className="block text-gray-300 text-sm mb-1">
            Endpoint URL
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            placeholder="https://api.example.com/endpoint"
          />
        </div>

        <button
          onClick={handleAddBasicNode}
          disabled={!nodeName || !endpoint}
          className={`w-full px-3 py-1 ${
            !nodeName || !endpoint
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-primary rounded`}
        >
          Add REST API Node
        </button>
      </div>
    );
  };

  // Render primitive node form
  const renderPrimitiveNodeForm = () => {
    return (
      <>
        <div className="menu-section">
          <h4 className="text-primary font-medium mb-3">
            {primitiveType === "string"
              ? "String Primitive"
              : "Number Primitive"}
          </h4>

          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">Type</label>
            <select
              value={primitiveType}
              onChange={(e) =>
                setPrimitiveType(e.target.value as "string" | "number")
              }
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
            </select>
          </div>

          {primitiveType === "string" ? (
            <div className="mb-3">
              <label className="block text-gray-300 text-sm mb-1">Value</label>
              <input
                type="text"
                value={stringValue}
                onChange={(e) => setStringValue(e.target.value)}
                className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
                placeholder="Enter string value"
              />
            </div>
          ) : (
            <div className="mb-3">
              <label className="block text-gray-300 text-sm mb-1">Value</label>
              <input
                type="number"
                value={numberValue}
                onChange={(e) => setNumberValue(Number(e.target.value))}
                className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
              />
            </div>
          )}

          <button
            onClick={
              primitiveType === "string"
                ? handleAddStringPrimitiveNode
                : handleAddNumberPrimitiveNode
            }
            className="mt-2 w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 text-primary rounded"
          >
            Add {primitiveType === "string" ? "String" : "Number"} Primitive
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-600">
          <h4 className="text-primary font-medium mb-3">Type Converter</h4>

          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">
              Input Type
            </label>
            <select
              value={inputDataType}
              onChange={(e) => setInputDataType(e.target.value as PinDataType)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-gray-300 text-sm mb-1">
              Output Type
            </label>
            <select
              value={outputDataType}
              onChange={(e) => setOutputDataType(e.target.value as PinDataType)}
              className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] rounded text-primary"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
            </select>
          </div>

          <button
            onClick={handleAddDataTypeConversionNode}
            className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 text-primary rounded"
          >
            Add Type Converter
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
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: 'linear-gradient(to bottom, #0ea5e9, #0284c7)',
              border: '1px solid #0369a1',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }}
          >
            Add REST API Node
          </button>
          <button
            onClick={() => {
              setIsOpen(true);
              setNodeMode("app");
            }}
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: 'linear-gradient(to bottom, #16a34a, #15803d)',
              border: '1px solid #166534',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }}
          >
            Add App API Node
          </button>
          <button
            onClick={() => {
              setIsOpen(true);
              setNodeMode("primitive");
            }}
            className="px-4 py-2 text-white rounded-md shadow-lg transition-all"
            style={{
              background: 'linear-gradient(to bottom, #8B5CF6, #7C3AED)',
              border: '1px solid #6D28D9',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              boxShadow: `
                inset 0 1px 0 rgba(255,255,255,0.3),
                inset 0 -1px 0 rgba(0,0,0,0.3),
                0 2px 4px rgba(0,0,0,0.3)
              `
            }}
          >
            Add Primitive
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-md shadow-xl w-64"
          style={{
            background: 'linear-gradient(to bottom, #4a4a4a, #2a2a2a)',
            border: '2px solid #1a1a1a',
            boxShadow: `
              inset 0 1px 0 rgba(255,255,255,0.2),
              inset 0 -1px 0 rgba(0,0,0,0.3),
              inset 1px 0 0 rgba(255,255,255,0.1),
              inset -1px 0 0 rgba(0,0,0,0.2),
              0 4px 8px rgba(0,0,0,0.4)
            `
          }}>
          {/* Header with title and close button */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {nodeMode === "basic"
                ? "Add REST API Node"
                : nodeMode === "app"
                ? "Add App API Node"
                : "Add Primitive Node"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded"
              style={{
                fontSize: '18px',
                lineHeight: '1',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close menu"
            >
              ✕
            </button>
          </div>

          {/* Tabs to switch between node types */}
          <div className="flex mb-4 rounded overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
              border: '1px solid #444',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)'
            }}>
            <button
              className="flex-1 py-1 text-sm text-white transition-all"
              style={{
                background: nodeMode === "basic" 
                  ? 'linear-gradient(to bottom, #0ea5e9, #0284c7)'
                  : 'transparent',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                opacity: nodeMode === "basic" ? 1 : 0.7
              }}
              onClick={() => setNodeMode("basic")}
            >
              REST API
            </button>
            <button
              className="flex-1 py-1 text-sm text-white transition-all"
              style={{
                background: nodeMode === "app" 
                  ? 'linear-gradient(to bottom, #16a34a, #15803d)'
                  : 'transparent',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                opacity: nodeMode === "app" ? 1 : 0.7
              }}
              onClick={() => setNodeMode("app")}
            >
              App API
            </button>
            <button
              className="flex-1 py-1 text-sm text-white transition-all"
              style={{
                background: nodeMode === "primitive" 
                  ? 'linear-gradient(to bottom, #8B5CF6, #7C3AED)'
                  : 'transparent',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                opacity: nodeMode === "primitive" ? 1 : 0.7
              }}
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
                disabled={hasBeginWorkflowNode}
                className={`menu-button w-full px-3 py-1 ${
                  hasBeginWorkflowNode
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-primary rounded`}
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

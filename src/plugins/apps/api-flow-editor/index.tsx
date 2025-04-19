import '@xyflow/react/dist/style.css';

import React, { useEffect, useState } from 'react';

import FlowEditor from '../../../features/workflow-editor/FlowEditor';
import { Plugin, PluginManifest } from '../../types';

// Define the plugin manifest
export const manifest: PluginManifest = {
  id: "api-flow-editor",
  name: "API Flow Editor",
  version: "1.0.0",
  description: "Blueprints-style visual editor for API workflows",
  author: "Desktop Dreamscape Team",
  icon: (
    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      FE
    </div>
  ),
  entry: "apps/api-flow-editor",
  preferredSize: {
    width: 1200,
    height: 800,
  },
};

// Main component for the API Flow Editor
const ApiFlowEditorComponent: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  // Ensure React Flow has been initialized properly
  useEffect(() => {
    // Any setup needed for the flow editor
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="api-flow-editor h-full flex flex-col bg-[#1A1F2C] text-gray-200">
      {/* Help modal */}
      {showHelp && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#2D3748] rounded-lg p-6 max-w-2xl shadow-xl border border-[#4A5568]">
            <h2 className="text-xl font-bold text-white mb-4">
              API Flow Editor Help
            </h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Getting Started
              </h3>
              <ul className="list-disc pl-5 text-gray-300">
                <li className="mb-1">
                  Click "Add API Node" to create a new node
                </li>
                <li className="mb-1">Drag from a pin to connect nodes</li>
                <li className="mb-1">
                  Execution pins (white boxes) control flow
                </li>
                <li className="mb-1">Input pins (left) accept data</li>
                <li className="mb-1">Output pins (right) provide data</li>
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Keyboard Shortcuts
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-gray-300">
                <li className="mb-1">
                  <span className="text-white font-mono">Delete</span>: Remove
                  selected node
                </li>
                <li className="mb-1">
                  <span className="text-white font-mono">Drag + Shift</span>:
                  Select multiple nodes
                </li>
                <li className="mb-1">
                  <span className="text-white font-mono">Mousewheel</span>: Zoom
                  in/out
                </li>
                <li className="mb-1">
                  <span className="text-white font-mono">Space + Drag</span>:
                  Pan canvas
                </li>
              </ul>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={() => setShowHelp(false)}
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* Main editor area */}
      <div className="flex-grow overflow-hidden">
        <FlowEditor />
      </div>
    </div>
  );
};

// Create the plugin object
const ApiFlowEditorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("API Flow Editor plugin initialized");
    // Any initialization needed for the flow editor
  },
  onOpen: () => {
    console.log("API Flow Editor window opened");
  },
  onClose: () => {
    console.log("API Flow Editor window closed");
  },
  render: () => {
    return <ApiFlowEditorComponent />;
  },
};

export default ApiFlowEditorPlugin;

import React, { memo } from 'react';

import { NodeProps, Position } from '@xyflow/react';

import { ApiNodeData } from '../types/flowTypes';
import ExecutionPin from './ExecutionPin';
import InputPin from './InputPin';
import OutputPin from './OutputPin';

// Define the correct props type for our node
interface ApiNodeProps {
  id: string;
  data: ApiNodeData;
  isConnectable: boolean;
}

const ApiNode = ({ id, data, isConnectable }: ApiNodeProps) => {
  return (
    <div className="api-node rounded-md overflow-hidden shadow-lg bg-[#2D3748] border-2 border-[#4A5568] min-w-[250px]">
      {/* Header section with title */}
      <div className="node-header px-3 py-2 bg-[#1A202C] text-primary font-bold flex items-center justify-between">
        <span className="text-sm truncate">{data.label}</span>
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
          <div className="text-center text-sm text-gray-300">REST API</div>
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

      {/* Footer with additional info if needed */}
      {data.description && (
        <div className="node-footer px-3 py-1 bg-[#1A202C] text-xs text-gray-400 border-t border-[#4A5568]">
          {data.description}
        </div>
      )}
    </div>
  );
};

export default memo(ApiNode);


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
      <div className="node-header px-3 py-2 bg-[#1A202C] text-white font-bold flex items-center justify-between">
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

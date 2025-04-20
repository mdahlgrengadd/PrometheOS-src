import React, { memo } from 'react';

import { Position } from '@xyflow/react';

import { Pin } from '../types/flowTypes';
import ExecutionPin from './ExecutionPin';

interface BeginWorkflowNodeProps {
  id: string;
  data: {
    label: string;
    executionOutputs: Pin[];
  };
  isConnectable: boolean;
}

const BeginWorkflowNode = ({
  id,
  data,
  isConnectable,
}: BeginWorkflowNodeProps) => {
  return (
    <div className="begin-workflow-node rounded-md overflow-hidden shadow-lg bg-[#2D3748] border-2 border-green-600 min-w-[200px]">
      {/* Header */}
      <div className="node-header px-3 py-2 bg-green-600 text-white font-bold flex items-center justify-between">
        <span className="text-sm truncate">
          {data.label || "Begin Workflow"}
        </span>
      </div>

      {/* Node content */}
      <div className="node-content flex p-2">
        <div className="flex-grow text-center py-2 text-sm text-gray-300">
          Starting point for workflow execution
        </div>

        {/* Right execution pins (output) */}
        <div className="right-pins-container flex flex-col gap-3 py-3 pl-3 pr-0">
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
    </div>
  );
};

export default memo(BeginWorkflowNode);

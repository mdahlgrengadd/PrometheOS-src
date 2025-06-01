import React, { memo } from "react";

import { Position } from "@xyflow/react";

import { Pin } from "../types/flowTypes";
import ExecutionPin from "./ExecutionPin";

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
    <div className="workflow-node-base">
      {/* Header */}
      <div className="node-header" style={{
        background: 'linear-gradient(to bottom, #16a34a, #15803d)',
        border: '1px solid #166534'
      }}>
        <span className="text-sm truncate">
          {data.label || "Begin Workflow"}
        </span>
      </div>
      {/* Node content */}
      <div className="node-content">
        <div className="node-center-content text-center text-sm text-gray-300">
          {/* Starting point for workflow execution*/}
        </div>
        {/* Right execution pins (output) */}
        <div className="right-pins-container">
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

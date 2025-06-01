import React, { memo } from "react";

import { Node, Position, useReactFlow } from "@xyflow/react";

import { Pin, StringPrimitiveNodeData } from "../types/flowTypes";
import OutputPin from "./OutputPin";

interface StringPrimitiveNodeProps {
  id: string;
  data: StringPrimitiveNodeData;
  isConnectable: boolean;
}

const StringPrimitiveNode = ({
  id,
  data,
  isConnectable,
}: StringPrimitiveNodeProps) => {
  const { setNodes } = useReactFlow();

  // Update the string value
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update node data
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              value: newValue,
            },
          };
        }
        return node;
      })
    );
  };

  // Prevent key events from bubbling up to React Flow when input is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation for all key events when typing in input
    e.stopPropagation();
  };

  return (
    <div className="workflow-node-base">
      {/* Header */}
      <div className="node-header" style={{
        background: 'linear-gradient(to bottom, #8B5CF6, #7C3AED)',
        border: '1px solid #6D28D9'
      }}>
        <span className="text-sm truncate">{data.label || "String Value"}</span>
      </div>
      {/* Node content */}
      <div className="node-content">
        {/* Center content with input field */}
        <div className="node-center-content">
          <input
            type="text"
            value={data.value}
            onChange={handleValueChange}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] text-primary rounded"
            placeholder="Enter string value..."
          />
        </div>
        {/* Right side pin container with output pins */}
        <div className="right-pins-container">
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
    </div>
  );
};

export default memo(StringPrimitiveNode);

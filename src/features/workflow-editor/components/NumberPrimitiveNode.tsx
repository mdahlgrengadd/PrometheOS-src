import React, { memo } from 'react';

import { Node, Position, useReactFlow } from '@xyflow/react';

import { NumberPrimitiveNodeData, Pin } from '../types/flowTypes';
import OutputPin from './OutputPin';

interface NumberPrimitiveNodeProps {
  id: string;
  data: NumberPrimitiveNodeData;
  isConnectable: boolean;
}

const NumberPrimitiveNode = ({
  id,
  data,
  isConnectable,
}: NumberPrimitiveNodeProps) => {
  const { setNodes } = useReactFlow();

  // Update the number value
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);

    // Only update if it's a valid number
    if (!isNaN(newValue)) {
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
    }
  };

  return (
    <div className="primitive-node number-primitive rounded-md overflow-hidden shadow-lg bg-[#2D3748] border-2 border-green-600 min-w-[200px]">
      {/* Header */}
      <div className="node-header px-3 py-2 bg-green-600 text-primary font-bold flex items-center justify-between">
        <span className="text-sm truncate">{data.label || "Number Value"}</span>
      </div>

      {/* Node content */}
      <div className="node-content flex p-3">
        {/* Center content with input field */}
        <div className="flex-grow flex items-center justify-center">
          <input
            type="number"
            value={data.value}
            onChange={handleValueChange}
            className="w-full px-2 py-1 bg-[#1A202C] border border-[#4A5568] text-primary rounded"
            placeholder="Enter number value..."
            step="0.1"
          />
        </div>

        {/* Right side pin container with output pins */}
        <div className="right-pins-container flex flex-col gap-3 pl-3 pr-0">
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

export default memo(NumberPrimitiveNode);

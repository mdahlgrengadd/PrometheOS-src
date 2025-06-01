import React, { memo } from "react";

import { NodeProps } from "@xyflow/react";

import { Pin } from "../types/flowTypes";
import InputPin from "./InputPin";
import OutputPin from "./OutputPin";

export interface DataTypeConversionNodeData {
  label: string;
  inputDataType: string;
  outputDataType: string;
  inputs: Pin[];
  outputs: Pin[];
}

interface DataTypeConversionNodeProps {
  id: string;
  data: DataTypeConversionNodeData;
  isConnectable: boolean;
}

const DataTypeConversionNode = memo(
  ({ id, data, isConnectable }: DataTypeConversionNodeProps) => {
    return (
      <div className="workflow-node-base">
        {/* Header */}
        <div
          className="node-header"
          style={{
            background: "linear-gradient(to bottom, #8B5CF6, #7C3AED)",
            border: "1px solid #6D28D9",
          }}
        >
          <span className="text-sm truncate">{data.label}</span>
        </div>

        {/* Node content */}
        <div className="node-content">
          {/* Left pins container - input pins */}
          <div className="left-pins-container">
            {data.inputs.map((pin) => (
              <InputPin
                key={pin.id}
                pin={pin}
                nodeId={id}
                isConnectable={isConnectable}
              />
            ))}
          </div>

          {/* Center content */}
          <div className="node-center-content text-center">
            <div className="text-xs text-gray-300 mb-1">
              Convert {data.inputDataType} to {data.outputDataType}
            </div>
          </div>

          {/* Right pins container - output pins */}
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
  }
);

export default DataTypeConversionNode;

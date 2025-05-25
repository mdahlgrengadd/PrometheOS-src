import React from "react";

import { Handle, Position } from "@xyflow/react";

import { Pin, PinDataType } from "../types/flowTypes";

interface OutputPinProps {
  pin: Pin;
  nodeId: string;
  isConnectable: boolean;
}

// Helper function to get pin color based on data type
const getPinColorClass = (dataType?: PinDataType): string => {
  switch (dataType) {
    case "string":
      return "bg-purple-500 border-purple-600";
    case "number":
      // Check if it's an integer or float - defaulting to orange for now
      return "bg-orange-500 border-orange-600";
    case "boolean":
      return "bg-red-500 border-red-600";
    case "object":
      return "bg-blue-500 border-blue-600";
    case "array":
      return "bg-pink-500 border-pink-600";
    default:
      return "bg-gray-400 border-gray-500";
  }
};

const OutputPin = ({ pin, nodeId, isConnectable }: OutputPinProps) => {
  const handleId = `${pin.id}`;
  const colorClass = getPinColorClass(pin.dataType);

  return (
    <div className="output-pin flex items-center justify-end my-1 relative">
      {" "}
      <div className="pin-label text-xs text-gray-300 font-mono mr-5">
        {pin.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={handleId}
        isConnectable={isConnectable}
        className={`w-5 h-5 rounded-full border-2 ${colorClass}`}
        style={{ zIndex: 100 }}
        data-pin-type={pin.type}
        data-pin-data-type={pin.dataType || "unknown"}
      />
    </div>
  );
};

export default OutputPin;

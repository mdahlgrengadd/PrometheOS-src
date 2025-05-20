import React from 'react';

import { Handle, Position } from '@xyflow/react';

import { Pin, PinDataType } from '../types/flowTypes';

interface InputPinProps {
  pin: Pin;
  nodeId: string;
  isConnectable: boolean;
}

// Helper function to get pin color based on data type
const getPinColorClass = (dataType?: PinDataType): string => {
  switch (dataType) {
    case "string":
      return "bg-green-400 border-green-500";
    case "number":
      return "bg-blue-400 border-blue-500";
    case "boolean":
      return "bg-yellow-400 border-yellow-500";
    case "object":
      return "bg-purple-400 border-purple-500";
    case "array":
      return "bg-pink-400 border-pink-500";
    default:
      return "bg-gray-400 border-gray-500";
  }
};

const InputPin = ({ pin, nodeId, isConnectable }: InputPinProps) => {
  const handleId = `${pin.id}`;
  const colorClass = getPinColorClass(pin.dataType);

  return (
    <div className="input-pin flex items-center my-1 relative">
      <Handle        type="target"
        position={Position.Left}
        id={handleId}
        isConnectable={isConnectable}
        className={`w-5 h-5 rounded-full border-2 ${colorClass}`}
        style={{ zIndex: 100 }}
        data-pin-type={pin.type}
        data-pin-data-type={pin.dataType || "unknown"}
      />      <div className="pin-label text-xs text-gray-300 font-mono ml-5">
        {pin.label}
      </div>
    </div>
  );
};

export default InputPin;

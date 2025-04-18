
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Pin } from '../types/flowTypes';

interface InputPinProps {
  pin: Pin;
  nodeId: string;
  isConnectable: boolean;
}

const InputPin = ({ pin, nodeId, isConnectable }: InputPinProps) => {
  const handleId = `${pin.id}`;
  
  // Choose color based on data type
  const getPinColor = (dataType?: string) => {
    switch (dataType) {
      case 'string': return 'bg-blue-400 border-blue-500';
      case 'number': return 'bg-green-400 border-green-500';
      case 'boolean': return 'bg-red-400 border-red-500';
      case 'object': return 'bg-purple-400 border-purple-500';
      case 'array': return 'bg-yellow-400 border-yellow-500';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  return (
    <div className="input-pin flex items-center my-2">
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        isConnectable={isConnectable}
        className={`w-3 h-3 rounded-full ${getPinColor(pin.dataType)}`}
      />
      <div className="pin-label text-xs text-gray-300 font-mono ml-2">
        {pin.label}
      </div>
    </div>
  );
};

export default InputPin;

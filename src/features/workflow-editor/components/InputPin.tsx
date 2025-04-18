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

  return (
    <div className="input-pin flex items-center my-3 relative">
      <Handle
        type="target"
        position={Position.Left}
        id={handleId}
        isConnectable={isConnectable}
        className="w-4 h-4 rounded-full border-2 bg-purple-400 border-purple-500"
        style={{ zIndex: 100 }}
      />
      <div className="pin-label text-xs text-gray-300 font-mono ml-2">
        {pin.label}
      </div>
    </div>
  );
};

export default InputPin;

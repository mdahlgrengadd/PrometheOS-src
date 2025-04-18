import React from 'react';

import { Handle, Position } from '@xyflow/react';

import { Pin } from '../types/flowTypes';

interface OutputPinProps {
  pin: Pin;
  nodeId: string;
  isConnectable: boolean;
}

const OutputPin = ({ pin, nodeId, isConnectable }: OutputPinProps) => {
  const handleId = `${pin.id}`;

  return (
    <div className="output-pin flex items-center justify-end my-3 relative">
      <div className="pin-label text-xs text-gray-300 font-mono mr-2">
        {pin.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id={handleId}
        isConnectable={isConnectable}
        className="w-4 h-4 rounded-full border-2 bg-purple-400 border-purple-500"
        style={{ zIndex: 100 }}
      />
    </div>
  );
};

export default OutputPin;

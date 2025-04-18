
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Pin } from '../types/flowTypes';

interface ExecutionPinProps {
  pin: Pin;
  position: Position;
  nodeId: string;
  isConnectable: boolean;
}

const ExecutionPin = ({ pin, position, nodeId, isConnectable }: ExecutionPinProps) => {
  const handleId = `${pin.id}`;
  
  return (
    <div className="execution-pin flex items-center my-2 relative">
      <Handle
        type={position === Position.Left ? 'target' : 'source'}
        position={position}
        id={handleId}
        isConnectable={isConnectable}
        className="execution-handle w-3 h-3 bg-white border-2 border-white rounded-sm"
        style={{ zIndex: 100 }}
      />
      <div className={`execution-label text-xs text-white font-mono font-bold ml-1 ${position === Position.Right ? 'text-right mr-1' : ''}`}>
        {pin.label}
      </div>
    </div>
  );
};

export default ExecutionPin;

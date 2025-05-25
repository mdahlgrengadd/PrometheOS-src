import React from "react";

import { Handle, Position } from "@xyflow/react";

import { Pin } from "../types/flowTypes";

interface ExecutionPinProps {
  pin: Pin;
  position: Position;
  nodeId: string;
  isConnectable: boolean;
}

const ExecutionPin = ({
  pin,
  position,
  nodeId,
  isConnectable,
}: ExecutionPinProps) => {
  const handleId = `${pin.id}`;

  return (
    <div className="execution-pin flex items-center my-1 relative">
      {" "}
      <Handle
        type={position === Position.Left ? "target" : "source"}
        position={position}
        id={handleId}
        isConnectable={isConnectable}
        className="execution-handle w-5 h-5 bg-white border-2 border-gray-300 rounded-full"
        style={{ zIndex: 100 }}
        data-pin-type="execution"
      />
      <div
        className={`execution-label text-xs text-primary font-mono font-bold ${
          position === Position.Right ? "mr-5 ml-5" : "ml-5 mr-5"
        }`}
      >
        {pin.label}
      </div>
    </div>
  );
};

export default ExecutionPin;

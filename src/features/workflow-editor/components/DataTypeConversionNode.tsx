import React, { memo } from 'react';

import { NodeProps } from '@xyflow/react';

import { Pin } from '../types/flowTypes';
import InputPin from './InputPin';
import OutputPin from './OutputPin';

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
      <div className="py-2 px-4 rounded-md border-2 border-gray-600 bg-gray-800 min-w-[180px]">
        <div className="font-medium text-white text-center mb-2">
          {data.label}
        </div>
        <div className="text-xs text-gray-400 text-center mb-2">
          Convert {data.inputDataType} to {data.outputDataType}
        </div>

        <div className="border-t border-gray-600 my-2"></div>

        {/* Input Pins */}
        <div className="input-pins">
          {data.inputs.map((pin) => (
            <InputPin
              key={pin.id}
              pin={pin}
              nodeId={id}
              isConnectable={isConnectable}
            />
          ))}
        </div>

        <div className="border-t border-gray-600 my-2"></div>

        {/* Output Pins */}
        <div className="output-pins">
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
    );
  }
);

export default DataTypeConversionNode;

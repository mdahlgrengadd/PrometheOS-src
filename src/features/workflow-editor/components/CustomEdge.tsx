import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Set color based on whether it's an execution edge or data edge
  const isExecution = data?.isExecution;
  const edgeColor = isExecution 
    ? 'white' 
    : '#4D9CEF'; // Default to blue data flow for now
  
  const strokeWidth = isExecution ? 2 : 3;
  const strokeDasharray = isExecution ? '5, 5' : '';

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: edgeColor,
        strokeWidth,
        strokeDasharray,
      }}
    />
  );
}

export default CustomEdge;

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

  // Determine if this is an execution edge
  const isExecution = data?.isExecution;

  // Set color and style based on pin type
  let edgeColor = "#A78BFA"; // Default to purple for value connections
  let strokeWidth = 3; // Default to thicker for value connections
  let strokeDasharray = ""; // Default to solid for value connections

  if (isExecution) {
    edgeColor = "white"; // White for execution connections
    strokeWidth = 2; // Slightly thinner for execution
    strokeDasharray = "5, 5"; // Dashed pattern for execution
  }

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

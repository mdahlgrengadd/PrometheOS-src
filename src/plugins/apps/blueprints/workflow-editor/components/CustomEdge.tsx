import React from "react";

import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react";

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
  selected,
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
  const dataType = data?.dataType;

  // Set color and style based on pin type
  let edgeColor = "#A78BFA"; // Default to purple for value connections
  let strokeWidth = 2; // Default width
  let strokeDasharray = ""; // Default to solid for value connections

  // Apply selection styles
  if (selected) {
    edgeColor = "#ffff00"; // Yellow when selected for blueprint style
    strokeWidth = 5; // Thicker when selected
  } else if (isExecution) {
    edgeColor = "white"; // White for execution connections
    strokeDasharray = "5, 5"; // Dashed pattern for execution
  } else if (dataType) {
    // Data edge with specific type
    switch (dataType) {
      case "string":
        edgeColor = "#8B5CF6"; // Purple for string
        break;
      case "number":
      case "integer":
        edgeColor = "#F97316"; // Orange for numbers/integers
        break;
      case "float":
        edgeColor = "#22C55E"; // Green for floats
        break;
      case "boolean":
        edgeColor = "#EF4444"; // Red for boolean
        break;
      case "object":
        edgeColor = "#3B82F6"; // Blue for objects
        break;
      case "array":
        edgeColor = "#EC4899"; // Pink for arrays
        break;
      default:
        edgeColor = "#A78BFA"; // Default purple
    }
    strokeDasharray = ""; // Solid for data connections
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth,
          strokeDasharray,
          /* transition removed for immediate response during node dragging */
          filter: selected 
            ? 'drop-shadow(0px 0px 8px #ffff00) drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' 
            : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8)) drop-shadow(0px 0px 3px rgba(255,255,255,0.2))',
          strokeLinecap: 'round'
        }}
      />
      {/* Add interactive hitbox for better edge selection */}
      <path
        id={id}
        className="react-flow__edge-interaction"
        d={edgePath}
        strokeWidth={12}
        stroke="transparent"
        fill="none"
      />
    </>
  );
}

export default CustomEdge;

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
    edgeColor = "#F56565"; // Red when selected
    strokeWidth = 3; // Thicker when selected
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
          transition: "stroke-width 0.2s, stroke 0.2s",
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

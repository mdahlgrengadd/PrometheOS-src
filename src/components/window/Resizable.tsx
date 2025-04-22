import React from "react";

import { DragEndEvent, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface ResizableProps {
  onResizeStart: () => void;
  onResizeEnd: (event: DragEndEvent, direction: string) => void;
  isResizing: boolean;
}

// Handle directions
const resizeHandles = [
  {
    id: "bottom-right",
    className: "resize-handle-br",
    direction: "bottom-right",
  },
  {
    id: "bottom-left",
    className: "resize-handle-bl",
    direction: "bottom-left",
  },
  { id: "top-right", className: "resize-handle-tr", direction: "top-right" },
  { id: "top-left", className: "resize-handle-tl", direction: "top-left" },
  { id: "right", className: "resize-handle-r", direction: "right" },
  { id: "left", className: "resize-handle-l", direction: "left" },
  { id: "bottom", className: "resize-handle-b", direction: "bottom" },
  { id: "top", className: "resize-handle-t", direction: "top" },
];

export const Resizable: React.FC<ResizableProps> = ({
  onResizeStart,
  onResizeEnd,
  isResizing,
}) => {
  return (
    <>
      {resizeHandles.map(({ id, className, direction }) => (
        <ResizeHandle
          key={id}
          id={id}
          className={className}
          direction={direction}
          onResizeStart={onResizeStart}
          onResizeEnd={(e) => onResizeEnd(e, direction)}
          isResizing={isResizing}
        />
      ))}
    </>
  );
};

interface ResizeHandleProps {
  id: string;
  className: string;
  direction: string;
  onResizeStart: () => void;
  onResizeEnd: (event: DragEndEvent) => void;
  isResizing: boolean;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  id,
  className,
  direction,
  onResizeStart,
  onResizeEnd,
  isResizing,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `resize-${id}`,
    data: {
      direction,
    },
  });

  // Calculate the cursor based on the direction
  const getCursor = () => {
    switch (direction) {
      case "top-left":
      case "bottom-right":
        return "nwse-resize";
      case "top-right":
      case "bottom-left":
        return "nesw-resize";
      case "left":
      case "right":
        return "ew-resize";
      case "top":
      case "bottom":
        return "ns-resize";
      default:
        return "nwse-resize";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`resize-handle ${className}`}
      style={{
        cursor: getCursor(),
        transform: CSS.Translate.toString(transform),
        opacity: isResizing ? 0.5 : 0,
      }}
      {...listeners}
      {...attributes}
      onMouseDown={(e: React.MouseEvent) => {
        onResizeStart();
        // Let dnd-kit take over
        listeners.onMouseDown?.(e as unknown as React.PointerEvent);
      }}
      onMouseUp={(e: React.MouseEvent) => {
        onResizeEnd(e as unknown as DragEndEvent);
        // Let dnd-kit take over
        listeners.onMouseUp?.(e as unknown as React.PointerEvent);
      }}
    />
  );
};

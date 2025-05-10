import React from "react";

import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface WindowDndContextProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
}

export const WindowDndContext: React.FC<WindowDndContextProps> = ({
  children,
  onDragEnd,
  onDragCancel,
}) => {
  // Track whether a drag is in progress
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Configure sensors with proper settings for window dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Activate on slight movement to avoid accidental drags
      activationConstraint: {
        distance: 5, // 5px deadzone before drag starts
        tolerance: 5, // Allow 5px of movement in any direction
        delay: 50, // Small delay to prevent accidental drags
      },
    })
  );

  // Track drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  // Handle drag end events
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (onDragEnd) {
      onDragEnd(event);
    }
  };

  // Handle drag cancellation (e.g., by escape key or browser events)
  const handleDragCancel = (event: DragCancelEvent) => {
    setActiveId(null);
    if (onDragCancel) {
      onDragCancel(event);
    } else if (onDragEnd) {
      // Treat cancellation as a drag end if no specific handler
      onDragEnd({
        ...event,
        delta: { x: 0, y: 0 },
        over: null,
      } as unknown as DragEndEvent);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {/* This overlay allows for custom drag previews if needed */}
      <DragOverlay>
        {/* Nothing rendered by default, but could show a preview of the dragged window */}
      </DragOverlay>
    </DndContext>
  );
};

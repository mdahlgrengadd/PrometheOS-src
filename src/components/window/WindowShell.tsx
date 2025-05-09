import { DragHandlers, motion, PanInfo, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { WindowsWindow } from "@/components/windows/Window";
import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

import { Resizable } from "../window/Resizable";
import { WindowContent } from "./WindowContent";
import { WindowHeader } from "./WindowHeader";

interface WindowShellProps {
  id: string;
  title: string;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  isMaximized: boolean;
  isOpen: boolean;
  isMinimized: boolean;
  isFocused?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragEnd: (position: { x: number; y: number }) => void;
  onResize: (size: { width: number | string; height: number | string }) => void;
  children: React.ReactNode;
}

export const WindowShell: React.FC<WindowShellProps> = ({
  id,
  title,
  zIndex,
  position,
  size,
  isMaximized,
  isOpen,
  isMinimized,
  isFocused,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragEnd,
  onResize,
  children,
}) => {
  const { theme } = useTheme();
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });

  // Check if using a Windows theme
  const isWindowsTheme =
    theme === "win98" || theme === "winxp" || theme === "win7";

  // For framer-motion header dragging
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // For dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before resize activates
      },
    })
  );

  // Update motion values when position prop changes (but not during drag)
  useEffect(() => {
    if (!isDragging) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [position, isDragging, x, y]);

  // Update size when it changes from props
  useEffect(() => {
    if (windowRef.current && !isResizing) {
      if (typeof size.width === "number") {
        windowRef.current.style.width = `${size.width}px`;
      } else {
        windowRef.current.style.width = size.width;
      }

      if (typeof size.height === "number") {
        windowRef.current.style.height = `${size.height}px`;
      } else {
        windowRef.current.style.height = size.height;
      }
    }
  }, [size, isResizing]);

  // Handle header drag start
  const handleHeaderDragStart: DragHandlers["onDragStart"] = () => {
    setIsDragging(true);
    onFocus(); // Focus the window when starting to drag
  };

  // Handle header drag with the correct type signature for framer-motion
  const handleHeaderDrag: DragHandlers["onDrag"] = (event, info) => {
    // Update the window position based on the drag without constraints
    x.set(position.x + info.offset.x);
    y.set(position.y + info.offset.y);
  };

  // Handle header drag end
  const handleHeaderDragEnd: DragHandlers["onDragEnd"] = (_e, info) => {
    setIsDragging(false);

    // Clamp position to keep on screen
    if (windowRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = windowRef.current.getBoundingClientRect();

      const minVisibleWidth = Math.min(100, rect.width * 0.2);
      const minVisibleHeight = Math.min(50, rect.height * 0.2);

      // Calculate the new position based on the original position plus the drag offset
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;

      // Remove the top constraint entirely (allow negative values)
      const clampedX = Math.max(
        -rect.width + minVisibleWidth,
        Math.min(newX, viewportWidth - minVisibleWidth)
      );

      // Allow windows to reach the very top of the screen
      const clampedY = Math.min(newY, viewportHeight - minVisibleHeight);

      // Only update the store if position actually changed
      if (clampedX !== position.x || clampedY !== position.y) {
        // Set the motion values immediately for visual smoothness
        x.set(clampedX);
        y.set(clampedY);

        // Update store
        onDragEnd({ x: clampedX, y: clampedY });
      }
    }
  };
  // Handle dnd-kit resize start
  const handleDndResizeStart = (event: DragStartEvent) => {
    if (!windowRef.current) return;

    setIsResizing(true);
    onFocus();

    // Get the resize direction from the draggable's data
    const direction = event.active?.data?.current?.direction || null;
    setResizeDirection(direction);

    // Store initial window size
    const rect = windowRef.current.getBoundingClientRect();
    setInitialSize({
      width: rect.width,
      height: rect.height,
    });

    // Store initial mouse position
    setInitialMousePos({
      x: 0,
      y: 0,
    });

    // Make sure we're starting with the correct position
    x.set(position.x);
    y.set(position.y);
  };
  // Handle dnd-kit resize move
  const handleDndResizeMove = (event: DragMoveEvent) => {
    if (!windowRef.current || !resizeDirection) return;

    // Calculate the delta from the initial position
    const deltaX = event.delta.x;
    const deltaY = event.delta.y;

    let newWidth = initialSize.width;
    let newHeight = initialSize.height;

    // Adjust size based on direction
    if (resizeDirection.includes("right")) {
      newWidth = Math.max(320, initialSize.width + deltaX);
    } else if (resizeDirection.includes("left")) {
      newWidth = Math.max(320, initialSize.width - deltaX);
    }
    if (resizeDirection.includes("bottom")) {
      newHeight = Math.max(200, initialSize.height + deltaY);
    } else if (resizeDirection.includes("top")) {
      newHeight = Math.max(200, initialSize.height - deltaY);

      // When resizing from the top, also move the window to keep bottom edge fixed
      if (resizeDirection === "top" || resizeDirection.includes("top")) {
        // Calculate position based on the original position + delta to prevent cumulative movements
        y.set(position.y + deltaY);
      }
    }

    // Apply the new size
    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
  };
  // Handle dnd-kit resize end
  const handleDndResizeEnd = (event: DragEndEvent) => {
    if (!windowRef.current) return;

    setIsResizing(false);
    setResizeDirection(null);

    // Get the final size
    const rect = windowRef.current.getBoundingClientRect();
    onResize({
      width: rect.width,
      height: rect.height,
    });

    // If we were resizing from the top, we need to also finalize the position
    if (resizeDirection === "top" || resizeDirection?.includes("top")) {
      onDragEnd({
        x: x.get(),
        y: y.get(),
      });
    }
  };

  // Handle individual handle resize start from Resizable component
  const handleResizeStart = () => {
    setIsResizing(true);
    onFocus();
  };

  // Handle individual handle resize end from Resizable component
  const handleResizeEnd = (event: DragEndEvent, direction: string) => {
    setIsResizing(false);

    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      onResize({
        width: rect.width,
        height: rect.height,
      });
    }
  };
  // We don't need this function anymore as the movement is handled in handleDndResizeMove

  if (!isOpen || isMinimized) return null;

  // If using a Windows theme, render the WindowsWindow component
  if (isWindowsTheme) {
    return (
      <WindowsWindow
        id={id}
        title={title}
        zIndex={zIndex}
        position={position}
        size={size}
        isMaximized={isMaximized}
        isOpen={isOpen}
        isMinimized={isMinimized}
        isFocused={isFocused}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onFocus={onFocus}
        onDragEnd={onDragEnd}
        onResize={onResize}
      >
        {children}
      </WindowsWindow>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDndResizeStart}
      onDragMove={handleDndResizeMove}
      onDragEnd={handleDndResizeEnd}
    >
      <motion.div
        ref={windowRef}
        className={cn(
          "draggable-window",
          isMaximized && "maximized",
          isFocused && "ring-2 ring-primary/30",
          isDragging && "dragging",
          isResizing && "resizing"
        )}
        style={{
          zIndex,
          // When maximized, don't set width/height to let CSS anchors take over
          ...(isMaximized
            ? { x, y } // No width/height when maximized
            : { width: size.width, height: size.height, x, y }),
          willChange:
            isDragging || isResizing ? "transform, width, height" : "auto",
        }}
        // Only apply framer-motion drag to the entire window if maximized is false
        initial={false}
        animate={false}
      >
        {/* Header with drag capability through framer-motion */}
        <motion.div
          className={!isMaximized ? "window-drag-handle" : ""}
          onMouseDown={(e) => {
            if ((e.target as Element).closest(".window-controls")) {
              // clicking the controls → don't initiate a drag
              e.stopPropagation();
            }
          }}
          // Apply framer-motion drag only to the header
          {...(isMaximized
            ? {}
            : {
                drag: true,
                dragMomentum: false,
                dragElastic: 0,
                // Use dragConstraints to prevent dragging outside screen
                dragConstraints: { top: 0, left: 0, right: 0, bottom: 0 },
                // Handle drag events
                onDragStart: handleHeaderDragStart,
                onDrag: handleHeaderDrag,
                onDragEnd: handleHeaderDragEnd,
                // No transition for immediate response
                dragTransition: { power: 0 },
              })}
        >
          <WindowHeader
            title={title}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
            headerRef={headerRef}
            isMaximized={isMaximized}
          />
        </motion.div>
        <WindowContent>{children}</WindowContent>{" "}
        {/* Resizable handles through dnd-kit */}
        {!isMaximized && (
          <Resizable
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
            isResizing={isResizing}
          />
        )}
      </motion.div>
    </DndContext>
  );
};

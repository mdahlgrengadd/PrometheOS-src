import { DragHandlers, motion, MotionStyle, useMotionValue } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import "@/styles/unified-window.css";
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
import { useDragControls } from "framer-motion";

import { Resizable } from "./Resizable";
import { WindowContent } from "./WindowContent";
import { WindowHeader } from "./WindowHeader";

interface WindowShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  
  // Window state props
  zIndex?: number;
  position?: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  isMaximized?: boolean;
  isOpen?: boolean;
  isMinimized?: boolean;
  isFocused?: boolean;
  
  // Window behavior
  active?: boolean;
  activeOnHover?: boolean;
  activeTarget?: "window" | "titlebar";
  
  // Window controls
  controls?: Array<"minimize" | "maximize" | "close">;
  controlsPosition?: "left" | "right";
  
  // Event handlers
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number | string; height: number | string }) => void;
}

export const UnifiedWindowShellV2: React.FC<WindowShellProps> = ({
  id,
  title,
  children,
  className,
  
  // Window state props with defaults
  zIndex = 1,
  position = { x: 0, y: 0 },
  size = { width: "400px", height: "300px" },
  isMaximized = false,
  isOpen = true,
  isMinimized = false,
  isFocused = false,
  
  // Window behavior with defaults
  active = false,
  activeOnHover,
  activeTarget = "window",
  
  // Window controls with defaults
  controls = ["minimize", "maximize", "close"],
  controlsPosition = "right",
  
  // Event handlers with empty defaults
  onClose = () => {},
  onMinimize = () => {},
  onMaximize = () => {},
  onFocus = () => {},
  onDragEnd = () => {},
  onResize = () => {},
}) => {
  const { theme } = useTheme();
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  // Check if using a Windows theme
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  // For framer-motion dragging
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

  // If activeOnHover prop is undefined, use default behavior based on theme
  const shouldActivateOnHover =
    activeOnHover !== undefined ? activeOnHover : isWindowsTheme;

  // Set active state based on hover or explicit active prop
  const isActive = shouldActivateOnHover ? hovered : active;

  // Update motion values when position prop changes and not dragging
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
        windowRef.current.style.width = size.width.toString();
      }

      if (typeof size.height === "number") {
        windowRef.current.style.height = `${size.height}px`;
      } else {
        windowRef.current.style.height = size.height.toString();
      }
    }
  }, [size, isResizing]);

  // When maximized we want to snap the window to the top-left corner
  useEffect(() => {
    if (isMaximized) {
      // Reset position transform values so the window is rendered from top-left
      x.set(0);
      y.set(0);
    }
  }, [isMaximized, x, y]);

  // Handle header drag start
  const handleDragStart: DragHandlers["onDragStart"] = () => {
    setIsDragging(true);
    onFocus();
  };

  // Handle header drag with the correct type signature for framer-motion
  const handleDrag: DragHandlers["onDrag"] = (event, info) => {
    // Update the window position based on the drag without constraints
    x.set(position.x + info.offset.x);
    y.set(position.y + info.offset.y);
  };

  // Handle header drag end
  const handleDragEnd: DragHandlers["onDragEnd"] = (_e, info) => {
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

      // Only update if position actually changed
      if (clampedX !== position.x || clampedY !== position.y) {
        // Set the motion values immediately for visual smoothness
        x.set(clampedX);
        y.set(clampedY);

        // Update store via callback
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
    
    // Track if we need to update position
    let needPositionUpdate = false;
    let newX = position.x;
    let newY = position.y;
    
    // Adjust size based on direction
    if (resizeDirection.includes("right")) {
      newWidth = Math.max(320, initialSize.width + deltaX);
    } else if (resizeDirection.includes("left")) {
      newWidth = Math.max(320, initialSize.width - deltaX);

      // When resizing from the left, move window to keep right edge fixed
      if (resizeDirection === "left" || resizeDirection.includes("left")) {
        newX = position.x + deltaX;
        needPositionUpdate = true;
      }
    }
    
    if (resizeDirection.includes("bottom")) {
      newHeight = Math.max(200, initialSize.height + deltaY);
    } else if (resizeDirection.includes("top")) {
      newHeight = Math.max(200, initialSize.height - deltaY);

      // When resizing from the top, move window to keep bottom edge fixed
      if (resizeDirection === "top" || resizeDirection.includes("top")) {
        newY = position.y + deltaY;
        needPositionUpdate = true;
      }
    }

    // Apply the new size
    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
    
    // Apply position changes directly if needed
    if (needPositionUpdate) {
      // Use immediate positioning with no animation
      x.set(newX);
      y.set(newY);
      
      // Update DOM directly for immediate visual feedback
      windowRef.current.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    }
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

    // If we were resizing from the top or left, we need to also finalize the position
    if (
      resizeDirection === "top" ||
      resizeDirection?.includes("top") ||
      resizeDirection === "left" ||
      resizeDirection?.includes("left")
    ) {
      onDragEnd({
        x: x.get(),
        y: y.get(),
      });
    }
  };

  // Handle individual handle resize start
  const handleResizeStart = () => {
    setIsResizing(true);
    onFocus();
  };

  // Handle individual handle resize end
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

  const dragControls = useDragControls();

  if (!isOpen || isMinimized) return null;

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
        drag
        dragListener={false}
        dragControls={dragControls}
        className={cn(
          "unified-window",
          className,
          activeTarget === "window" && isActive && "active",
          isMaximized && "maximized",
          isFocused && "ring-2 ring-primary/30",
          isDragging && "dragging",
          isResizing && "resizing"
        )}
        onClick={() => {
          // Always focus the window when clicked
          if (!isFocused) {
            onFocus();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={(e) => {
          // Only start drag if the target or its ancestor has data-draggable="true"
          const isDraggableTarget = !!(e.target as Element).closest('[data-draggable="true"]');
          
          // Don't start drag when clicking controls
          const isControlsClick = !!(e.target as Element).closest('.window-controls');
          
          if (isDraggableTarget && !isControlsClick && !isMaximized) {
            // Add this to ensure window gets focus when dragging starts
            onFocus();
            
            // Start the drag operation
            dragControls.start(e);
            
            // Set drag state immediately for visual feedback
            setIsDragging(true);
          }
        }}
        dragMomentum={false}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        dragTransition={{ power: 0 }}
        style={{
          zIndex,
          willChange: isDragging || isResizing ? "transform, width, height" : "auto",
          ...(isMaximized
            ? { 
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
              }
            : { 
                position: "absolute",
                width: size.width, 
                height: size.height, 
              }),
          x, // Use this syntax for motion values
          y, // Use this syntax for motion values
        }}
      >
        {/* Header (now just a div, still draggable via data-draggable) */}
        <div
          ref={headerRef}
          className={cn(
            "window-header",
            "window-drag-handle", // Class for styling and to mark as draggable
            activeTarget === "titlebar" && isActive && "active"
          )}
          data-draggable="true"
          style={{
            cursor: "move",
            userSelect: "none", // Prevent text selection during drag
            touchAction: "none", // Prevent default touch actions
            pointerEvents: "auto", // Ensure pointer events work properly
            zIndex: 1, // Ensure the header is above the content
            position: "relative", // Establish a stacking context
          }}
        >
          <WindowHeader
            title={title}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
            headerRef={headerRef}
            isMaximized={isMaximized}
            controlsPosition={controlsPosition}
            controls={controls}
          />
        </div>
        
        {/* Window Content */}
        <WindowContent className={isWindowsTheme ? "has-scrollbar" : ""}>
          {children}
        </WindowContent>
        
        {/* Resize handles */}
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

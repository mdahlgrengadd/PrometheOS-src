import { DragHandlers, motion, useDragControls, useMotionValue } from 'framer-motion';
import React, { useRef } from 'react';

import { useTheme } from '@/lib/ThemeProvider';
import { cn } from '@/lib/utils';
import {
    DndContext, DragEndEvent, DragMoveEvent, DragStartEvent, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { Resizable } from '../shelley-wm/Resizable';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  controls?: Array<"minimize" | "maximize" | "close">;
  controlsPosition?: "left" | "right";
  width?: string;
  height?: string;
  // manually set active state (adds 'active' class)
  active?: boolean;
  // enable active state on hover
  activeOnHover?: boolean;
  // where to apply 'active' class: on window container or title-bar
  activeTarget?: "window" | "titlebar";
  // additional props needed for WindowShell integration
  id?: string;
  zIndex?: number;
  position?: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  isMaximized?: boolean;
  isOpen?: boolean;
  isMinimized?: boolean;
  isFocused?: boolean;
  onFocus?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onResize?: (size: {
    width: number | string;
    height: number | string;
  }) => void;
  hideWindowChrome?: boolean;
}

export function WindowsWindow({
  title,
  children,
  className,
  onClose,
  onMinimize,
  onMaximize,
  controls: controlList = ["minimize", "maximize", "close"], // ← renamed
  controlsPosition = "right",
  active = false,
  activeOnHover,
  activeTarget = "window",
  width = "400px",
  height = "auto",
  // WindowShell props
  id,
  zIndex,
  position,
  size,
  isMaximized = false,
  isOpen = true,
  isMinimized = false,
  isFocused,
  onFocus = () => {},
  onDragEnd = () => {},
  onResize = () => {},
  hideWindowChrome = false,
}: WindowProps) {
  const { theme } = useTheme();
  const [hovered, setHovered] = React.useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);
  // Motion values for controlled dragging
  const x = useMotionValue(position?.x || 0);
  const y = useMotionValue(position?.y || 0);

  // Resizing state and handlers
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeDirection, setResizeDirection] = React.useState<string | null>(
    null
  );
  const [initialSize, setInitialSize] = React.useState({ width: 0, height: 0 });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleResizeStart = () => {
    setIsResizing(true);
    if (onFocus) {
      onFocus();
    }
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setInitialSize({ width: rect.width, height: rect.height });
    }
  };
  const handleDndResizeStart = (event: DragStartEvent) => {
    const direction = event.active?.data?.current?.direction || null;
    setResizeDirection(direction);
    handleResizeStart();

    // Make sure we're starting with the correct position
    x.set(position?.x || 0);
    y.set(position?.y || 0);
  };
  const handleDndResizeMove = (event: DragMoveEvent) => {
    if (!windowRef.current || !resizeDirection) return;
    const deltaX = event.delta.x;
    const deltaY = event.delta.y;
    let newWidth = initialSize.width;
    let newHeight = initialSize.height;

    if (resizeDirection.includes("right")) {
      newWidth = Math.max(100, initialSize.width + deltaX);
    } else if (resizeDirection.includes("left")) {
      newWidth = Math.max(100, initialSize.width - deltaX);

      // When resizing from the left, also move the window to keep right edge fixed
      if (resizeDirection === "left" || resizeDirection.includes("left")) {
        // Calculate position based on the original position + delta to prevent cumulative movements
        x.set((position?.x || 0) + deltaX);
      }
    }

    if (resizeDirection.includes("bottom")) {
      newHeight = Math.max(100, initialSize.height + deltaY);
    } else if (resizeDirection.includes("top")) {
      newHeight = Math.max(50, initialSize.height - deltaY);

      // When resizing from the top, also move the window to keep bottom edge fixed
      if (resizeDirection === "top" || resizeDirection.includes("top")) {
        // Calculate position based on the original position + delta to prevent cumulative movements
        y.set((position?.y || 0) + deltaY);
      }
    }

    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
  };
  const handleDndResizeEnd = (event: DragEndEvent) => {
    setIsResizing(false);
    setResizeDirection(null);

    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      if (onResize) {
        onResize({ width: rect.width, height: rect.height });
      }

      // If we were resizing from the top or left, we need to also finalize the position
      if (
        resizeDirection === "top" ||
        resizeDirection?.includes("top") ||
        resizeDirection === "left" ||
        resizeDirection?.includes("left")
      ) {
        if (onDragEnd) {
          onDragEnd({
            x: x.get(),
            y: y.get(),
          });
        }
      }
    }
  };

  // Sync motion values when position prop changes and not dragging
  React.useEffect(() => {
    if (!isDragging) {
      x.set(position?.x || 0);
      y.set(position?.y || 0);
    }
  }, [position, isDragging, x, y]);

  // When maximized we want to snap the window to the top-left corner and reset any existing transform.
  React.useEffect(() => {
    if (isMaximized) {
      // Reset position transform values so the window is rendered from top-left.
      x.set(0);
      y.set(0);
    }
  }, [isMaximized, x, y]);

  // Determine if this is a Windows theme
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  // If activeOnHover prop is undefined, use default behavior based on theme
  const shouldActivateOnHover =
    activeOnHover !== undefined ? activeOnHover : isWindowsTheme;

  // Set active state based on hover or explicit active prop
  const isActive = shouldActivateOnHover ? hovered : active;

  // Handle drag start
  const handleDragStart: DragHandlers["onDragStart"] = () => {
    setIsDragging(true);
    onFocus();
  };
  // Handle drag move to update motion values
  const handleDrag: DragHandlers["onDrag"] = (_e, info) => {
    const baseX = position?.x || 0;
    const baseY = position?.y || 0;
    x.set(baseX + info.offset.x);
    y.set(baseY + info.offset.y);
  };
  // on release, persist position
  const handleDragEnd: DragHandlers["onDragEnd"] = (_e, info) => {
    setIsDragging(false);
    const newX = (position?.x || 0) + info.offset.x;
    const newY = (position?.y || 0) + info.offset.y;
    x.set(newX);
    y.set(newY);
    onDragEnd({ x: newX, y: newY });
  };

  const renderControl = (control: "minimize" | "maximize" | "close") => {
    const label = control.charAt(0).toUpperCase() + control.slice(1);
    const handler =
      control === "close"
        ? onClose
        : control === "minimize"
        ? onMinimize
        : onMaximize;
    const className = `title-bar-button is-${control}`;
    return (
      <button
        key={control}
        aria-label={label}
        className={className}
        onClick={handler}
      />
    );
  };

  const controlButtons = <>{controlList.map(renderControl)}</>;

  if (!isOpen || isMinimized) return null;

  // Wrap in DndContext to support resizing handles
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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={(e) => {
          const isDraggableTarget = !!(e.target as Element).closest(
            '[data-draggable="true"]'
          );
          const isControlsClick = !!(e.target as Element).closest(
            ".title-bar-controls"
          );
          if (isDraggableTarget && !isControlsClick && !isMaximized) {
            onFocus();
            controls.start(e);
            setIsDragging(true);
          }
        }}
        {...(!isMaximized
          ? {
              drag: true,
              dragControls: controls,
              dragListener: false,
              dragMomentum: false,
              dragElastic: 0,
              onDragStart: handleDragStart,
              onDrag: handleDrag,
              onDragEnd: handleDragEnd,
              dragTransition: { power: 0 },
            }
          : { drag: false })}
        className={cn(
          "window flex flex-col",
          className,
          activeTarget === "window" && isActive && "active",
          isFocused && "ring-2 ring-primary/30",
          isDragging && "dragging",
          isMaximized && "maximized",
          hideWindowChrome && "no-window-chrome"
        )}
        data-hide-chrome={hideWindowChrome}
        style={{
          width: isMaximized ? "100vw" : size?.width || width,
          height: isMaximized ? "100vh" : size?.height || height,
          zIndex,
          position: isMaximized ? "fixed" : "absolute",
          top: isMaximized ? 0 : undefined,
          left: isMaximized ? 0 : undefined,
          ...(isMaximized ? {} : { x, y }),
          willChange: isDragging ? "transform" : "auto",
        }}
      >
        {/* Title bar and controls, unless chrome is hidden */}
        {!hideWindowChrome && (
          <div
            ref={headerRef}
            className={cn(
              "title-bar flex items-center justify-between",
              activeTarget === "titlebar" && isActive && "active",
              !isMaximized && "window-drag-handle"
            )}
            style={{
              minHeight: theme === "winxp" ? "1.5rem" : undefined,
              cursor: "move",
              pointerEvents: "auto",
              userSelect: "none",
              touchAction: "none",
              WebkitUserSelect: "none",
            }}
            data-draggable="true"
          >
            {controlsPosition === "left" && (
              <div className="title-bar-controls">{controlButtons}</div>
            )}
            <div className="title-bar-text">{title}</div>
            {controlsPosition === "right" && (
              <div className="title-bar-controls">{controlButtons}</div>
            )}
          </div>
        )}
        {/* Content area */}
        <div
          className={cn(
            "window-body p-2 flex flex-col gap-4 flex-1 overflow-y-auto",
            isWindowsTheme && "has-scrollbar"
          )}
        >
          {children}
        </div>
        {!isMaximized && (
          <Resizable
            onResizeStart={handleResizeStart}
            onResizeEnd={handleDndResizeEnd}
            isResizing={isResizing}
          />
        )}
      </motion.div>
    </DndContext>
  );
}

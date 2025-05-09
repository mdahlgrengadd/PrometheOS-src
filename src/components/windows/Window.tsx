import {
  DragHandlers,
  motion,
  useDragControls,
  useMotionValue,
} from "framer-motion";
import React, { useRef } from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

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

  // Sync motion values when position prop changes and not dragging
  React.useEffect(() => {
    if (!isDragging) {
      x.set(position?.x || 0);
      y.set(position?.y || 0);
    }
  }, [position, isDragging, x, y]);

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

  return (
    <motion.div
      ref={windowRef}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      dragTransition={{ power: 0 }}
      className={cn(
        "window flex flex-col",
        className,
        activeTarget === "window" && isActive && "active",
        isFocused && "ring-2 ring-primary/30",
        isDragging && "dragging"
      )}
      style={{
        width: size?.width || width,
        height: size?.height || height,
        zIndex,
        position: "absolute",
        x,
        y,
        willChange: isDragging ? "transform" : "auto",
      }}
    >
      {/* Title bar */}
      <div
        ref={headerRef}
        onPointerDown={(e) => controls.start(e)}
        className={cn(
          "title-bar flex items-center justify-between",
          activeTarget === "titlebar" && isActive && "active",
          !isMaximized && "window-drag-handle"
        )}
        style={{
          minHeight: theme === "winxp" ? "1.5rem" : undefined,
          cursor: "move",
          pointerEvents: "auto", // Ensure pointer events work
        }}
      >
        {controlsPosition === "left" && (
          <div className="title-bar-controls">{controlButtons}</div>
        )}
        <div className="title-bar-text">{title}</div>
        {controlsPosition === "right" && (
          <div className="title-bar-controls">{controlButtons}</div>
        )}
      </div>

      {/* Content area */}
      <div
        className={cn(
          "window-body p-2 flex flex-col gap-4 flex-1 overflow-y-auto",
          isWindowsTheme && "has-scrollbar" // Add has-scrollbar class for Windows themes
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

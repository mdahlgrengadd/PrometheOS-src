import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

export interface WindowProps {
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
  className?: string;
}

export function WindowsWindow({
  id,
  title,
  zIndex,
  position,
  size,
  isMaximized,
  isOpen,
  isMinimized,
  isFocused = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragEnd,
  onResize,
  children,
  className,
}: WindowProps) {
  const { theme } = useTheme();

  // If window is not open or is minimized, don't render
  if (!isOpen || isMinimized) return null;

  return (
    <div
      className={cn(
        "window",
        isFocused && "active",
        "animate-window-appear",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="window-title"
      style={{
        zIndex: zIndex,
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: typeof size.width === "number" ? `${size.width}px` : size.width,
        height:
          typeof size.height === "number" ? `${size.height}px` : size.height,
      }}
      onClick={onFocus}
    >
      {/* Title bar */}
      <div className="title-bar">
        <div className="title-bar-text" id="window-title">
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize}></button>
          <button
            aria-label={isMaximized ? "Restore" : "Maximize"}
            onClick={onMaximize}
          ></button>
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>

      {/* Window content */}
      <div className="window-body has-scrollbar">{children}</div>
    </div>
  );
}

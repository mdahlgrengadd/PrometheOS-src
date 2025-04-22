import {
  DragHandlers,
  motion,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

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
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [animationState, setAnimationState] = useState<
    "opening" | "closing" | "minimizing" | "maximizing" | null
  >("opening");
  const [isDragging, setIsDragging] = useState(false);

  // Use motion values for smooth dragging at 60fps
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);

  // Update motion values when position prop changes (but not during drag)
  useEffect(() => {
    if (!isDragging) {
      x.set(position.x);
      y.set(position.y);
    }
  }, [position, isDragging, x, y]);

  // Set up resize observer
  useEffect(() => {
    if (!windowRef.current || isMaximized) return;

    // Clean up previous observer if it exists
    let resizeObserver: ResizeObserver | null = null;

    // Create a debounce function for the resize - only apply for user-initiated resizes
    let resizeTimeout: NodeJS.Timeout;
    let initialSize = { width: 0, height: 0 };
    let resizeInitiated = false;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      // Store initial size when the observer is first attached
      if (initialSize.width === 0) {
        initialSize = {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        };
        return;
      }

      // Only process resize if user initiated it via the resize handle
      // or if the size is larger than initial (prevent shrinking)
      if (
        resizeInitiated ||
        entry.contentRect.width > initialSize.width ||
        entry.contentRect.height > initialSize.height
      ) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Apply resize only if width/height changed significantly
          if (
            Math.abs(entry.contentRect.width - initialSize.width) > 5 ||
            Math.abs(entry.contentRect.height - initialSize.height) > 5
          ) {
            const { width, height } = entry.contentRect;
            onResize({ width, height });

            // Update our tracked initial size
            initialSize = { width, height };
          }

          resizeInitiated = false;
        }, 100);
      }
    };

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(windowRef.current);

    // Set flag when user initiates resize via resize handle
    const handleResizeStart = () => {
      resizeInitiated = true;
    };

    if (resizeHandleRef.current) {
      resizeHandleRef.current.addEventListener("mousedown", handleResizeStart);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (resizeHandleRef.current) {
        resizeHandleRef.current.removeEventListener(
          "mousedown",
          handleResizeStart
        );
      }
      clearTimeout(resizeTimeout);
    };
  }, [isMaximized, onResize]);

  // Initialize opening animation
  useEffect(() => {
    if (isOpen) {
      setAnimationState("opening");
      const timer = setTimeout(() => {
        setAnimationState(null);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle maximize animation
  useEffect(() => {
    if (isMaximized) {
      setAnimationState("maximizing");
      const timer = setTimeout(() => {
        setAnimationState(null);
      }, 200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isMaximized]);

  // Focus effect
  useEffect(() => {
    if (isFocused) {
      const timer = setTimeout(() => {
        if (windowRef.current) {
          windowRef.current.classList.add("window-focused");
          setTimeout(() => {
            windowRef.current?.classList.remove("window-focused");
          }, 300);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  // Custom resize handler
  useEffect(() => {
    if (!resizeHandleRef.current || isMaximized || !isOpen || isMinimized)
      return;

    const handleRef = resizeHandleRef.current;
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const handleResizeStart = (e: MouseEvent) => {
      if (!windowRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = windowRef.current.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;

      document.body.style.cursor = "nwse-resize";
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
    };

    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !windowRef.current) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newWidth = Math.max(320, startWidth + deltaX);
      const newHeight = Math.max(200, startHeight + deltaY);

      windowRef.current.style.width = `${newWidth}px`;
      windowRef.current.style.height = `${newHeight}px`;
    };

    const handleResizeEnd = () => {
      if (!isResizing || !windowRef.current) return;

      isResizing = false;
      document.body.style.cursor = "";

      const rect = windowRef.current.getBoundingClientRect();
      onResize({
        width: rect.width,
        height: rect.height,
      });

      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };

    handleRef.addEventListener("mousedown", handleResizeStart);

    return () => {
      handleRef.removeEventListener("mousedown", handleResizeStart);
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isMaximized, onResize, isOpen, isMinimized]);

  // Handle drag start - used for focusing and tracking state
  const handleDragStart: DragHandlers["onDragStart"] = () => {
    setIsDragging(true);
    onFocus(); // Focus the window when starting to drag
  };

  // Handle drag end - sync state back to store
  const handleDragEnd: DragHandlers["onDragEnd"] = () => {
    setIsDragging(false);

    // Clamp position to keep on screen
    if (windowRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = windowRef.current.getBoundingClientRect();

      const minVisibleWidth = Math.min(100, rect.width * 0.2);
      const minVisibleHeight = Math.min(50, rect.height * 0.2);

      const currentX = x.get();
      const currentY = y.get();

      const clampedX = Math.max(
        -rect.width + minVisibleWidth,
        Math.min(currentX, viewportWidth - minVisibleWidth)
      );
      const clampedY = Math.max(
        0,
        Math.min(currentY, viewportHeight - minVisibleHeight)
      );

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

  // Handle minimize with animation
  const handleMinimize = () => {
    if (windowRef.current) {
      setAnimationState("minimizing");
      // Wait for the animation to complete before actually minimizing
      setTimeout(() => {
        onMinimize();
        setAnimationState(null);
      }, 200);
    } else {
      onMinimize();
    }
  };

  // Handle close with animation
  const handleClose = () => {
    if (windowRef.current) {
      setAnimationState("closing");
      // Wait for the animation to complete before actually closing
      setTimeout(() => {
        onClose();
        setAnimationState(null);
      }, 100);
    } else {
      onClose();
    }
  };

  if (!isOpen || isMinimized) return null;

  return (
    <motion.div
      ref={windowRef}
      className={cn(
        "draggable-window",
        isMaximized && "maximized",
        isFocused && "ring-2 ring-primary/30",
        isDragging && "dragging",
        animationState === "opening" && "window-opening animating-transform",
        animationState === "closing" && "window-closing animating-transform",
        animationState === "minimizing" &&
          "window-minimizing animating-transform",
        animationState === "maximizing" &&
          "window-maximizing animating-transform"
      )}
      style={{
        zIndex,
        width: size.width,
        height: size.height,
        // Set will-change for better performance hints to browser
        willChange: isDragging ? "transform" : "auto",
      }}
      // Directly use motion values for smooth 60fps animation
      initial={false}
      animate={false}
      // Hardware accelerated positioning using motion values
      {...(isMaximized
        ? {}
        : {
            x,
            y,
            drag: true,
            dragMomentum: false,
            dragElastic: 0,
            dragSnapToOrigin: false,
            dragTransition: { power: 0, timeConstant: 0 },
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
          })}
    >
      <div
        className={!isMaximized ? "window-drag-handle" : ""}
        onMouseDown={(e) => {
          if ((e.target as Element).closest(".window-controls")) {
            // clicking the controls → don't initiate a drag
            e.stopPropagation();
          }
        }}
      >
        <WindowHeader
          title={title}
          onMinimize={handleMinimize}
          onMaximize={onMaximize}
          onClose={handleClose}
          headerRef={headerRef}
        />
      </div>

      <WindowContent>{children}</WindowContent>

      {/* Resize handle */}
      {!isMaximized && <div ref={resizeHandleRef} className="resize-handle" />}
    </motion.div>
  );
};

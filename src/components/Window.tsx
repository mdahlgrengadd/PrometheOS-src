import React, { useEffect, useRef, useState } from 'react';

import { WindowState } from './Desktop';
import { WindowContent } from './window/WindowContent';
import { WindowHeader } from './window/WindowHeader';

interface WindowProps {
  window: WindowState;
  allWindows: WindowState[];
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
  onTabClick: (id: string) => void;
}

const Window: React.FC<WindowProps> = ({
  window,
  allWindows,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragStop,
  onTabClick,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });

  const isMaximized =
    window.size.width === "100%" &&
    (window.size.height === "calc(100% - 48px)" ||
      window.size.height === "calc(100vh - 62px)");

  // Handle click to focus
  useEffect(() => {
    const handleClick = () => onFocus();
    const windowElement = windowRef.current;

    if (windowElement) {
      windowElement.addEventListener("mousedown", handleClick);
      return () => windowElement.removeEventListener("mousedown", handleClick);
    }
  }, [onFocus]);

  // Handle drag events
  useEffect(() => {
    if (
      !headerRef.current ||
      !window.isOpen ||
      window.isMinimized ||
      isMaximized
    )
      return;

    const header = headerRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      if (windowRef.current) {
        const windowRect = windowRef.current.getBoundingClientRect();

        // Calculate offset directly from mouse position to window position
        // This ensures there's no initial jerk when dragging starts
        setDragOffset({
          x: e.clientX - windowRect.left,
          y: e.clientY - windowRect.top,
        });

        setStartPos({ x: windowRect.left, y: windowRect.top });
        setDragging(true);
        e.preventDefault();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      // Calculate new position based on mouse movement
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Update window position directly for smoother dragging
      if (windowRef.current) {
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        // Get final position and notify parent component
        if (windowRef.current) {
          const rect = windowRef.current.getBoundingClientRect();
          onDragStop({ x: rect.left, y: rect.top });
        }
        setDragging(false);
      }
    };

    header.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      header.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    dragging,
    dragOffset,
    onDragStop,
    window.isMinimized,
    window.isOpen,
    isMaximized,
  ]);

  // Custom resizing functionality
  useEffect(() => {
    if (
      !windowRef.current ||
      !window.isOpen ||
      window.isMinimized ||
      isMaximized
    )
      return;

    const windowElement = windowRef.current;

    // Function to determine if we're in the resize zone (bottom-right corner)
    const isInResizeZone = (e: MouseEvent, element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();
      const rightEdgeZone = rect.right - e.clientX < 20;
      const bottomEdgeZone = rect.bottom - e.clientY < 20;
      return rightEdgeZone && bottomEdgeZone;
    };

    const handleResizeMouseDown = (e: MouseEvent) => {
      if (!isInResizeZone(e, windowElement)) return;

      e.preventDefault();
      e.stopPropagation();

      // Start resizing
      setResizing(true);

      // Record initial positions and sizes
      const rect = windowElement.getBoundingClientRect();
      setStartSize({
        width: rect.width,
        height: rect.height,
      });
      setResizeStartPos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      // Calculate new width and height
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      const newWidth = Math.max(320, startSize.width + deltaX);
      const newHeight = Math.max(200, startSize.height + deltaY);

      // Apply the new dimensions directly for a smoother experience
      windowElement.style.width = `${newWidth}px`;
      windowElement.style.height = `${newHeight}px`;
    };

    const handleResizeMouseUp = () => {
      if (resizing) {
        setResizing(false);

        // Update the window state with new size
        if (
          typeof window.size.width === "number" &&
          typeof window.size.height === "number"
        ) {
          // We don't need to do anything here as the element already has the new dimensions
          // The parent only needs to know about position changes
        }
      }
    };

    windowElement.addEventListener("mousedown", handleResizeMouseDown);
    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);

    return () => {
      windowElement.removeEventListener("mousedown", handleResizeMouseDown);
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };
  }, [
    window.isOpen,
    window.isMinimized,
    isMaximized,
    resizing,
    resizeStartPos.x,
    resizeStartPos.y,
    startSize.width,
    startSize.height,
  ]);

  if (!window.isOpen || window.isMinimized) return null;

  const style: React.CSSProperties = {
    zIndex: window.zIndex,
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
  };

  return (
    <div
      ref={windowRef}
      className={`draggable-window ${isMaximized ? "maximized" : ""} ${
        resizing ? "resizing" : ""
      }`}
      style={style}
    >
      {!isMaximized && (
        <WindowHeader
          title={window.title}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          headerRef={headerRef}
        />
      )}
      <WindowContent>{window.content}</WindowContent>

      {/* Custom resize handle indicator */}
      {!isMaximized && <div className="resize-handle" />}
    </div>
  );
};

export default Window;

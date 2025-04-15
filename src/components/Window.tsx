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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

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

  if (!window.isOpen || window.isMinimized) return null;

  const style: React.CSSProperties = {
    zIndex: window.zIndex,
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
  };

  const handleResize = () => {
    if (windowRef.current) {
      onDragStop({
        x: window.position.x,
        y: window.position.y,
      });
    }
  };

  return (
    <div
      ref={windowRef}
      className={`draggable-window ${isMaximized ? "maximized" : ""}`}
      style={style}
      onMouseUp={handleResize}
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
    </div>
  );
};

export default Window;

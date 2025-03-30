
import React, { useRef, useEffect, useState } from "react";
import { X, Minimize, Maximize } from "lucide-react";
import { WindowState } from "./Desktop";

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStop: (position: { x: number; y: number }) => void;
}

const Window: React.FC<WindowProps> = ({ 
  window, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus,
  onDragStop
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
    if (!headerRef.current || !window.isOpen || window.isMinimized) return;

    const header = headerRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      // If window is maximized, don't allow dragging
      if (window.size.width === "100%" && window.size.height === "calc(100% - 48px)") {
        return;
      }
      
      setDragging(true);
      const rect = header.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      // Prevent text selection during drag
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      onDragStop({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    header.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      header.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragOffset, onDragStop, window.isMinimized, window.isOpen, window.size.height, window.size.width]);

  // Don't render if the window is not open or is minimized
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
      className="draggable-window"
      style={style}
    >
      <div ref={headerRef} className="window-header">
        <div className="window-title">{window.title}</div>
        <div className="window-controls">
          <button
            className="window-control bg-yellow-500"
            onClick={onMinimize}
            aria-label="Minimize"
          >
            <Minimize className="h-2 w-2 text-yellow-800 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            className="window-control bg-green-500"
            onClick={onMaximize}
            aria-label="Maximize"
          >
            <Maximize className="h-2 w-2 text-green-800 opacity-0 group-hover:opacity-100" />
          </button>
          <button
            className="window-control bg-red-500"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-2 w-2 text-red-800 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
      </div>
      <div className="window-content">
        {window.content}
      </div>
    </div>
  );
};

export default Window;

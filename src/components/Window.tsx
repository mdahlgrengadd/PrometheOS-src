import React, { useRef, useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { WindowState } from "./Desktop";

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
  onTabClick
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const isMaximized = window.size.width === "100%" && 
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
    if (!headerRef.current || !window.isOpen || window.isMinimized || isMaximized) return;

    const header = headerRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
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
  }, [dragging, dragOffset, onDragStop, window.isMinimized, window.isOpen, isMaximized]);

  // Don't render if the window is not open or is minimized
  if (!window.isOpen || window.isMinimized) return null;

  const style: React.CSSProperties = {
    zIndex: window.zIndex,
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
  };

  const WindowControls = () => (
    <div className="window-controls">
      <button
        className="window-control"
        onClick={onMinimize}
        aria-label="Minimize"
      >
        <Minus className="h-2.5 w-2.5 text-black" />
      </button>
      <button
        className="window-control"
        onClick={onMaximize}
        aria-label="Maximize"
      >
        <Square className="h-2.5 w-2.5 text-black" />
      </button>
      <button
        className="window-control"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-2.5 w-2.5 text-black" />
      </button>
    </div>
  );

  return (
    <div 
      ref={windowRef} 
      className={`draggable-window ${isMaximized ? 'maximized' : ''}`}
      style={style}
    >
      <div 
        ref={headerRef} 
        className={`window-header ${isMaximized ? 'hidden' : 'inline-flex'}`}
      >
        <div className="window-title">{window.title}</div>
        <WindowControls />
      </div>
      <div className="window-content">
        {window.content}
      </div>
    </div>
  );
};

export default Window;

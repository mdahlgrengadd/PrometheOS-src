import React, { useRef, useEffect, useState } from "react";
import { X, Minus, Square } from "lucide-react";
import { WindowState } from "./Desktop";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable";

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
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

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
      // Get the initial window position
      if (windowRef.current) {
        const rect = windowRef.current.getBoundingClientRect();
        setStartPos({ x: rect.left, y: rect.top });
      }
      
      // Allow dragging even when clicking on the title text
      setDragging(true);
      
      // Calculate offset relative to the header
      const headerRect = header.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - headerRect.left,
        y: e.clientY - headerRect.top
      });
      
      e.preventDefault();
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
  }, [dragging, dragOffset, onDragStop, window.isMinimized, window.isOpen, isMaximized]);

  if (!window.isOpen || window.isMinimized) return null;

  const style: React.CSSProperties = {
    zIndex: window.zIndex,
    left: window.position.x,
    top: window.position.y,
    width: window.size.width,
    height: window.size.height,
  };

  const handleMinimizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMinimize();
  };

  const handleMaximizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMaximize();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleResize = () => {
    if (windowRef.current) {
      const { offsetWidth, offsetHeight } = windowRef.current;
      onDragStop({ 
        x: window.position.x, 
        y: window.position.y 
      });
      
      // Update the window size in parent component
      if (window.size.width !== offsetWidth || window.size.height !== offsetHeight) {
        const updatedWindow = {
          ...window,
          size: {
            width: offsetWidth,
            height: offsetHeight
          }
        };
        // This will trigger a re-render with the new size
        // But we're still keeping the drag position stable
      }
    }
  };

  return (
    <div 
      ref={windowRef} 
      className={`draggable-window ${isMaximized ? 'maximized' : ''}`}
      style={style}
      onMouseUp={handleResize}
    >
      {/* Only render window header if not maximized (fixes duplicate header issue) */}
      {!isMaximized && (
        <div ref={headerRef} className="window-header">
          <div className="window-title">{window.title}</div>
          <div className="window-controls">
            <button
              className="window-control"
              onClick={handleMinimizeClick}
              aria-label="Minimize"
            >
              <Minus className="h-2.5 w-2.5 text-black" />
            </button>
            <button
              className="window-control"
              onClick={handleMaximizeClick}
              aria-label="Maximize"
            >
              <Square className="h-2.5 w-2.5 text-black" />
            </button>
            <button
              className="window-control"
              onClick={handleCloseClick}
              aria-label="Close"
            >
              <X className="h-2.5 w-2.5 text-black" />
            </button>
          </div>
        </div>
      )}
      <div className="window-content">
        {window.content}
      </div>
    </div>
  );
};

export default Window;

import { DragHandlers } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface UseDraggableElements {
  windowRef: React.RefObject<HTMLElement>;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  isMaximized?: boolean;
}

/**
 * A hook to find and manage draggable elements within a window
 * Elements with data-draggable="true" attribute will be treated as drag handles
 */
export function useDraggableElements({
  windowRef,
  onDragStart,
  onDragEnd,
  isMaximized = false
}: UseDraggableElements) {
  const [draggableElements, setDraggableElements] = useState<Element[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragControlsRef = useRef<any>(null);
  
  // Find and set draggable elements when the window ref changes
  useEffect(() => {
    if (!windowRef.current || isMaximized) return;
    
    // Query for all elements with the data-draggable attribute
    const elements = windowRef.current.querySelectorAll('[data-draggable="true"]');
    setDraggableElements(Array.from(elements));
    
    // Add event listeners to each draggable element if needed
    elements.forEach(element => {
      // Additional logic if needed
    });
    
    return () => {
      // Clean up event listeners if needed
      elements.forEach(element => {
        // Cleanup logic if needed
      });
    };
  }, [windowRef.current, isMaximized]);
  
  // Handle drag start
  const handleDragStart: DragHandlers["onDragStart"] = () => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart();
    }
  };
  
  // Handle drag end
  const handleDragEnd: DragHandlers["onDragEnd"] = (_e, info) => {
    setIsDragging(false);
    
    if (onDragEnd) {
      // Calculate the new position based on the original position plus the drag offset
      onDragEnd({
        x: info.point.x,
        y: info.point.y,
      });
    }
  };
  
  return {
    draggableElements,
    isDragging,
    handleDragStart,
    handleDragEnd,
    dragControlsRef,
  };
}

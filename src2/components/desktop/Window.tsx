import React, { useEffect, useRef, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

import { useShell } from '@/contexts/ShellContext';
import { Window as WindowType } from '@/hooks/useWindowManager';
import { cn } from '@/lib/utils';

import AppWindow from '../shared/AppWindow';

interface WindowProps {
  window: WindowType;
}

const Window: React.FC<WindowProps> = ({ window }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleFullScreen,
    updateWindowPosition,
    isMobile,
  } = useShell();

  const [isDragging, setIsDragging] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log window render
  useEffect(() => {
    console.log(`[DEBUG] Window ${window.id} rendered`, {
      isFocused: window.isFocused,
      position: window.position,
      zIndex: window.zIndex,
    });
  }, [window.id, window.isFocused, window.position, window.zIndex]);

  // Focus window when clicked
  const handleWindowClick = (e: React.MouseEvent) => {
    // Check if this is a click on an app icon or dock bar and ignore if it is
    if ((e.target as HTMLElement).closest(".app-icon")) {
      return;
    }

    console.log(`[DEBUG] Window click on ${window.id}`, {
      target: e.target,
      currentTarget: e.currentTarget,
      isFocused: window.isFocused,
    });

    // Ensure event propagation is stopped
    e.stopPropagation();

    if (!window.isFocused) {
      console.log(`[DEBUG] Focusing window ${window.id}`);
      focusWindow(window.id);
    }
  };

  // Handle drag start with react-draggable
  const handleDragStart = (e: DraggableEvent, data: DraggableData) => {
    // Check if this is an interaction with a mobile UI element
    if (
      (e.target as HTMLElement).closest(".app-icon") ||
      (e.target as HTMLElement).closest(".fixed.bottom-0")
    ) {
      return;
    }

    console.log(`[DEBUG] Drag start for window ${window.id}`, data);

    // Focus window when starting to drag
    if (!window.isFocused) {
      focusWindow(window.id);
    }

    setIsDragging(true);
  };

  // Handle drag with react-draggable
  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    // We don't need to update the position during drag as react-draggable handles it
    if (
      (e as React.MouseEvent).clientX % 60 === 0 ||
      (e as React.MouseEvent).clientY % 60 === 0
    ) {
      console.log(`[DEBUG] Dragging window ${window.id}`, {
        x: data.x,
        y: data.y,
      });
    }
  };

  // Handle drag end with react-draggable
  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    // Check if this is an interaction with a mobile UI element
    if (
      (e.target as HTMLElement).closest(".app-icon") ||
      (e.target as HTMLElement).closest(".fixed.bottom-0")
    ) {
      return;
    }

    console.log(`[DEBUG] Drag end for window ${window.id}`, data);
    setIsDragging(false);

    // Update window position in our state management
    updateWindowPosition(window.id, { x: data.x, y: data.y });
  };

  // Set position from window state
  const getStyles = (): React.CSSProperties => {
    if (window.isFullScreen) {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: window.zIndex,
      };
    }

    if (window.isMinimized) {
      return {
        display: "none",
      };
    }

    return {
      width: `${window.size.width}px`,
      height: `${window.size.height}px`,
      zIndex: window.zIndex,
      cursor: isDragging ? "grabbing" : "default",
      // Use hardware acceleration when possible
      transform: "translateZ(0)",
      // Disable touch actions for better mouse handling
      touchAction: "none",
    };
  };

  // Determine if window should be draggable
  const shouldBeDraggable = !window.isFullScreen && !window.isMinimized;

  // Get the bounds for dragging (to prevent dragging outside viewport)
  const dragBounds = {
    top: 0,
    left: 0,
    right: window.isFullScreen ? 0 : Infinity,
    bottom: window.isFullScreen ? 0 : Infinity,
  };

  // On mobile, add a bottom margin to prevent overlapping with the dock bar
  if (isMobile) {
    // Access the global window instead of the window prop to avoid confusion
    const viewportHeight =
      typeof document !== "undefined"
        ? document.documentElement.clientHeight
        : 1000;
    dragBounds.bottom = viewportHeight - 70; // 70px to account for dock bar height
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-titlebar"
      position={window.position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds={dragBounds}
      disabled={!shouldBeDraggable}
      defaultClassNameDragging="window-dragging"
      // Remove the hint text that appears on mobile
      enableUserSelectHack={false}
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute rounded-lg overflow-hidden shadow-2xl cursor-default",
          window.isFocused ? "shadow-2xl ring-2 ring-blue-500" : "shadow-lg",
          isDragging ? "cursor-grabbing" : "",
          // Add a debugging class to help identify in DevTools
          `window-${window.id.replace(/\s+/g, "-")}`
        )}
        style={getStyles()}
        onClick={handleWindowClick}
        data-windowid={window.id}
        data-focused={window.isFocused}
        data-dragging={isDragging}
      >
        <AppWindow
          title={window.app.name}
          onClose={() => {
            console.log(`[DEBUG] Closing window ${window.id}`);
            closeWindow(window.id);
          }}
          onMinimize={() => {
            console.log(`[DEBUG] Minimizing window ${window.id}`);
            minimizeWindow(window.id);
          }}
          isFullScreen={window.isFullScreen}
          className="window-titlebar"
        >
          <div
            className={`w-full h-full flex items-center justify-center ${window.app.color} text-white pointer-events-auto`}
          >
            <div className="flex flex-col items-center">
              <window.app.icon size={48} />
              <p className="mt-4 text-xl font-semibold">
                {window.app.name} App Content
              </p>
              <p className="mt-2 text-sm">(DEBUG: Window ID: {window.id})</p>
              {/* Button to test event handling */}
              <button
                className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    `[DEBUG] Test button clicked in window ${window.id}`
                  );
                  alert(`Button clicked in ${window.app.name} window!`);
                }}
              >
                Test Button
              </button>
            </div>
          </div>
        </AppWindow>
      </div>
    </Draggable>
  );
};

export default Window;

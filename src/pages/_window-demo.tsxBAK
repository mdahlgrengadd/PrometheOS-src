import React, { useState } from "react";
import { UnifiedWindowShell } from "@/components/window/UnifiedWindowShell";

export default function UnifiedWindowDemo() {
  const [windowState, setWindowState] = useState({
    isMaximized: false,
    isMinimized: false,
    isOpen: true,
    position: { x: 100, y: 100 },
    size: { width: 500, height: 400 },
    zIndex: 1,
  });

  const handleClose = () => {
    setWindowState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMinimize = () => {
    setWindowState((prev) => ({ ...prev, isMinimized: true }));
  };

  const handleMaximize = () => {
    setWindowState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }));
  };

  const handleDragEnd = (position: { x: number; y: number }) => {
    setWindowState((prev) => ({ ...prev, position }));
  };

  const handleResize = (size: { width: number | string; height: number | string }) => {
    setWindowState((prev) => ({ ...prev, size }));
  };

  // Button to re-open the window if it's closed or minimized
  const handleReopen = () => {
    setWindowState((prev) => ({ ...prev, isOpen: true, isMinimized: false }));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Unified Window Demo</h1>
      
      {(!windowState.isOpen || windowState.isMinimized) && (
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleReopen}
        >
          Open Window
        </button>
      )}

      <UnifiedWindowShell
        id="demo-window"
        title="Unified Window Demo"
        zIndex={windowState.zIndex}
        position={windowState.position}
        size={windowState.size}
        isMaximized={windowState.isMaximized}
        isOpen={windowState.isOpen}
        isMinimized={windowState.isMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onFocus={() => setWindowState((prev) => ({ ...prev, zIndex: prev.zIndex + 1 }))}
        onDragEnd={handleDragEnd}
        onResize={handleResize}
        activeOnHover={true}
        controls={["minimize", "maximize", "close"]}
        controlsPosition="right"
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold">Hello from the Unified Window!</h2>
          <p className="my-4">
            This window uses the new unified window shell with the data-draggable attribute
            for flexible drag areas.
          </p>
          <div className="border border-gray-300 p-3 rounded-md mt-4 mb-4 bg-gray-100">
            <p className="mb-2">Current window state:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(windowState, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4 p-3 border border-blue-200 rounded bg-blue-50" data-draggable="true">
            <p className="font-semibold">This area is draggable too!</p>
            <p className="text-sm text-gray-600">
              It has the data-draggable="true" attribute.
            </p>
          </div>
        </div>
      </UnifiedWindowShell>
    </div>
  );
};

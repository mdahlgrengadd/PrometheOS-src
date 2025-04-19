import { Minus, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface AppWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onTitlebarMouseDown?: (e: React.MouseEvent) => void;
  isFullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
  controls?: boolean;
}

// Define debug mode
const DEBUG = true;

const AppWindow: React.FC<AppWindowProps> = ({
  title,
  children,
  onClose,
  onMinimize,
  onTitlebarMouseDown,
  isFullScreen,
  className = "",
  style = {},
  controls = true,
}) => {
  const titlebarRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log renders
  useEffect(() => {
    if (DEBUG) {
      console.log(`[WINDOW DEBUG] AppWindow rendered: ${title}`, {
        isFullScreen,
        controls,
        titlebarRef: !!titlebarRef.current,
      });
    }
  }, [title, isFullScreen, controls]);

  // Set up direct DOM event listeners for better control
  useEffect(() => {
    const titlebar = titlebarRef.current;
    const window = windowRef.current;

    if (!titlebar || !window) return;

    if (DEBUG) {
      console.log(
        `[WINDOW DEBUG] Setting up direct event listeners for ${title}`
      );
    }

    // Directly attach event listeners to titlebar
    const handleTitlebarMouseDown = (e: MouseEvent) => {
      if (DEBUG) {
        console.log(`[WINDOW DEBUG] Direct titlebar mousedown: ${title}`, {
          target: e.target,
          button: e.button,
          targetIsButton: (e.target as HTMLElement).tagName === "BUTTON",
        });
      }

      // Don't propagate events from buttons
      if ((e.target as HTMLElement).tagName === "BUTTON") {
        e.stopPropagation();
      }
    };

    const handleTitlebarClick = (e: MouseEvent) => {
      if (DEBUG) {
        console.log(`[WINDOW DEBUG] Direct titlebar click: ${title}`, {
          target: e.target,
          targetIsButton: (e.target as HTMLElement).tagName === "BUTTON",
        });
      }
    };

    // Use both capturing and bubbling phase
    titlebar.addEventListener("mousedown", handleTitlebarMouseDown, {
      capture: true,
    });
    titlebar.addEventListener("click", handleTitlebarClick, { capture: true });

    return () => {
      titlebar.removeEventListener("mousedown", handleTitlebarMouseDown, {
        capture: true,
      });
      titlebar.removeEventListener("click", handleTitlebarClick, {
        capture: true,
      });
    };
  }, [title]);

  // Handle button clicks with stopPropagation
  const handleCloseClick = (e: React.MouseEvent) => {
    if (DEBUG) {
      console.log(`[WINDOW DEBUG] Close button clicked: ${title}`);
    }
    e.stopPropagation();
    e.preventDefault();
    onClose?.();
  };

  const handleMinimizeClick = (e: React.MouseEvent) => {
    if (DEBUG) {
      console.log(`[WINDOW DEBUG] Minimize button clicked: ${title}`);
    }
    e.stopPropagation();
    e.preventDefault();
    onMinimize?.();
  };

  // Handle titlebar mouse events
  const handleLocalTitlebarMouseDown = (e: React.MouseEvent) => {
    if (DEBUG) {
      console.log(`[WINDOW DEBUG] Titlebar mousedown (React): ${title}`, {
        target: e.target,
        button: e.button,
      });
    }

    // Only handle non-button elements (let button clicks work normally)
    if (
      e.currentTarget === e.target ||
      (e.target as HTMLElement).tagName !== "BUTTON"
    ) {
      // Call the passed in handler if provided
      onTitlebarMouseDown?.(e);
    } else {
      // Stop propagation for button clicks
      e.stopPropagation();
    }
  };

  // Create a special handler for window content
  const handleContentClick = (e: React.MouseEvent) => {
    if (DEBUG) {
      console.log(`[WINDOW DEBUG] Content click: ${title}`, {
        target: e.target,
        currentTarget: e.currentTarget,
      });
    }

    // Let this event bubble up to the window component
  };

  return (
    <div
      ref={windowRef}
      className={`flex flex-col bg-white rounded-lg shadow-lg select-none ${
        isFullScreen ? "w-full h-full" : ""
      } ${className}`}
      style={{ ...style, touchAction: "none" }}
      data-window-title={title}
    >
      <div
        ref={titlebarRef}
        className="flex items-center px-3 py-2 bg-gray-100 rounded-t-lg window-titlebar cursor-move"
        onMouseDown={handleLocalTitlebarMouseDown}
        data-testid="window-titlebar"
      >
        {controls && (
          <div className="flex space-x-2 mr-3">
            <button
              onClick={handleCloseClick}
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
              data-testid="close-button"
            />
            <button
              onClick={handleMinimizeClick}
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 focus:outline-none"
              data-testid="minimize-button"
            />
            <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none" />
          </div>
        )}
        <div className="flex-1 text-center text-sm font-medium truncate">
          {title}
        </div>
        {controls && (
          <div className="flex space-x-2">
            <button
              onClick={handleMinimizeClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleCloseClick}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <div
        className="flex-1 overflow-auto p-4 pointer-events-auto"
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default AppWindow;

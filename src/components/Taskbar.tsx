import { Clock, Home, Maximize2, Minimize2, Monitor } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { useTheme } from "@/lib/ThemeProvider";

import { WindowState } from "./Desktop";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();
  const isBeOSTheme = theme === "beos";
  const [autoHide, setAutoHide] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check for auto-hide setting on mount
  useEffect(() => {
    const checkAutoHideSetting = () => {
      const autoHideSetting =
        localStorage.getItem("taskbar-autohide") === "true";
      setAutoHide(autoHideSetting);
      setIsVisible(!autoHideSetting);
    };

    // Initial check
    checkAutoHideSetting();

    // Listen for storage changes to update setting
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "taskbar-autohide") {
        setAutoHide(e.newValue === "true");
        setIsVisible(e.newValue !== "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check the document's custom property for auto-hide changes
    const observeAutoHideProperty = () => {
      const autoHideValue = getComputedStyle(document.documentElement)
        .getPropertyValue("--taskbar-auto-hide")
        .trim();
      setAutoHide(autoHideValue === "true");
      setIsVisible(autoHideValue !== "true");
    };

    // Create a MutationObserver to watch for style attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          observeAutoHideProperty();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "closeStartMenu") {
        setStartMenuOpen(false);
      } else if (event.data && event.data.action === "openItem") {
        console.log(`Opening item: ${event.data.item}`);
        // Handle opening the item here
        setStartMenuOpen(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    if (!startMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".start-menu-iframe") &&
        !target.closest(".taskbar-start")
      ) {
        setStartMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [startMenuOpen]);

  // Format time as hours:minutes AM/PM
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Handle mouse events for auto-hide behavior
  const handleMouseEnter = () => {
    if (autoHide) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoHide) {
      setIsVisible(false);
    }
  };

  // Taskbar classes based on visibility and auto-hide settings
  const taskbarClasses = `taskbar ${autoHide ? "taskbar-auto-hide" : ""} ${
    isVisible ? "taskbar-visible" : "taskbar-hidden"
  }`;

  // Add CSS for taskbar auto-hide
  useEffect(() => {
    // Add CSS for auto-hide only once
    if (!document.getElementById("taskbar-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "taskbar-styles";
      styleElement.textContent = `
        .taskbar-auto-hide {
          transition: transform 0.3s ease;
        }
        .taskbar-hidden {
          transform: translateY(100%);
        }
        .taskbar-visible {
          transform: translateY(0);
        }
        .start-menu-iframe {
          position: absolute;
          bottom: 42px;
          left: 0;
          width: 300px;
          height: 400px;
          border: 1px solid #ddd;
          border-radius: 8px 8px 0 0;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
          z-index: 9999;
          overflow: hidden;
          animation: slideUp 0.2s ease-out;
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Clean up on unmount
      const styleElement = document.getElementById("taskbar-styles");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // Toggle Start menu
  const toggleStartMenu = () => {
    setStartMenuOpen((prev) => !prev);
  };

  // Start menu iframe
  const startMenuIframe = startMenuOpen ? (
    <iframe
      ref={iframeRef}
      className="start-menu-iframe"
      src="/startmenu.html"
      frameBorder="0"
      title="Start Menu"
    ></iframe>
  ) : null;

  // BeOS style taskbar
  if (isBeOSTheme) {
    return (
      <div
        className={taskbarClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="taskbar-start" onClick={toggleStartMenu}>
          <span>BeOS</span>
        </div>

        {startMenuIframe}

        <div className="taskbar-separator"></div>

        <div className="flex-1 flex">
          {windows.map(
            (window) =>
              window.isOpen && (
                <button
                  key={window.id}
                  className={`taskbar-item ${
                    window.isOpen && !window.isMinimized ? "active" : ""
                  }`}
                  onClick={() => onWindowClick(window.id)}
                >
                  {window.title}
                </button>
              )
          )}
        </div>

        <div className="taskbar-separator"></div>

        <div className="px-2 text-xs font-bold">{formattedTime}</div>
      </div>
    );
  }

  // Modern style taskbar
  return (
    <div
      className={taskbarClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="taskbar-start" onClick={toggleStartMenu}>
        <Home className="w-4 h-4 mr-2" />
        <span>Start</span>
      </button>

      {startMenuIframe}

      <div className="taskbar-separator"></div>

      <div className="flex-1 flex">
        {windows.map(
          (window) =>
            window.isOpen && (
              <button
                key={window.id}
                className={`taskbar-item ${
                  window.isOpen && !window.isMinimized ? "active" : ""
                }`}
                onClick={() => onWindowClick(window.id)}
              >
                <Monitor className="taskbar-item-icon" />
                <span className="truncate">{window.title}</span>
                {window.isOpen && !window.isMinimized ? (
                  <Minimize2 className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
                )}
              </button>
            )
        )}
      </div>

      <div className="taskbar-separator"></div>

      <div className="flex items-center px-3 font-medium">
        <Clock className="w-4 h-4 mr-2 text-primary" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
};

export default Taskbar;

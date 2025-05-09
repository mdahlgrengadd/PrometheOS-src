import { useCallback, useMemo } from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { useWindowStore } from "@/store/windowStore";
import { WindowState } from "@/types/window";

import { usePlugins } from "../plugins/PluginContext";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import ThemeSelector from "./ThemeSelector";
import Window from "./Window";

const Desktop = () => {
  const {
    loadedPlugins,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
  } = usePlugins();

  // Get the current theme
  const { theme } = useTheme();

  // Use store as single source of truth
  const windowsDict = useWindowStore((s) => s.windows);
  const move = useWindowStore((s) => s.move);
  const maximize = useWindowStore((s) => s.maximize);
  const focusWin = useWindowStore((s) => s.focus);

  // Memoized selectors
  const windows = useMemo(() => Object.values(windowsDict), [windowsDict]);

  const openWindows = useMemo(() => {
    return windows.filter((w) => w.isOpen);
  }, [windows]);

  const maximizedWindows = useMemo(() => {
    return windows
      .filter((w) => w.isOpen && !w.isMinimized && w.isMaximized)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [windows]);

  // Make desktop state available globally for syncing
  useMemo(() => {
    // Define a proper type for the window extension
    interface WindowWithDesktopState extends Window {
      __DESKTOP_STATE?: {
        windows: Array<Omit<WindowState, "content">>;
      };
    }

    (window as WindowWithDesktopState).__DESKTOP_STATE = {
      windows: windows.map((w) => ({
        id: w.id,
        title: w.title,
        isOpen: w.isOpen,
        isMinimized: w.isMinimized,
        zIndex: w.zIndex,
        position: w.position,
        size: w.size,
        isMaximized: w.isMaximized,
        previousPosition: w.previousPosition,
        previousSize: w.previousSize,
      })),
    };
  }, [windows]);

  // Action callbacks
  const maximizeWindow = useCallback(
    (id: string) => {
      maximize(id);
    },
    [maximize]
  );

  const updateWindowPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      move(id, position);
    },
    [move]
  );

  const handleTabClick = useCallback(
    (id: string) => {
      focusWindow(id);
    },
    [focusWindow]
  );

  // Handle taskbar window clicks
  const handleTaskbarWindowClick = useCallback(
    (id: string) => {
      const window = windows.find((w) => w.id === id);
      if (window?.isMinimized) {
        // For minimized windows, we should focus and restore them
        useWindowStore.getState().minimize(id, false);
        focusWindow(id);
      } else if (window?.isOpen) {
        minimizeWindow(id);
      } else {
        openWindow(id);
      }
    },
    [windows, focusWindow, minimizeWindow, openWindow]
  );

  // Check if we need to show the desktop-level tab bar (BeOS with maximized windows)
  const isBeOS = theme === "beos";
  // Only show the desktop tab bar when BeOS + maximized windows exist
  const maximizedBeOS = isBeOS && maximizedWindows.length > 0;

  // Check if Webamp plugin is available
  const hasWebampPlugin = loadedPlugins.some(
    (plugin) => plugin.id === "webamp"
  );

  return (
    <div className="desktop">
      {/*<div className="absolute top-2 right-2 z-50">
        <ThemeSelector />
      </div> */}

      {maximizedBeOS && (
        <div className="window-tab-bar">
          {maximizedWindows.map((window) => (
            <div
              key={window.id}
              className={`window-tab ${
                window.zIndex ===
                Math.max(...maximizedWindows.map((w) => w.zIndex))
                  ? "font-bold"
                  : ""
              }`}
              onClick={() => handleTabClick(window.id)}
            >
              <span className="window-tab-title">{window.title}</span>
              {/* Show window controls for all maximized windows */}
              <div className="window-controls">
                <button
                  className="window-control"
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                  aria-label="Minimize"
                >
                  <div className="h-2 w-2 bg-black rounded-none"></div>
                </button>
                <button
                  className="window-control"
                  onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow(window.id);
                  }}
                  aria-label="Maximize"
                >
                  <div className="h-2.5 w-2.5 border border-black"></div>
                </button>
                <button
                  className="window-control"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  aria-label="Close"
                >
                  <div className="h-2.5 w-2.5 relative">
                    <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Icons Layer - only visible when showIcons is true */}
      <DesktopIcons openWindow={openWindow} />

      {/* Windows Layer - absolute positioned, won't move when icons visibility changes */}
      <div className="windows-wrapper">
        {openWindows.map((w) => {
          // Look up the matching plugin and re-render its content
          const plugin = loadedPlugins.find((p) => p.id === w.id);
          const content = plugin ? plugin.render() : w.content;

          // Spread in fresh content for this render pass
          const winWithContent = { ...w, content };

          return (
            <Window
              key={winWithContent.id}
              window={winWithContent}
              allWindows={windows}
              onClose={() => closeWindow(winWithContent.id)}
              onMinimize={() => minimizeWindow(winWithContent.id)}
              onMaximize={() => maximizeWindow(winWithContent.id)}
              onFocus={() => focusWin(winWithContent.id)}
              onDragStop={(position) =>
                updateWindowPosition(winWithContent.id, position)
              }
              onTabClick={handleTabClick}
            />
          );
        })}
      </div>

      <Taskbar onWindowClick={handleTaskbarWindowClick} />
    </div>
  );
};

export default Desktop;

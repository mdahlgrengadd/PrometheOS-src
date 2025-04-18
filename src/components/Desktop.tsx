import { useEffect, useMemo, useState } from 'react';

import { eventBus } from '../plugins/EventBus';
import { usePlugins } from '../plugins/PluginContext';
import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';
import Window from './Window';

export interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  previousPosition?: { x: number; y: number };
  previousSize?: { width: number | string; height: number | string };
  isMaximized?: boolean;
}

const Desktop = () => {
  const {
    loadedPlugins,
    activeWindows,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
  } = usePlugins();
  const [windows, setWindows] = useState<WindowState[]>([]);

  // Set up windows based on loaded plugins
  useEffect(() => {
    // Only create windows that don't already exist
    const existingWindowIds = windows.map((w) => w.id);

    const newPluginWindows = loadedPlugins
      .filter((plugin) => !existingWindowIds.includes(plugin.id))
      .map((plugin) => {
        // Use preferred size from manifest if available, otherwise use defaults
        const defaultSize = { width: 400, height: 300 };
        const size = plugin.manifest.preferredSize || defaultSize;

        return {
          id: plugin.id,
          title: plugin.manifest.name,
          content: plugin.render(),
          isOpen: activeWindows.includes(plugin.id),
          isMinimized: false,
          zIndex: 1,
          position: {
            x: 100 + Math.random() * 100,
            y: 100 + Math.random() * 100,
          },
          size: size,
          isMaximized: false,
        };
      });

    // Update existing windows' active state without changing positions
    const updatedExistingWindows = windows.map((window) => ({
      ...window,
      isOpen: activeWindows.includes(window.id),
    }));

    setWindows([...updatedExistingWindows, ...newPluginWindows]);
  }, [loadedPlugins, activeWindows]);

  // Set up event listeners
  useEffect(() => {
    const handleWindowOpened = (pluginId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === pluginId
            ? { ...window, isOpen: true, isMinimized: false }
            : window
        )
      );
    };

    const handleWindowClosed = (pluginId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === pluginId ? { ...window, isOpen: false } : window
        )
      );
    };

    const handleWindowMinimized = (pluginId: string) => {
      setWindows((prev) =>
        prev.map((window) =>
          window.id === pluginId ? { ...window, isMinimized: true } : window
        )
      );
    };

    const handleWindowMaximized = (pluginId: string) => {
      setWindows((prev) =>
        prev.map((window) => {
          if (window.id === pluginId) {
            // Check if window is already maximized
            if (window.isMaximized) {
              // Restore previous size and position
              return {
                ...window,
                position: window.previousPosition || { x: 100, y: 100 },
                size: window.previousSize || { width: 500, height: 400 },
                isMaximized: false,
                previousPosition: undefined,
                previousSize: undefined,
              };
            } else {
              // Save current size and position
              return {
                ...window,
                previousPosition: { ...window.position },
                previousSize: { ...window.size },
                position: { x: 0, y: 0 },
                size: { width: "100%", height: "calc(100vh - 62px)" },
                isMaximized: true,
              };
            }
          }
          return window;
        })
      );
    };

    const handleWindowFocused = (pluginId: string) => {
      setWindows((prev) => {
        const highestZ = Math.max(...prev.map((w) => w.zIndex), 0);

        return prev.map((window) =>
          window.id === pluginId
            ? { ...window, zIndex: highestZ + 1, isMinimized: false }
            : window
        );
      });
    };

    // Subscribe to events
    const unsubscribeOpened = eventBus.subscribe(
      "window:opened",
      handleWindowOpened
    );
    const unsubscribeClosed = eventBus.subscribe(
      "window:closed",
      handleWindowClosed
    );
    const unsubscribeMinimized = eventBus.subscribe(
      "window:minimized",
      handleWindowMinimized
    );
    const unsubscribeMaximized = eventBus.subscribe(
      "window:maximized",
      handleWindowMaximized
    );
    const unsubscribeFocused = eventBus.subscribe(
      "window:focused",
      handleWindowFocused
    );

    return () => {
      // Clean up event subscriptions
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeMinimized();
      unsubscribeMaximized();
      unsubscribeFocused();
    };
  }, []);

  const maximizedWindows = windows
    .filter((w) => w.isOpen && !w.isMinimized && w.isMaximized)
    .sort((a, b) => b.zIndex - a.zIndex);

  const maximizeWindow = (id: string) => {
    eventBus.emit("window:maximized", id);
  };

  const updateWindowPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setWindows((prevWindows) =>
      prevWindows.map((window) =>
        window.id === id ? { ...window, position } : window
      )
    );
  };

  const handleTabClick = (id: string) => {
    focusWindow(id);
  };

  const iconWindows = useMemo(
    () =>
      windows.map((w) => {
        const plugin = loadedPlugins.find((p) => p.id === w.id);
        return {
          id: w.id,
          title: w.title,
          icon: plugin?.manifest.icon,
        };
      }),
    [windows, loadedPlugins]
  );

  // Memoize the openWindow callback to prevent unnecessary re-renders of DesktopIcons
  const memoizedOpenWindow = useMemo(() => {
    return (id: string) => openWindow(id);
  }, [openWindow]);

  return (
    <div className="desktop">
      {maximizedWindows.length > 0 && (
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
              {/* Show window controls for all maximized windows, not just the active one */}
              <div className="window-controls">
                <button
                  className="window-control"
                  onClick={(e) => {
                    e.stopPropagation();
                    eventBus.emit("window:minimized", window.id);
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

      <DesktopIcons windows={iconWindows} openWindow={memoizedOpenWindow} />

      {windows.map(
        (window) =>
          window.isOpen && (
            <Window
              key={window.id}
              window={window}
              allWindows={windows}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              onFocus={() => focusWindow(window.id)}
              onDragStop={(position) =>
                updateWindowPosition(window.id, position)
              }
              onTabClick={handleTabClick}
            />
          )
      )}

      <Taskbar
        windows={windows}
        onWindowClick={(id) => {
          const window = windows.find((w) => w.id === id);
          if (window?.isMinimized) {
            focusWindow(id);
          } else if (window?.isOpen) {
            minimizeWindow(id);
          } else {
            openWindow(id);
          }
        }}
      />
    </div>
  );
};

export default Desktop;

import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useWindowStore } from "@/store/windowStore";
import { WindowState } from "@/types/window";

import { eventBus } from "../plugins/EventBus";
import { usePlugins } from "../plugins/PluginContext";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import Window from "./Window";

const Desktop = () => {
  const {
    loadedPlugins,
    activeWindows,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
  } = usePlugins();

  // Use more targeted selectors from the store
  const windowsDict = useWindowStore((s) => s.windows);
  const registerWindow = useWindowStore((s) => s.registerWindow);
  const setOpen = useWindowStore((s) => s.setOpen);
  const minimize = useWindowStore((s) => s.minimize);
  const focusWin = useWindowStore((s) => s.focus);
  const move = useWindowStore((s) => s.move);
  const maximize = useWindowStore((s) => s.maximize);

  // More optimized selectors with memoization
  const openWindows = useMemo(() => {
    return Object.values(windowsDict).filter((w) => w.isOpen);
  }, [windowsDict]);

  const maximizedWindows = useMemo(() => {
    return Object.values(windowsDict)
      .filter((w) => w.isOpen && !w.isMinimized && w.isMaximized)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [windowsDict]);

  // Convert dict → array for full window list when needed
  const windows = useMemo(() => Object.values(windowsDict), [windowsDict]);

  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when active windows change
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Only clear "open" if there is no handshake or action in the URL:
    if (activeWindows.length === 0) {
      if (
        params.has("open") &&
        !params.has("handshake") &&
        !params.has("action")
      ) {
        params.delete("open");
        const newSearch = params.toString();
        navigate(newSearch ? `?${newSearch}` : "", { replace: true });
      }
      return;
    }

    // Otherwise sync the "open" param but leave handshake/action alone
    params.set("open", activeWindows.join(","));
    const newSearch = params.toString();
    if (newSearch !== location.search.replace(/^\?/, "")) {
      navigate(`?${newSearch}`, { replace: true });
    }
  }, [activeWindows, navigate, location]);

  // Set up windows based on loaded plugins
  useEffect(() => {
    // Grab current windows once
    const { windows } = useWindowStore.getState();
    const existingIds = Object.keys(windows);

    // Register only truly new plugins
    loadedPlugins.forEach((plugin) => {
      if (!existingIds.includes(plugin.id)) {
        const defaultSize = { width: 400, height: 300 };
        const size = plugin.manifest.preferredSize || defaultSize;

        registerWindow({
          id: plugin.id,
          title: plugin.manifest.name,
          content: plugin.render(),
          isOpen: false,
          isMinimized: false,
          zIndex: 1,
          position: {
            x: 100 + Math.random() * 100,
            y: 100 + Math.random() * 100,
          },
          size,
          isMaximized: false,
        });
      }
    });
  }, [loadedPlugins, registerWindow]);

  // Updated effect to handle active windows
  useEffect(() => {
    // Only update window open state, without modifying anything else
    activeWindows.forEach((id) => {
      setOpen(id, true);
    });
  }, [activeWindows, setOpen]);

  // Set up event listeners
  useEffect(() => {
    const handleWindowOpened = (pluginId: string) => setOpen(pluginId, true);
    const handleWindowClosed = (pluginId: string) => setOpen(pluginId, false);
    const handleWindowMinimized = (pluginId: string) =>
      minimize(pluginId, true);

    const handleWindowMaximized = (pluginId: string) => {
      maximize(pluginId);
    };

    // Add a handler for window position change events
    const handleWindowPositionChanged = (data: {
      id: string;
      position: { x: number; y: number };
    }) => {
      move(data.id, data.position);
    };

    // Add a handler for receiving full windows state sync
    const handleSyncWindows = (windowsState: WindowState[]) => {
      // Update store with synced windows
      windowsState.forEach((w) => {
        if (windowsDict[w.id]) {
          // Update position and other states except content
          const { content, ...stateWithoutContent } = w;
          const updatedWindow = {
            ...windowsDict[w.id],
            ...stateWithoutContent,
          };
          registerWindow(updatedWindow);
        }
      });
    };

    const subscriptions = [
      eventBus.subscribe("window:opened", handleWindowOpened),
      eventBus.subscribe("window:closed", handleWindowClosed),
      eventBus.subscribe("window:minimized", handleWindowMinimized),
      eventBus.subscribe("window:maximized", handleWindowMaximized),
      eventBus.subscribe(
        "window:position:changed",
        handleWindowPositionChanged
      ),
      eventBus.subscribe("sync:windows", handleSyncWindows),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [windowsDict, setOpen, minimize, maximize, move, registerWindow]);

  // Make desktop state available globally for syncing
  useEffect(() => {
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

  // Wrap in useCallback to prevent unnecessary re-renders
  const maximizeWindow = useCallback((id: string) => {
    eventBus.emit("window:maximized", id);
  }, []);

  const updateWindowPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      move(id, position);

      // Emit position change event for syncing
      eventBus.emit("window:position:changed", { id, position });
    },
    [move]
  );

  const handleTabClick = useCallback(
    (id: string) => {
      focusWindow(id);
    },
    [focusWindow]
  );

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

  // Add/update function to get direct launch URL for an app
  const getAppLaunchUrl = useCallback((appId: string) => {
    return `${window.location.origin}/apps/${appId}`;
  }, []);

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


import { useState, useEffect } from "react";
import { Minus, Square, X } from "lucide-react";
import Window from "./Window";
import Taskbar from "./Taskbar";
import DesktopIcons from "./DesktopIcons";
import { usePlugins } from "../plugins/PluginContext";
import { eventBus } from "../plugins/EventBus";

export interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}

const Desktop = () => {
  const { loadedPlugins, activeWindows, openWindow, closeWindow, minimizeWindow, focusWindow } = usePlugins();
  const [windows, setWindows] = useState<WindowState[]>([]);
  
  // Set up windows based on loaded plugins
  useEffect(() => {
    const newWindows = loadedPlugins.map(plugin => ({
      id: plugin.id,
      title: plugin.manifest.name,
      content: plugin.render(),
      isOpen: activeWindows.includes(plugin.id),
      isMinimized: false,
      zIndex: 1,
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      size: { width: 400, height: 300 }
    }));
    
    setWindows(newWindows);
  }, [loadedPlugins, activeWindows]);
  
  // Set up event listeners
  useEffect(() => {
    const handleWindowOpened = (pluginId: string) => {
      setWindows(prev => 
        prev.map(window => 
          window.id === pluginId ? { ...window, isOpen: true, isMinimized: false } : window
        )
      );
    };
    
    const handleWindowClosed = (pluginId: string) => {
      setWindows(prev => 
        prev.map(window => 
          window.id === pluginId ? { ...window, isOpen: false } : window
        )
      );
    };
    
    const handleWindowMinimized = (pluginId: string) => {
      setWindows(prev => 
        prev.map(window => 
          window.id === pluginId ? { ...window, isMinimized: true } : window
        )
      );
    };
    
    const handleWindowMaximized = (pluginId: string) => {
      setWindows(prev => 
        prev.map(window => {
          if (window.id === pluginId) {
            const isMaximized = window.size.width === "100%" && 
                              (window.size.height === "calc(100% - 48px)" || 
                               window.size.height === "calc(100vh - 62px)");
            return {
              ...window,
              position: isMaximized ? { x: 100, y: 100 } : { x: 0, y: 0 },
              size: isMaximized 
                ? { width: 500, height: 400 }
                : { width: "100%", height: "calc(100vh - 62px)" }
            };
          }
          return window;
        })
      );
    };
    
    const handleWindowFocused = (pluginId: string) => {
      setWindows(prev => {
        const highestZ = Math.max(...prev.map(w => w.zIndex), 0);
        
        return prev.map(window => 
          window.id === pluginId 
            ? { ...window, zIndex: highestZ + 1, isMinimized: false } 
            : window
        );
      });
    };
    
    // Subscribe to events
    const unsubscribeOpened = eventBus.subscribe('window:opened', handleWindowOpened);
    const unsubscribeClosed = eventBus.subscribe('window:closed', handleWindowClosed);
    const unsubscribeMinimized = eventBus.subscribe('window:minimized', handleWindowMinimized);
    const unsubscribeMaximized = eventBus.subscribe('window:maximized', handleWindowMaximized);
    const unsubscribeFocused = eventBus.subscribe('window:focused', handleWindowFocused);
    
    return () => {
      // Clean up event subscriptions
      unsubscribeOpened();
      unsubscribeClosed();
      unsubscribeMinimized();
      unsubscribeMaximized();
      unsubscribeFocused();
    };
  }, []);
  
  const maximizedWindows = windows.filter(w => 
    w.isOpen && 
    !w.isMinimized && 
    w.size.width === "100%" && 
    (w.size.height === "calc(100% - 48px)" || w.size.height === "calc(100vh - 62px)")
  ).sort((a, b) => b.zIndex - a.zIndex);
  
  const maximizeWindow = (id: string) => {
    eventBus.emit('window:maximized', id);
  };

  const updateWindowPosition = (id: string, position: { x: number; y: number }) => {
    setWindows(prevWindows => 
      prevWindows.map(window => 
        window.id === id 
          ? { ...window, position } 
          : window
      )
    );
  };

  const handleTabClick = (id: string) => {
    focusWindow(id);
  };

  return (
    <div className="desktop">
      {maximizedWindows.length > 0 && (
        <div className="window-tab-bar">
          {maximizedWindows.map(window => (
            <div 
              key={window.id} 
              className={`window-tab ${window.zIndex === Math.max(...maximizedWindows.map(w => w.zIndex)) ? 'font-bold' : ''}`}
              onClick={() => handleTabClick(window.id)}
            >
              <span className="window-tab-title">{window.title}</span>
              {window.zIndex === Math.max(...maximizedWindows.map(w => w.zIndex)) && (
                <div className="window-controls">
                  <button
                    className="window-control"
                    onClick={(e) => {
                      e.stopPropagation();
                      eventBus.emit('window:minimized', window.id);
                    }}
                    aria-label="Minimize"
                  >
                    <Minus className="h-2.5 w-2.5 text-black" />
                  </button>
                  <button
                    className="window-control"
                    onClick={(e) => {
                      e.stopPropagation();
                      maximizeWindow(window.id);
                    }}
                    aria-label="Maximize"
                  >
                    <Square className="h-2.5 w-2.5 text-black" />
                  </button>
                  <button
                    className="window-control"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(window.id);
                    }}
                    aria-label="Close"
                  >
                    <X className="h-2.5 w-2.5 text-black" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <DesktopIcons windows={windows} openWindow={(id) => openWindow(id)} />
      
      {windows.map(window => (
        window.isOpen && (
          <Window 
            key={window.id}
            window={window}
            allWindows={windows}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onDragStop={(position) => updateWindowPosition(window.id, position)}
            onTabClick={handleTabClick}
          />
        )
      ))}
      
      <Taskbar 
        windows={windows}
        onWindowClick={(id) => {
          const window = windows.find(w => w.id === id);
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

import { useState, useEffect } from "react";
import { Minus, Square, X } from "lucide-react";
import Window from "./Window";
import Taskbar from "./Taskbar";
import DesktopIcons from "./DesktopIcons";
import { AppWindow } from "./AppContents";

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
  const [windows, setWindows] = useState<WindowState[]>([
    {
      id: "notepad",
      title: "Notepad",
      content: <AppWindow.Notepad />,
      isOpen: false,
      isMinimized: false,
      zIndex: 1,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 }
    },
    {
      id: "calculator",
      title: "Calculator",
      content: <AppWindow.Calculator />,
      isOpen: false,
      isMinimized: false,
      zIndex: 1,
      position: { x: 150, y: 150 },
      size: { width: 320, height: 400 }
    },
    {
      id: "browser",
      title: "Browser",
      content: <AppWindow.Browser />,
      isOpen: false,
      isMinimized: false,
      zIndex: 1,
      position: { x: 200, y: 100 },
      size: { width: 600, height: 450 }
    },
    {
      id: "settings",
      title: "Settings",
      content: <AppWindow.Settings />,
      isOpen: false,
      isMinimized: false,
      zIndex: 1,
      position: { x: 250, y: 150 },
      size: { width: 450, height: 350 }
    },
    {
      id: "wordeditor",
      title: "Word Editor",
      content: <AppWindow.WordEditor />,
      isOpen: false,
      isMinimized: false,
      zIndex: 1,
      position: { x: 250, y: 200 },
      size: { width: 600, height: 450 }
    }
  ]);
  
  const maximizedWindows = windows.filter(w => 
    w.isOpen && 
    !w.isMinimized && 
    w.size.width === "100%" && 
    (w.size.height === "calc(100% - 48px)" || w.size.height === "calc(100vh - 62px)")
  ).sort((a, b) => b.zIndex - a.zIndex);

  const openWindow = (id: string) => {
    setWindows(prevWindows => {
      const highestZ = Math.max(...prevWindows.map(w => w.zIndex), 0);
      
      return prevWindows.map(window => {
        if (window.id === id) {
          return {
            ...window,
            isOpen: true,
            isMinimized: false,
            zIndex: highestZ + 1
          };
        }
        return window;
      });
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prevWindows => 
      prevWindows.map(window => 
        window.id === id 
          ? { ...window, isOpen: false } 
          : window
      )
    );
  };

  const minimizeWindow = (id: string) => {
    setWindows(prevWindows => 
      prevWindows.map(window => 
        window.id === id 
          ? { ...window, isMinimized: true } 
          : window
      )
    );
  };

  const maximizeWindow = (id: string) => {
    setWindows(prevWindows => 
      prevWindows.map(window => {
        if (window.id === id) {
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

  const focusWindow = (id: string) => {
    setWindows(prevWindows => {
      const highestZ = Math.max(...prevWindows.map(w => w.zIndex), 0);
      
      return prevWindows.map(window => 
        window.id === id 
          ? { ...window, zIndex: highestZ + 1, isMinimized: false } 
          : window
      );
    });
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
                      minimizeWindow(window.id);
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
      
      <DesktopIcons windows={windows} openWindow={openWindow} />
      
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

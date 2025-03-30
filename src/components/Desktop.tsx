
import { useState } from "react";
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
    }
  ]);

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
          // Toggle between maximized and normal size
          const isMaximized = window.size.width === "100%" && window.size.height === "calc(100% - 48px)";
          return {
            ...window,
            position: isMaximized ? { x: 100, y: 100 } : { x: 0, y: 0 },
            size: isMaximized 
              ? { width: 500, height: 400 }
              : { width: "100%", height: "calc(100% - 48px)" }
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

  return (
    <div className="desktop">
      <div className="desktop-blueprint-details"></div>
      <DesktopIcons windows={windows} openWindow={openWindow} />
      
      {windows.map(window => (
        window.isOpen && (
          <Window 
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onDragStop={(position) => updateWindowPosition(window.id, position)}
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

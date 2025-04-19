
import { useState, useCallback } from "react";
import { App } from "@/data/apps";

export interface Window {
  id: string;
  app: App;
  isOpen: boolean;
  isFocused: boolean;
  isMinimized: boolean;
  isFullScreen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const useWindowManager = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  const openWindow = useCallback((app: App) => {
    const existingWindowIndex = windows.findIndex(w => w.app.id === app.id);
    
    if (existingWindowIndex !== -1) {
      // If window exists, bring it to focus and unminimize
      focusWindow(windows[existingWindowIndex].id);
      if (windows[existingWindowIndex].isMinimized) {
        unminimizeWindow(windows[existingWindowIndex].id);
      }
      return;
    }

    // Random position within the viewport
    const randomX = Math.floor(Math.random() * 200);
    const randomY = Math.floor(Math.random() * 100) + 50;

    const newWindow: Window = {
      id: `window-${app.id}-${Date.now()}`,
      app,
      isOpen: true,
      isFocused: true,
      isMinimized: false,
      isFullScreen: false,
      zIndex: nextZIndex,
      position: { x: randomX, y: randomY },
      size: { width: 600, height: 400 },
    };

    setWindows(prev => {
      // Unfocus all other windows
      const updated = prev.map(w => ({ ...w, isFocused: false }));
      return [...updated, newWindow];
    });
    
    setActiveWindow(newWindow.id);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  }, [activeWindow]);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      return prev.map(w => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? nextZIndex : w.zIndex,
      }));
    });
    
    setActiveWindow(id);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(w => ({
        ...w,
        isMinimized: w.id === id ? true : w.isMinimized,
      }))
    );
    
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  }, [activeWindow]);

  const unminimizeWindow = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(w => ({
        ...w,
        isMinimized: w.id === id ? false : w.isMinimized,
        isFocused: w.id === id,
        zIndex: w.id === id ? nextZIndex : w.zIndex,
      }))
    );
    
    setActiveWindow(id);
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const toggleFullScreen = useCallback((id: string) => {
    setWindows(prev => 
      prev.map(w => ({
        ...w,
        isFullScreen: w.id === id ? !w.isFullScreen : w.isFullScreen,
      }))
    );
  }, []);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => 
      prev.map(w => ({
        ...w,
        position: w.id === id ? position : w.position,
      }))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev => 
      prev.map(w => ({
        ...w,
        size: w.id === id ? size : w.size,
      }))
    );
  }, []);

  return {
    windows,
    activeWindow,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    unminimizeWindow,
    toggleFullScreen,
    updateWindowPosition,
    updateWindowSize,
  };
};

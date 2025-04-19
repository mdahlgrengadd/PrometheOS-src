
import React, { createContext, useState, useContext, useCallback } from "react";
import { useWindowManager, Window } from "@/hooks/useWindowManager";
import { App, apps, getApp } from "@/data/apps";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShellContextType {
  // Shared
  apps: App[];
  activeApp: string | null;
  openApp: (appId: string) => void;
  closeApp: (appId: string) => void;
  
  // Desktop
  windows: Window[];
  openWindow: (app: App) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  unminimizeWindow: (id: string) => void;
  toggleFullScreen: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  
  // Mobile
  currentHomeScreen: number;
  setCurrentHomeScreen: (index: number) => void;
  isMobile: boolean;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [currentHomeScreen, setCurrentHomeScreen] = useState(0);
  
  const {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    unminimizeWindow,
    toggleFullScreen,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowManager();

  const openApp = useCallback((appId: string) => {
    const app = getApp(appId);
    if (!app) return;
    
    if (isMobile) {
      // Mobile just sets active app
      setActiveApp(appId);
    } else {
      // Desktop opens a window
      openWindow(app);
    }
  }, [isMobile, openWindow]);

  const closeApp = useCallback((appId: string) => {
    if (isMobile) {
      if (activeApp === appId) {
        setActiveApp(null);
      }
    } else {
      // Find and close window with this app
      const window = windows.find(w => w.app.id === appId);
      if (window) {
        closeWindow(window.id);
      }
    }
  }, [isMobile, activeApp, windows, closeWindow]);

  return (
    <ShellContext.Provider
      value={{
        apps,
        activeApp,
        openApp,
        closeApp,
        
        // Desktop
        windows,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        unminimizeWindow,
        toggleFullScreen,
        updateWindowPosition,
        updateWindowSize,
        
        // Mobile
        currentHomeScreen,
        setCurrentHomeScreen,
        isMobile,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
};

export const useShell = () => {
  const context = useContext(ShellContext);
  if (context === undefined) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
};

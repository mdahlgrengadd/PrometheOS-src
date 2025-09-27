// Window Manager - Preserves Zustand-based window management
import React, { useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';

interface WindowManagerProps {
  children: React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const windows = useWindowStore((s) => s.windows);
  const openWindows = useWindowStore((s) => s.openWindows);
  const minimizedWindows = useWindowStore((s) => s.minimizedWindows);
  const maximizedWindows = useWindowStore((s) => s.maximizedWindows);
  const initWindowStore = useWindowStore((s) => s.init!);

  useEffect(() => {
    // Initialize window store on mount
    console.log('[WindowManager] Initializing window management system...');
    initWindowStore();

    // Clean up localStorage in development mode (preserving existing behavior)
    if (process.env.NODE_ENV === 'development') {
      console.log('[WindowManager] Development mode - clearing window state');
      // Match zustand persist key in windowStore
      localStorage.removeItem('desktop-window-state');
    }

    console.log(
      `[WindowManager] Initialized with ${Object.keys(windows || {}).length} registered windows`
    );
  }, [initWindowStore]);

  // Global window management event handlers
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      // Alt+Tab window switching (future enhancement)
      if (event.altKey && event.key === 'Tab') {
        event.preventDefault();
        // TODO: Implement window switching logic
      }

      // Escape key handling
      if (event.key === 'Escape') {
        // TODO: Handle escape key for window management
      }
    };

    // Global click handler for window focus management
    const handleGlobalClick = (event: MouseEvent) => {
      // Window focus management will be handled by individual windows
      // This is a placeholder for global window management logic
    };

    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Log window state changes for debugging
  useEffect(() => {
    console.log(`[WindowManager] State update:`, {
      totalWindows: Object.keys(windows || {}).length,
      openWindows: openWindows.length,
      minimizedWindows: minimizedWindows.length,
      maximizedWindows: maximizedWindows.length,
    });
  }, [windows, openWindows.length, minimizedWindows.length, maximizedWindows.length]);

  return (
    <div className="window-manager w-full h-full relative overflow-hidden">
      {children}
    </div>
  );
};

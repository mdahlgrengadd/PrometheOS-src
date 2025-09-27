// Window Manager - Preserves Zustand-based window management
import React, { useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';

interface WindowManagerProps {
  children: React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const windows = useWindowStore((s) => s.windows);
  const initWindowStore = useWindowStore((s) => s.init!);
  
  // Calculate computed values from windows
  const openWindows = Object.values(windows).filter(w => w.isOpen);
  const minimizedWindows = Object.values(windows).filter(w => w.isMinimized);
  const maximizedWindows = Object.values(windows).filter(w => w.isMaximized);

  useEffect(() => {
    // Initialize window store on mount
    console.log('[WindowManager] Initializing window management system...');
    initWindowStore();

    // Clean up localStorage in development mode (preserving existing behavior)
    // Do not clear persisted state automatically in development; it can race hydration
    if (process.env.NODE_ENV === 'development') {
      console.log('[WindowManager] Development mode - preserving window state');
    }

    console.log(
      `[WindowManager] Initialized (registered windows will appear as they are added)`
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

      // Dev: Ctrl+N to open Notepad
      if (event.ctrlKey && event.key.toLowerCase() === 'n') {
        const store = (window as any).useWindowStore?.getState?.() || undefined;
        try {
          // Prefer direct store import
          const s = require('../store/windowStore');
          const api = s?.useWindowStore?.getState?.();
          if (api?.setOpen) {
            api.setOpen('notepad', true);
            api.focus('notepad');
            console.log('[WindowManager] Ctrl+N → Opened notepad');
          }
        } catch (_) {
          // Fallback: try global attached (if any)
          if (store?.setOpen) {
            store.setOpen('notepad', true);
            store.focus('notepad');
            console.log('[WindowManager] Ctrl+N → Opened notepad');
          }
        }
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

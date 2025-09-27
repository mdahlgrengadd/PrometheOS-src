import React, { useEffect, useRef } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useRemoteRegistry } from '../shell/RemoteRegistry';

export const DesktopBootstrap: React.FC = () => {
  const windows = useWindowStore((s) => s.windows);
  const registerWindow = useWindowStore((s) => s.registerWindow);
  const setOpen = useWindowStore((s) => s.setOpen);
  const focus = useWindowStore((s) => s.focus);
  const { registerRemote } = useRemoteRegistry();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (hasInitialized.current) {
      console.log('[DesktopBootstrap] Already initialized, skipping...');
      return;
    }
    hasInitialized.current = true;

    console.log('[DesktopBootstrap] Initializing desktop applications...');
    console.log('[DesktopBootstrap] Current windows:', Object.keys(windows));

    // Register default applications
    const defaultApps = [
      {
        id: 'notepad',
        title: 'Notepad',
        position: { x: 100, y: 100 },
        size: { width: 600, height: 400 },
        isOpen: true, // Start with window open immediately
        isMaximized: false,
        isMinimized: false,
        zIndex: 1,
        content: null, // Will be populated when remote loads
      },
    ];

    defaultApps.forEach(app => {
      console.log(`[DesktopBootstrap] Processing app: ${app.id}, exists: ${!!windows[app.id]}`);
      
      // Always register the window (registerWindow handles existing windows)
      registerWindow(app);
      console.log(`[DesktopBootstrap] Registered window: ${app.id}`);
      
      // Ensure it's open and focused
      setTimeout(() => {
        setOpen(app.id, true);
        focus(app.id);
        console.log(`[DesktopBootstrap] Set open and focused: ${app.id}`);
      }, 100);
    });

  }, []); // Remove dependencies to prevent re-running

  return null;
};

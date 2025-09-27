import React, { useEffect } from 'react';
import { useWindowStore } from '../store/windowStore';
import { useRemoteRegistry } from '../shell/RemoteRegistry';

export const DesktopBootstrap: React.FC = () => {
  const { registerWindow, setOpen } = useWindowStore();
  const { registerRemote } = useRemoteRegistry();

  useEffect(() => {
    console.log('[DesktopBootstrap] Initializing desktop applications...');

    // Register default applications
    const defaultApps = [
      {
        id: 'notepad',
        title: 'Notepad',
        position: { x: 100, y: 100 },
        size: { width: 600, height: 400 },
        isOpen: false,
        isMaximized: false,
        isMinimized: false,
        zIndex: 1,
        content: null, // Will be populated when remote loads
      },
    ];

    defaultApps.forEach(app => {
      registerWindow(app);
      console.log(`[DesktopBootstrap] Registered window: ${app.id}`);
    });

    // Auto-open notepad for testing
    setTimeout(() => {
      setOpen('notepad', true);
      console.log('[DesktopBootstrap] Auto-opened notepad for testing');
    }, 1000);

  }, [registerWindow, setOpen, registerRemote]);

  return null;
};
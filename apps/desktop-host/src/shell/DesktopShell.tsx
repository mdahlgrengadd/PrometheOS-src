// Desktop Shell - Main UI container for host
import React from 'react';
import { useWindowStore } from '../store/windowStore';
import { RemoteWindowRenderer } from './RemoteWindowRenderer';
import { DesktopBackground } from './DesktopBackground';

export const DesktopShell: React.FC = () => {
  // Get windows and filter for open ones
  const windows = useWindowStore((s) => s.windows);
  const openWindows = Object.values(windows).filter(w => w.isOpen);

  console.log('[DesktopShell] Rendering with', openWindows.length, 'open windows');
  console.log('[DesktopShell] All windows:', Object.keys(windows));
  console.log('[DesktopShell] Open windows:', openWindows.map(w => ({ id: w.id, isOpen: w.isOpen, title: w.title })));

  return (
    <div className="desktop-shell w-full h-full relative overflow-hidden bg-blue-500">
      {/* Desktop Background */}
      <DesktopBackground />

      {/* Debug indicator */}
      <div className="absolute top-4 left-4 bg-red-500 text-white p-4 rounded z-50">
        🖥️ Desktop Shell Active - {openWindows.length} windows
      </div>

      {/* Remote Windows Layer */}
      <div className="windows-layer absolute inset-0 pointer-events-none">
        {openWindows.map((window) => (
          <RemoteWindowRenderer
            key={window.id}
            window={window}
          />
        ))}
      </div>

      {/* Desktop Icons/Taskbar Layer (future enhancement) */}
      <div className="desktop-ui-layer absolute inset-0 pointer-events-none">
        {/* Desktop icons, taskbar, etc. will be added here */}
      </div>
    </div>
  );
};

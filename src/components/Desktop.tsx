import React, { useCallback, useEffect, useMemo } from 'react';

import { useTheme } from '@/lib/ThemeProvider';
import { useWindowStore } from '@/store/windowStore';
import { WindowState } from '@/types/window';
import { getAppsToLaunchFromUrl, getPluginInitFromUrl } from '@/utils/url';

// Import Desktop3D component
import Desktop3D from '../plugins/apps/desktop-3d/components/Desktop3D';
import { usePlugins } from '../plugins/PluginContext';
import AppWindow from './AppWindow';
import DesktopIcons from './DesktopIcons';
import Taskbar from './Taskbar';

const Desktop = () => {
  // Open apps from URL after all plugins/windows are registered
  useEffect(() => {
    // Handle app opening with initialization data
    const appsToLaunch = getAppsToLaunchFromUrl();
    console.log("[Desktop] Apps to launch from URL:", appsToLaunch);

    appsToLaunch.forEach(({ appId, initFromUrl }) => {
      console.log(
        `[Desktop] Opening app ${appId}${
          initFromUrl ? ` with init URL: ${initFromUrl}` : ""
        }`
      );
      openWindow(appId, initFromUrl);
    });

    // Handle legacy plugin initialization with URL (for backward compatibility)
    const pluginInit = getPluginInitFromUrl();
    if (
      pluginInit?.pluginId &&
      !appsToLaunch.find((app) => app.appId === pluginInit.pluginId)
    ) {
      console.log(
        "[Desktop] Opening plugin with init URL (legacy):",
        pluginInit
      );
      openWindow(pluginInit.pluginId, pluginInit.initFromUrl);
    }

    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const {
    loadedPlugins,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
  } = usePlugins();

  // Get the current theme
  const { theme } = useTheme();

  // Use store as single source of truth
  const windowsDict = useWindowStore((s) => s.windows);
  const move = useWindowStore((s) => s.move);
  const maximize = useWindowStore((s) => s.maximize);
  const focusWin = useWindowStore((s) => s.focus);

  // Memoized selectors
  const windows = useMemo(() => Object.values(windowsDict), [windowsDict]);

  const openWindows = useMemo(() => {
    return windows.filter((w) => w.isOpen);
  }, [windows]);

  const maximizedWindows = useMemo(() => {
    return windows
      .filter((w) => w.isOpen && !w.isMinimized && w.isMaximized)
      .sort((a, b) => b.zIndex - a.zIndex);
  }, [windows]);

  // Make desktop state available globally for syncing
  useMemo(() => {
    // Define a proper type for the window extension
    interface WindowWithDesktopState extends Window {
      __DESKTOP_STATE?: {
        windows: Array<Omit<WindowState, "content">>;
      };
    }

    (window as WindowWithDesktopState).__DESKTOP_STATE = {
      windows: windows.map((w) => ({
        id: w.id,
        title: w.title,
        isOpen: w.isOpen,
        isMinimized: w.isMinimized,
        zIndex: w.zIndex,
        position: w.position,
        size: w.size,
        isMaximized: w.isMaximized,
        previousPosition: w.previousPosition,
        previousSize: w.previousSize,
      })),
    };
  }, [windows]);

  // Action callbacks
  const maximizeWindow = useCallback(
    (id: string) => {
      maximize(id);
    },
    [maximize]
  );

  const updateWindowPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      move(id, position);
    },
    [move]
  );

  const handleTabClick = useCallback(
    (id: string) => {
      focusWindow(id);
    },
    [focusWindow]
  );

  // Handle taskbar window clicks
  const handleTaskbarWindowClick = useCallback(
    (id: string) => {
      const window = windows.find((w) => w.id === id);
      if (window?.isMinimized) {
        // For minimized windows, we should focus and restore them
        useWindowStore.getState().minimize(id, false);
        focusWindow(id);
      } else if (window?.isOpen) {
        minimizeWindow(id);
      } else {
        openWindow(id);
      }
    },
    [windows, focusWindow, minimizeWindow, openWindow]
  );

  // Check if we need to show the desktop-level tab bar (BeOS with maximized windows)
  const isBeOS = theme === "beos";
  // Only show the desktop tab bar when BeOS + maximized windows exist
  const maximizedBeOS = isBeOS && maximizedWindows.length > 0;

  // Check if Webamp plugin is available
  const hasWebampPlugin = loadedPlugins.some(
    (plugin) => plugin.id === "webamp"
  );

  // Use Desktop3D as the main desktop environment
  return (
    <div className="desktop">
      <Desktop3D
        windows={windows}
        plugins={loadedPlugins}
        openWindow={openWindow}
        closeWindow={closeWindow}
        minimizeWindow={minimizeWindow}
        maximizeWindow={maximizeWindow}
        focusWindow={focusWindow}
        handleDragStop={updateWindowPosition}
        handleTabClick={handleTabClick}
        use3DBackground={false}
      />
    </div>
  );
};

export default Desktop;

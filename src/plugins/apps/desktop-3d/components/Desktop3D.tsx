import React, { useCallback, useEffect, useRef, useState } from 'react';

// Import types from main application
import { WindowState } from '../../../../types/window';
// Import the real Plugin interface from main system
import { Plugin } from '../../../types';
import { useWindowStore } from '../stores/windowStore';
import { WindowData } from '../types/Window';
import { DesktopCanvas } from './DesktopCanvas';
import { LayoutType } from './IconInstances';
import { IconSize } from './LayoutControls';
import Taskbar from './Taskbar';

// Camera control options interface
interface CameraControlOptions {
  enabled?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  lockRotationX?: boolean;
  lockRotationY?: boolean;
  lockRotationZ?: boolean;
  lockPanX?: boolean;
  lockPanY?: boolean;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}

interface Desktop3DProps {
  // Window management from main Desktop
  windows: WindowState[];
  plugins: Plugin[];
  openWindow: (pluginId: string, initFromUrl?: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  handleDragStop: (id: string, position: { x: number; y: number }) => void;
  handleTabClick: (id: string) => void;
}

/**
 * Desktop3D - Main desktop environment component using dual renderer system
 *
 * Combines react-three-fiber WebGL rendering for 3D icons and background with
 * CSS3DRenderer for HTML-based windows. Now integrates with the existing
 * window management system and VFS-based desktop icons.
 */
const Desktop3D: React.FC<Desktop3DProps> = ({
  windows: mainWindows,
  plugins,
  openWindow: mainOpenWindow,
  closeWindow: mainCloseWindow,
  minimizeWindow: mainMinimizeWindow,
  maximizeWindow: mainMaximizeWindow,
  focusWindow: mainFocusWindow,
  handleDragStop: mainHandleDragStop,
  handleTabClick: mainHandleTabClick,
}) => {
  // Convert main windows to Desktop3D format for compatibility
  const [windows, setWindows] = useState<WindowData[]>([]);

  // Load layout from localStorage or default to "grid"
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(() => {
    const savedLayout = localStorage.getItem("desktop3d-layout") as LayoutType;
    return savedLayout &&
      ["table", "sphere", "helix", "grid", "columns"].includes(savedLayout)
      ? savedLayout
      : "grid";
  });

  const [animationRandomness, setAnimationRandomness] = useState({
    maxRandomDelay: 400,
    speedVariation: 0.5,
  });

  // Load icon size from localStorage or default to "large"
  const [iconSize, setIconSize] = useState<IconSize>(() => {
    const savedIconSize = localStorage.getItem(
      "desktop3d-iconSize"
    ) as IconSize;
    return savedIconSize && ["small", "medium", "large"].includes(savedIconSize)
      ? savedIconSize
      : "large";
  });

  // Zustand store for window positions
  const {
    updateWindowPosition,
    updateWindowState,
    getWindowPosition,
    getWindowState,
    removeWindow,
  } = useWindowStore();

  // Camera control state
  const [cameraControls, setCameraControls] = useState<CameraControlOptions>({
    enabled: true,
    enableRotate: true,
    enablePan: true,
    enableZoom: true,
    lockRotationX: false,
    lockRotationY: false,
    lockRotationZ: true,
    lockPanX: false,
    lockPanY: false,
    minDistance: 500,
    maxDistance: 6000,
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 0.2,
  });

  // Keep track of window refs for state management
  const windowsRef = useRef<WindowData[]>(windows);
  windowsRef.current = windows;

  // Persist layout to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("desktop3d-layout", currentLayout);
  }, [currentLayout]);

  // Persist icon size to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("desktop3d-iconSize", iconSize);
  }, [iconSize]);

  // Convert main windows to 3D format when they change
  useEffect(() => {
    console.log(
      "Desktop3D: Converting windows, plugins available:",
      plugins.length
    );
    console.log(
      "Desktop3D: Plugin list:",
      plugins.map((p) => ({ id: p.id, name: p.manifest?.name }))
    );

    const converted3DWindows: WindowData[] = mainWindows
      .filter((w) => w.isOpen && !w.isMinimized)
      .map((w) => {
        const plugin = plugins.find((p) => p.id === w.id);

        // Always use the window's pre-configured content (PluginWrapper handles loading)
        console.log(`Desktop3D: Using window content for ${w.id} (${w.title})`);
        console.log(
          `Desktop3D: Window content type:`,
          typeof w.content,
          w.content
        );
        const content = w.content;

        return {
          id: w.id,
          title: w.title,
          content: content,
          position: {
            x: w.position.x,
            y: w.position.y,
            z: 0,
          },
          size: {
            width:
              typeof w.size.width === "number"
                ? w.size.width
                : parseInt(w.size.width as string),
            height:
              typeof w.size.height === "number"
                ? w.size.height
                : parseInt(w.size.height as string),
          },
          isMinimized: w.isMinimized,
          isMaximized: w.isMaximized,
          zIndex: w.zIndex,
        };
      });

    setWindows(converted3DWindows);
  }, [mainWindows, plugins]);

  /**
   * Create a new window with proper positioning constraints
   * Now uses the main app's window creation system
   * NOTE: This should rarely be used since we primarily launch plugins
   */
  const createWindow = useCallback(
    (title: string, content: React.ReactNode) => {
      console.log(
        `Desktop3D: createWindow called with title: ${title}, content:`,
        content
      );
      // Don't create windows with custom content, only launch plugins
      console.warn(
        `Desktop3D: createWindow should not be used for plugin content. Title: ${title}`
      );
    },
    []
  );

  /**
   * Handle layout changes for icons
   */
  const handleLayoutChange = useCallback((layout: LayoutType) => {
    setCurrentLayout(layout);
  }, []);

  /**
   * Handle icon size changes
   */
  const handleIconSizeChange = useCallback((size: IconSize) => {
    setIconSize(size);
  }, []);

  /**
   * Handle animation randomness changes
   */
  const handleRandomnessChange = useCallback(
    (randomness: { maxRandomDelay: number; speedVariation: number }) => {
      setAnimationRandomness(randomness);
    },
    []
  );

  /**
   * Handle window drag updates - delegate to main system
   */
  const handleWindowDrag = useCallback(
    (id: string, position: { x: number; y: number; z: number }) => {
      // Update local state for immediate feedback
      setWindows((prev) =>
        prev.map((win) => (win.id === id ? { ...win, position } : win))
      );

      // Update main system
      mainHandleDragStop(id, { x: position.x, y: position.y });
      updateWindowPosition(id, position);
    },
    [mainHandleDragStop, updateWindowPosition]
  );

  /**
   * Handle window close - delegate to main system
   */
  const handleWindowClose = useCallback(
    (id: string) => {
      mainCloseWindow(id);
      removeWindow(id);
    },
    [mainCloseWindow, removeWindow]
  );

  /**
   * Handle window minimize - delegate to main system
   */
  const handleWindowMinimize = useCallback(
    (id: string) => {
      const currentWindow = windowsRef.current.find((w) => w.id === id);
      if (!currentWindow) return;

      // Store current state before minimizing
      const stateToStore = {
        position: currentWindow.position,
        isMaximized: currentWindow.isMaximized,
        originalState: currentWindow.originalState,
      };

      updateWindowState(id, stateToStore);
      mainMinimizeWindow(id);
    },
    [mainMinimizeWindow, updateWindowState]
  );

  /**
   * Handle window maximize/restore - delegate to main system
   */
  const handleWindowMaximize = useCallback(
    (id: string) => {
      mainMaximizeWindow(id);
    },
    [mainMaximizeWindow]
  );

  /**
   * Handle window focus - delegate to main system
   */
  const handleWindowFocus = useCallback(
    (id: string) => {
      mainFocusWindow(id);
    },
    [mainFocusWindow]
  );

  /**
   * Handle window restore from taskbar - delegate to main system
   */
  const handleWindowRestore = useCallback(
    (id: string) => {
      mainHandleTabClick(id);
    },
    [mainHandleTabClick]
  );

  /**
   * Handle camera controls changes
   */
  const handleCameraControlsChange = useCallback(
    (controls: CameraControlOptions) => {
      setCameraControls(controls);
    },
    []
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* 3D Desktop Canvas with icons and windows */}
      <DesktopCanvas
        windows={windows}
        onWindowCreate={createWindow}
        onWindowDrag={handleWindowDrag}
        onWindowClose={handleWindowClose}
        onWindowMinimize={handleWindowMinimize}
        onWindowMaximize={handleWindowMaximize}
        onWindowFocus={handleWindowFocus}
        currentLayout={currentLayout}
        iconSize={iconSize}
        animationRandomness={animationRandomness}
        cameraControls={cameraControls}
        use3DBackground={true}
        environmentPreset="sunset"
        enable3DMeshIcons={true}
        meshIconPercentage={0.25}
        plugins={plugins}
        onPluginLaunch={mainOpenWindow}
      />

      {/* Taskbar with 3D layout controls */}
      <Taskbar
        windows={windows}
        onWindowRestore={handleWindowRestore}
        onLayoutChange={handleLayoutChange}
        currentLayout={currentLayout}
        iconSize={iconSize}
        onIconSizeChange={handleIconSizeChange}
        animationRandomness={animationRandomness}
        onRandomnessChange={handleRandomnessChange}
        cameraControls={cameraControls}
        onCameraControlsChange={handleCameraControlsChange}
      />
    </div>
  );
};

export default Desktop3D;

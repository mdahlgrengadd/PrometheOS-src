import React, { useEffect, useRef } from 'react';

import { useShell } from '@/contexts/ShellContext';

import Dock from './Dock';
import Window from './Window';

// Prioritize capturing mouse events over default behavior
const CAPTURE_EVENTS = true;

const DesktopShell: React.FC = () => {
  const { windows, apps, openApp } = useShell();
  const desktopRef = useRef<HTMLDivElement>(null);
  const wallpaperRef = useRef<HTMLDivElement>(null);
  const windowsContainerRef = useRef<HTMLDivElement>(null);

  // DEBUG: Log render
  useEffect(() => {
    console.log("[DESKTOP DEBUG] DesktopShell rendered", {
      windowCount: windows.length,
    });

    // Log window state for debugging
    windows.forEach((window) => {
      console.log(`[DESKTOP DEBUG] Window state: ${window.id}`, {
        focused: window.isFocused,
        zIndex: window.zIndex,
        position: window.position,
      });
    });
  }, [windows]);

  // Set up desktop click handlers
  useEffect(() => {
    const desktop = desktopRef.current;
    const wallpaper = wallpaperRef.current;
    const windowsContainer = windowsContainerRef.current;

    if (!desktop || !wallpaper || !windowsContainer) return;

    console.log("[DESKTOP DEBUG] Setting up desktop event handlers");

    // CRITICAL FIX: Make the windows container pass through pointer events when clicking
    // on areas without windows - but only for clicks, not for movement
    const handleWindowsContainerMouseEvents = (e: MouseEvent) => {
      // Only process click events directly on the container itself (not on windows)
      // This prevents interference with window dragging
      const isWindowsContainerDirect = e.target === windowsContainer;

      console.log("[DESKTOP DEBUG] Windows container event", {
        type: e.type,
        isWindowsContainerDirect,
        target: e.target,
      });

      // If clicking directly on the container (not on a window),
      // pass the click through to elements underneath
      if (isWindowsContainerDirect) {
        console.log("[DESKTOP DEBUG] Passing event through windows container");

        // Find element directly underneath at these coordinates
        const elementsBelow = document.elementsFromPoint(e.clientX, e.clientY);

        // Find the first element that's not this container and not a child of this container
        const targetBelow = elementsBelow.find(
          (el) =>
            el !== windowsContainer &&
            !windowsContainer.contains(el) &&
            el !== document.body &&
            el !== document.documentElement
        );

        if (targetBelow) {
          console.log("[DESKTOP DEBUG] Found element below:", targetBelow);

          // Dispatch a new event to the element below
          const newEvent = new MouseEvent(e.type, {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
            button: e.button,
          });

          // Stop the event on this container (only for clicks, not mousedown)
          // This ensures window dragging still works
          if (e.type === "click") {
            e.stopPropagation();
          }

          targetBelow.dispatchEvent(newEvent);
        }
      }
    };

    // Handle wallpaper (background) click
    const handleWallpaperClick = (e: MouseEvent) => {
      console.log("[DESKTOP DEBUG] Wallpaper click", {
        target: e.target,
        currentTarget: e.currentTarget,
      });

      // Only handle clicks directly on the wallpaper, not on nested elements
      if (
        e.target === wallpaper ||
        (e.target as HTMLElement).classList.contains("desktop-background")
      ) {
        // Desktop background was clicked, not a window or icon
        console.log("[DESKTOP DEBUG] Direct wallpaper click detected");
      }
    };

    // Set up capture phase listener for better event detection
    wallpaper.addEventListener("click", handleWallpaperClick, {
      capture: CAPTURE_EVENTS,
    });

    // Critical fix for windows container - ONLY USE CLICK HANDLER
    // This is the key fix - we only want to modify click events, not mousedown
    // which is used for dragging operations
    windowsContainer.addEventListener(
      "click",
      handleWindowsContainerMouseEvents,
      { capture: true }
    );

    // Also listen for pointerdown events which happen before clicks
    const handleWallpaperPointerDown = (e: PointerEvent) => {
      console.log("[DESKTOP DEBUG] Wallpaper pointerDown", {
        pointerType: e.pointerType,
        target: e.target,
      });
    };

    wallpaper.addEventListener("pointerdown", handleWallpaperPointerDown, {
      capture: CAPTURE_EVENTS,
    });

    return () => {
      wallpaper.removeEventListener("click", handleWallpaperClick, {
        capture: CAPTURE_EVENTS,
      });
      wallpaper.removeEventListener("pointerdown", handleWallpaperPointerDown, {
        capture: CAPTURE_EVENTS,
      });
      windowsContainer.removeEventListener(
        "click",
        handleWindowsContainerMouseEvents,
        { capture: true }
      );
    };
  }, []);

  const handleAppClick = (e: React.MouseEvent, appId: string) => {
    console.log("[DESKTOP DEBUG] App icon clicked", { appId });

    // Ensure event doesn't propagate
    e.preventDefault();
    e.stopPropagation();

    // Open the app
    openApp(appId);
  };

  return (
    <div
      ref={desktopRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100"
      style={{
        touchAction: "none",
        // Ensure this creates a proper stacking context
        zIndex: 0,
        position: "relative",
      }}
      data-testid="desktop-shell"
    >
      {/* Wallpaper with explicit event handlers - Add desktop-background class for event detection */}
      <div
        ref={wallpaperRef}
        className="absolute inset-0 z-0 pointer-events-auto desktop-background"
        onClick={(e) => {
          console.log("[DESKTOP DEBUG] Wallpaper React click", {
            target: e.target,
            currentTarget: e.currentTarget,
          });
        }}
        onPointerDown={(e) => {
          console.log("[DESKTOP DEBUG] Wallpaper React pointerDown", {
            pointerType: e.pointerType,
            target: e.target,
          });
        }}
      >
        {/* Desktop Icons */}
        <div className="grid grid-cols-6 gap-4 p-4 pointer-events-auto">
          {apps.slice(0, 12).map((app) => (
            <div
              key={app.id}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-white/20 cursor-pointer pointer-events-auto"
              onClick={(e) => handleAppClick(e, app.id)}
              data-app-id={app.id}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${app.color}`}
              >
                <app.icon size={20} className="text-white" />
              </div>
              <span className="mt-1 text-xs text-center font-medium">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Windows container - now always pointer-events-auto to ensure dragging works */}
      <div
        ref={windowsContainerRef}
        className="absolute inset-0 z-10 pointer-events-auto"
        style={{
          // Ensure proper stacking context
          isolation: "isolate",
        }}
      >
        {/* Debugging message */}
        {windows.length === 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur p-2 rounded text-sm pointer-events-none">
            Click on any app icon to open a window
          </div>
        )}

        {/* Windows need pointer-events-auto to be clickable */}
        <div className="windows-wrapper">
          {windows.map((window) => (
            <Window key={window.id} window={window} />
          ))}
        </div>
      </div>

      {/* Dock with highest z-index */}
      <Dock />
    </div>
  );
};

export default DesktopShell;

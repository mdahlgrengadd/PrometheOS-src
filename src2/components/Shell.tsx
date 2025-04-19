import React, { useCallback, useEffect, useRef } from 'react';

import { ShellProvider, useShell } from '@/contexts/ShellContext';

import DesktopShell from './desktop/DesktopShell';
import MobileShell from './mobile/MobileShell';

// Global debug flag
const DEBUG = true;

const ShellContent: React.FC = () => {
  const { isMobile } = useShell();
  const shellRef = useRef<HTMLDivElement>(null);

  // Debug logging helper
  const logDebug = useCallback(
    (
      message: string,
      data?: Record<string, unknown> | string | number | boolean
    ) => {
      if (DEBUG) {
        console.log(`[SHELL DEBUG] ${message}`, data || "");
      }
    },
    []
  );

  // Set up global mouse event handlers for desktop mode
  useEffect(() => {
    logDebug(`Shell mounted, isMobile: ${isMobile}`);

    if (!isMobile) {
      logDebug("Desktop mode detected, setting up enhanced event handlers");

      // This helps ensure mouse events are captured properly
      const handleMouseDown = (e: MouseEvent) => {
        logDebug("Global mousedown", {
          target: e.target,
          button: e.button,
          clientX: e.clientX,
          clientY: e.clientY,
        });
      };

      const handleClick = (e: MouseEvent) => {
        logDebug("Global click", {
          target: e.target,
          tagName: (e.target as HTMLElement)?.tagName,
          className: (e.target as HTMLElement)?.className,
        });
      };

      // Pointer events should handle both mouse and touch inputs better
      const handlePointerDown = (e: PointerEvent) => {
        logDebug("Global pointerDown", {
          pointerType: e.pointerType,
          target: e.target,
          isPrimary: e.isPrimary,
        });
      };

      // Set up multiple capturing and non-capturing event handlers
      // This helps identify where events might be getting lost
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousedown", handleMouseDown, {
        capture: true,
      });
      document.addEventListener("click", handleClick);
      document.addEventListener("click", handleClick, { capture: true });
      document.addEventListener("pointerdown", handlePointerDown);
      document.addEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });

      // Fix for Windows: Prevent default on contextmenu which can interfere with mouse events
      const handleContextMenu = (e: MouseEvent) => {
        logDebug("Context menu", { target: e.target });
      };
      document.addEventListener("contextmenu", handleContextMenu);

      // Debug any element that receives focus
      const handleFocus = (e: FocusEvent) => {
        logDebug("Focus changed", {
          target: e.target,
          tagName: (e.target as HTMLElement)?.tagName,
        });
      };
      document.addEventListener("focusin", handleFocus);

      return () => {
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousedown", handleMouseDown, {
          capture: true,
        });
        document.removeEventListener("click", handleClick);
        document.removeEventListener("click", handleClick, { capture: true });
        document.removeEventListener("pointerdown", handlePointerDown);
        document.removeEventListener("pointerdown", handlePointerDown, {
          capture: true,
        });
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("focusin", handleFocus);
      };
    }
  }, [isMobile, logDebug]);

  // NEW APPROACH: Try to directly handle events on shell container
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || isMobile) return;

    logDebug("Setting up direct shell event handlers");

    // Create event listener on shell div directly
    const handleShellEvents = (e: MouseEvent) => {
      const eventType = e.type;
      const target = e.target as HTMLElement;
      const isWindowElement = !!target.closest("[data-windowid]");

      logDebug(`Direct shell ${eventType}`, {
        target,
        isWindowElement,
        targetClass: target.className,
        targetId: target.id || "none",
      });

      // Do not stop propagation on window elements
      if (!isWindowElement) {
        // For clicks directly on the desktop background, we can handle them here
        logDebug(`Click on desktop background detected`);
      }
    };

    shell.addEventListener("click", handleShellEvents);
    shell.addEventListener("mousedown", handleShellEvents);

    return () => {
      shell.removeEventListener("click", handleShellEvents);
      shell.removeEventListener("mousedown", handleShellEvents);
    };
  }, [isMobile, logDebug]);

  return (
    <div
      ref={shellRef}
      id="main-shell"
      className="w-full h-screen overflow-hidden relative"
      style={{
        touchAction: isMobile ? "auto" : "manipulation", // Changed from 'none' to 'manipulation'
        // Add a high z-index to ensure it's above everything else
        zIndex: 1,
        // Use position relative to create a new stacking context
        position: "relative",
      }}
      data-mode={isMobile ? "mobile" : "desktop"}
    >
      {isMobile ? <MobileShell /> : <DesktopShell />}
    </div>
  );
};

const Shell: React.FC = () => {
  // Print a startup debug message
  useEffect(() => {
    if (DEBUG) {
      console.log("[SHELL DEBUG] Shell provider mounted");
      console.log("[SHELL DEBUG] User agent:", navigator.userAgent);
      console.log("[SHELL DEBUG] Window size:", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  return (
    <ShellProvider>
      <ShellContent />
    </ShellProvider>
  );
};

export default Shell;

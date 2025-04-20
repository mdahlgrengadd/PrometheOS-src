import { useEffect, useState } from "react";

// Define mobile breakpoint
export const MOBILE_BREAKPOINT = 768;

// Custom event for view mode changes
export const VIEW_MODE_CHANGE_EVENT = "viewmode:change";

// Interface for legacy Navigator properties
interface NavigatorWithMSMaxTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

/**
 * Hook for handling view mode detection and switching
 *
 * Centralizes logic for determining whether to use mobile or desktop view
 * and provides functions for enforcing specific view modes
 */
export function useViewMode() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [isEnforced, setIsEnforced] = useState(false);
  const [enforcedMode, setEnforcedMode] = useState<
    "desktop" | "smartphone" | null
  >(null);

  // Detect if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      // Check if view mode is enforced
      const enforceViewMode =
        localStorage.getItem("enforce-view-mode") === "true";
      const storedEnforcedMode = localStorage.getItem("enforced-mode") as
        | "desktop"
        | "smartphone"
        | null;

      setIsEnforced(enforceViewMode);
      setEnforcedMode(storedEnforcedMode);

      // If view mode is enforced, respect the setting
      if (enforceViewMode && storedEnforcedMode) {
        setIsMobile(storedEnforcedMode === "smartphone");
        return;
      }

      // Normal detection based on screen size and touch capability
      // Check screen width
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;

      // Additional check for touch support (most mobile devices)
      const hasTouchSupport =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as NavigatorWithMSMaxTouchPoints).msMaxTouchPoints > 0;

      // On Windows, favor the width detection more than touch capability
      const isWindowsPlatform = navigator.userAgent.includes("Windows");

      if (isWindowsPlatform) {
        // For Windows: primarily rely on screen width
        setIsMobile(isMobileWidth);
      } else {
        // For other platforms: consider both width and touch support
        setIsMobile(
          isMobileWidth || (hasTouchSupport && window.innerWidth < 1024)
        );
      }
    };

    // Check initially
    checkMobile();

    // Set up listeners for resize
    window.addEventListener("resize", checkMobile);

    // Also listen for orientation change for better mobile detection
    window.addEventListener("orientationchange", checkMobile);

    // Listen for storage changes to update mode if enforced setting changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "enforce-view-mode" || e.key === "enforced-mode") {
        checkMobile();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Listen for custom view mode change event for instant updates
    const handleViewModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { enforceViewMode, enforcedMode } = customEvent.detail;

      setIsEnforced(enforceViewMode);
      setEnforcedMode(enforcedMode);

      if (enforceViewMode) {
        setIsMobile(enforcedMode === "smartphone");
      } else {
        // Fall back to normal detection when enforcement is turned off
        checkMobile();
      }
    };

    document.addEventListener(VIEW_MODE_CHANGE_EVENT, handleViewModeChange);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener(
        VIEW_MODE_CHANGE_EVENT,
        handleViewModeChange
      );
    };
  }, []);

  // Functions to enforce specific view modes
  const enforceDesktopMode = () => {
    localStorage.setItem("enforce-view-mode", "true");
    localStorage.setItem("enforced-mode", "desktop");
    setIsEnforced(true);
    setEnforcedMode("desktop");
    setIsMobile(false);

    // Dispatch custom event for instant updates across components
    const event = new CustomEvent(VIEW_MODE_CHANGE_EVENT, {
      detail: {
        enforceViewMode: true,
        enforcedMode: "desktop",
      },
    });
    document.dispatchEvent(event);
  };

  const enforceSmartphoneMode = () => {
    localStorage.setItem("enforce-view-mode", "true");
    localStorage.setItem("enforced-mode", "smartphone");
    setIsEnforced(true);
    setEnforcedMode("smartphone");
    setIsMobile(true);

    // Dispatch custom event for instant updates across components
    const event = new CustomEvent(VIEW_MODE_CHANGE_EVENT, {
      detail: {
        enforceViewMode: true,
        enforcedMode: "smartphone",
      },
    });
    document.dispatchEvent(event);
  };

  const disableEnforcedMode = () => {
    localStorage.setItem("enforce-view-mode", "false");
    setIsEnforced(false);

    // Dispatch custom event for instant updates across components
    const event = new CustomEvent(VIEW_MODE_CHANGE_EVENT, {
      detail: {
        enforceViewMode: false,
        enforcedMode: null,
      },
    });
    document.dispatchEvent(event);

    // Fall back to auto-detection based on screen size
    const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(isMobileWidth);
  };

  return {
    isMobile,
    isEnforced,
    enforcedMode,
    enforceDesktopMode,
    enforceSmartphoneMode,
    disableEnforcedMode,
  };
}

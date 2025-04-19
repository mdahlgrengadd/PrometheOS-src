import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

// Add type definition for legacy msMaxTouchPoints property
interface NavigatorWithMSMaxTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;

      // Additional check for touch support (most mobile devices)
      const hasTouchSupport =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as NavigatorWithMSMaxTouchPoints).msMaxTouchPoints > 0;

      // On Windows, favor the width detection more than touch capability
      // because many Windows devices have touch but shouldn't use mobile UI
      // when in desktop mode
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

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return !!isMobile;
}

import { useEffect, useState } from "react";

/**
 * Hook to determine if Windows-specific animations are disabled
 * This checks the CSS variable set in the document root
 */
export function useWindowsAnimations() {
  const [windowsAnimationsDisabled, setWindowsAnimationsDisabled] = useState(
    () => {
      // Check if we're running in the browser
      if (typeof document !== "undefined") {
        const value = document.documentElement.style.getPropertyValue(
          "--disable-windows-animations"
        );
        return value === "true";
      }
      return false;
    }
  );

  useEffect(() => {
    // Function to check the current animation setting
    const checkAnimationSetting = () => {
      const value = document.documentElement.style.getPropertyValue(
        "--disable-windows-animations"
      );
      setWindowsAnimationsDisabled(value === "true");
    };

    // Set up a MutationObserver to watch for changes to the style attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          checkAnimationSetting();
        }
      });
    });

    // Start observing the document root for style attribute changes
    observer.observe(document.documentElement, { attributes: true });

    // Initial check
    checkAnimationSetting();

    // Clean up
    return () => observer.disconnect();
  }, []);

  return { windowsAnimationsDisabled };
}

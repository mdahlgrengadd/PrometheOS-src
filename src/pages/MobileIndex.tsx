import { useEffect, useState } from "react";

import { ApiProvider } from "@/api/context/ApiContext";
import MobileShell from "@/components/mobile/MobileShell";
import { MacroProvider } from "@/macros/context/MacroContext";
import { PluginProvider } from "@/plugins/PluginContext";

// Define interfaces for document and element with fullscreen API
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

// Define interface for legacy Navigator properties
interface NavigatorWithMSMaxTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

// Function to detect if the device is actually a mobile device (not just small screen)
const isActualMobileDevice = (): boolean => {
  // Check for touch support
  const hasTouchSupport =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as NavigatorWithMSMaxTouchPoints).msMaxTouchPoints > 0;

  // Check for mobile user agent
  const mobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Return true only if both conditions are met
  return hasTouchSupport && mobileUserAgent;
};

const MobileContent = () => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Request fullscreen on mobile devices when supported
  useEffect(() => {
    // Only request fullscreen on actual mobile devices
    if (!isActualMobileDevice()) {
      console.log("Fullscreen request skipped - not a mobile device");
      return;
    }

    const requestFullscreen = async () => {
      try {
        const docEl = document.documentElement as FullscreenElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          // Safari and older WebKit browsers
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          // Firefox
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          // IE/Edge
          await docEl.msRequestFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen request failed:", error);
      }
    };

    // Delay fullscreen request slightly to ensure it works after user interaction
    setTimeout(() => {
      requestFullscreen();
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <MobileShell activeApp={activeApp} setActiveApp={setActiveApp} />
    </div>
  );
};

const MobileIndex = () => {
  return (
    <ApiProvider>
      <MacroProvider>
        <PluginProvider>
          <MobileContent />
        </PluginProvider>
      </MacroProvider>
    </ApiProvider>
  );
};

export default MobileIndex;

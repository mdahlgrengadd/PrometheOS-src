import { useEffect } from "react";

import { usePlugins } from "@/plugins/PluginContext";
import { getOpenAppsFromUrl } from "@/utils/url";

interface MobileAppOpenerProps {
  setActiveApp: (appId: string | null) => void;
}

/**
 * Component that opens the first app from URL parameters in mobile view
 */
const MobileAppOpener = ({ setActiveApp }: MobileAppOpenerProps) => {
  const { pluginManager, openWindow } = usePlugins();

  useEffect(() => {
    // Get apps to open from URL query params
    const appsToOpen = getOpenAppsFromUrl();

    console.log("Mobile: Apps to open from URL:", appsToOpen);

    if (appsToOpen.length > 0) {
      const firstAppId = appsToOpen[0];
      console.log("Mobile: Attempting to open app:", firstAppId);

      // Try to open the app after a short delay to ensure plugins are loaded
      const timer = setTimeout(() => {
        try {
          // First try to open the window (loads the plugin if needed)
          openWindow(firstAppId);

          // Then set it as the active app in mobile view
          setActiveApp(firstAppId);
          console.log(`Mobile: Successfully opened ${firstAppId}`);
        } catch (err) {
          console.warn(`Mobile: Failed to open ${firstAppId}:`, err);
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [setActiveApp, pluginManager, openWindow]);

  // Also add URL change listener
  useEffect(() => {
    const handleUrlChange = () => {
      const newAppsToOpen = getOpenAppsFromUrl();
      if (newAppsToOpen.length > 0) {
        const appId = newAppsToOpen[0];
        openWindow(appId);
        setActiveApp(appId);
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [setActiveApp, openWindow]);

  return null;
};

export default MobileAppOpener;

import { useEffect } from "react";

import { usePlugins } from "@/plugins/PluginContext";
import { getAppsToLaunchFromUrl } from "@/utils/url";

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
    const appsToLaunch = getAppsToLaunchFromUrl();

    console.log("Mobile: Apps to launch from URL:", appsToLaunch);

    if (appsToLaunch.length > 0) {
      const firstApp = appsToLaunch[0];
      console.log("Mobile: Attempting to open app:", firstApp.appId);

      // Try to open the app after a short delay to ensure plugins are loaded
      const timer = setTimeout(() => {
        try {
          // First try to open the window (loads the plugin if needed)
          openWindow(firstApp.appId, firstApp.initFromUrl);
          // Then set it as the active app in mobile view
          setActiveApp(firstApp.appId);
          console.log(`Mobile: Successfully opened ${firstApp.appId}`);
        } catch (err) {
          console.warn(`Mobile: Failed to open ${firstApp.appId}:`, err);
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [setActiveApp, pluginManager, openWindow]);

  // Also add URL change listener
  useEffect(() => {
    const handleUrlChange = () => {
      const appsToLaunch = getAppsToLaunchFromUrl();
      if (appsToLaunch.length > 0) {
        const firstApp = appsToLaunch[0];
        openWindow(firstApp.appId, firstApp.initFromUrl);
        setActiveApp(firstApp.appId);
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [setActiveApp, openWindow]);

  return null;
};

export default MobileAppOpener;

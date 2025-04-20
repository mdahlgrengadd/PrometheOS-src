import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usePlugins } from "@/plugins/PluginContext";

const AppLauncher = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { openWindow, pluginManager } = usePlugins();

  useEffect(() => {
    if (appId) {
      // Check if the plugin exists
      const plugin = pluginManager.getPlugin(appId);

      if (plugin) {
        // Redirect to home page
        navigate("/", { replace: true });

        // Schedule the app to open after navigation is complete
        setTimeout(() => {
          openWindow(appId);
        }, 100);
      } else {
        // If plugin doesn't exist, redirect to 404
        navigate("/404", { replace: true });
      }
    }
  }, [appId, navigate, openWindow, pluginManager]);

  // This component doesn't render anything by itself
  return null;
};

export default AppLauncher;

import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useViewMode } from "@/hooks/useViewMode";
import { usePlugins } from "@/plugins/PluginContext";

const AppLauncher = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { openWindow, pluginManager } = usePlugins();
  const { isMobile } = useViewMode();

  useEffect(() => {
    if (appId) {
      // Check if the plugin exists
      const plugin = pluginManager.getPlugin(appId);

      if (plugin) {
        // Redirect to home page with query parameters
        // This works for both mobile and desktop views
        const redirectURL = `/?open=${appId}`;
        navigate(redirectURL, { replace: true });
      } else {
        // If plugin doesn't exist, redirect to 404
        navigate("/404", { replace: true });
      }
    }
  }, [appId, navigate, pluginManager, isMobile]);

  // This component doesn't render anything by itself
  return null;
};

export default AppLauncher;

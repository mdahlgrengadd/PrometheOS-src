import { useEffect } from "react";

import { ApiProvider } from "@/api/context/ApiContext";
import Desktop from "@/components/Desktop";
import { MacroProvider } from "@/macros/context/MacroContext";
import { PluginProvider, usePlugins } from "@/plugins/PluginContext";
import { getOpenAppsFromUrl } from "@/utils/url";

// Component that handles opening apps from URL parameters
const AppOpener = () => {
  const { openWindow } = usePlugins();

  useEffect(() => {
    // Get apps to open from URL query params
    const appsToOpen = getOpenAppsFromUrl();

    // Open each app with a slight delay between them
    appsToOpen.forEach((appId, index) => {
      setTimeout(() => {
        openWindow(appId);
      }, 100 * index); // Stagger opening by 100ms to avoid overwhelming
    });

    // Empty dependency array ensures this only runs once on component mount
    // This prevents reopening apps when URL changes after initial load
  }, []); // <-- Remove openWindow dependency

  return null;
};

const Index = () => {
  return (
    <ApiProvider>
      <MacroProvider>
        <PluginProvider>
          <AppOpener />
          <Desktop />
        </PluginProvider>
      </MacroProvider>
    </ApiProvider>
  );
};

export default Index;

import { useEffect, useState } from "react";

import { usePlugins } from "@/plugins/PluginContext";

import MobileAppScreen from "./MobileAppScreen";
import MobileDockBar from "./MobileDockBar";
import MobileHomeScreen from "./MobileHomeScreen";

interface MobileShellProps {
  activeApp: string | null;
  setActiveApp: (appId: string | null) => void;
}

const MobileShell: React.FC<MobileShellProps> = ({
  activeApp,
  setActiveApp,
}) => {
  const { loadedPlugins } = usePlugins();
  const [currentHomeScreen, setCurrentHomeScreen] = useState(0);

  // Set up mobile viewport meta tag
  useEffect(() => {
    // Add viewport meta tag for mobile optimization
    const metaTag = document.createElement("meta");
    metaTag.name = "viewport";
    metaTag.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
    document.head.appendChild(metaTag);

    // Also set up correct height for mobile browsers (fixes iOS Safari 100vh issue)
    const setAppHeight = () => {
      const doc = document.documentElement;
      doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    };

    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);

    // Initial call
    setAppHeight();

    return () => {
      // Clean up
      document.head.removeChild(metaTag);
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, []);

  // Organize plugins into pages
  const pluginsPerPage = 8;
  const pluginPages = [];

  for (let i = 0; i < loadedPlugins.length; i += pluginsPerPage) {
    pluginPages.push(loadedPlugins.slice(i, i + pluginsPerPage));
  }

  const openApp = (appId: string) => {
    setActiveApp(appId);
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600"
      style={{ height: "var(--app-height, 100vh)" }}
    >
      {/* Home screen (visible when no app is active) */}
      {!activeApp && (
        <MobileHomeScreen
          plugins={loadedPlugins}
          pluginPages={pluginPages}
          currentHomeScreen={currentHomeScreen}
          setCurrentHomeScreen={setCurrentHomeScreen}
          openApp={openApp}
        />
      )}

      {/* App screen (visible when an app is active) */}
      {activeApp && (
        <MobileAppScreen
          plugin={loadedPlugins.find((p) => p.id === activeApp)}
          closeApp={closeApp}
        />
      )}

      {/* Bottom dock bar (only visible when no app is active) */}
      <div
        style={{
          opacity: activeApp ? 0 : 1,
          visibility: activeApp ? "hidden" : "visible",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
          zIndex: activeApp ? 10 : 50,
        }}
      >
        <MobileDockBar
          plugins={loadedPlugins.slice(0, 4)}
          activeApp={activeApp}
          openApp={openApp}
        />
      </div>
    </div>
  );
};

export default MobileShell;

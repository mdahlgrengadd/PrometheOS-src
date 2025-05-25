import { useEffect, useMemo, useState } from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { usePlugins } from "@/plugins/PluginContext";
import { useWindowStore } from "@/store/windowStore";

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
  const { loadedPlugins, pluginManager, openWindow } = usePlugins();
  const { wallpaper, backgroundColor } = useTheme();
  const [currentHomeScreen, setCurrentHomeScreen] = useState(0);

  // Use the same data source as the desktop
  const windowsDict = useWindowStore((s) => s.windows);

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

  // FIXED: Get all plugins from multiple sources to ensure we have data
  const allPlugins = useMemo(() => {
    // First try getting from plugin manager
    const registeredPlugins = pluginManager.getAllPlugins() || [];

    // Also check loaded plugins
    const loadedPluginsArray = Array.isArray(loadedPlugins)
      ? loadedPlugins
      : Object.values(loadedPlugins || {});

    // Get manifests from the window store for desktop icons
    const windowPlugins = Object.values(windowsDict || {}).map((w) => ({
      id: w.id,
      manifest: {
        name: w.title,
        icon: w.icon,
        iconUrl: typeof w.icon === "string" ? w.icon : undefined,
      },
    }));

    // Combine and deduplicate all sources
    const allSources = [
      ...registeredPlugins,
      ...loadedPluginsArray,
      ...windowPlugins,
    ];
    const uniquePlugins = new Map();

    allSources.forEach((plugin) => {
      if (plugin && plugin.id) {
        // If we already have this plugin, only update if the new one has more data
        const existing = uniquePlugins.get(plugin.id);
        if (!existing || (!existing.manifest && plugin.manifest)) {
          uniquePlugins.set(plugin.id, plugin);
        }
      }
    });

    // Convert back to array
    return Array.from(uniquePlugins.values());
  }, [pluginManager, loadedPlugins, windowsDict]);

  console.log(
    "Available plugins (combined sources):",
    allPlugins.length,
    allPlugins.map(
      (p) => p.id + (p.manifest ? " (has manifest)" : " (no manifest)")
    )
  );

  // Organize plugins into pages
  const pluginsPerPage = 8;
  const pluginPages = useMemo(() => {
    const pages = [];
    for (let i = 0; i < allPlugins.length; i += pluginsPerPage) {
      pages.push(allPlugins.slice(i, i + pluginsPerPage));
    }
    // Always have at least one page, even if empty
    return pages.length > 0 ? pages : [[]];
  }, [allPlugins]);

  const openApp = (appId: string) => {
    console.log("Opening app:", appId);
    openWindow(appId);
    setActiveApp(appId);
  };

  const closeApp = () => {
    setActiveApp(null);
  };

  // Set the background style based on theme settings
  const backgroundStyle = wallpaper
    ? {
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { backgroundColor };

  return (
    <div
      className="relative w-full h-screen overflow-auto"
      style={{
        height: "var(--app-height, 100vh)",
        ...backgroundStyle,
      }}
    >
      {/* Home screen (visible when no app is active) */}
      {!activeApp && (
        <MobileHomeScreen
          plugins={allPlugins}
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
          plugins={allPlugins.slice(0, 4)}
          activeApp={activeApp}
          openApp={openApp}
        />
      </div>
    </div>
  );
};

export default MobileShell;

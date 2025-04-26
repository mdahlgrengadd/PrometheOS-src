import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import { themes } from "./theme-definitions";
import {
  getAvailableExternalThemes,
  installTheme as installThemeFromUrl,
  loadExternalTheme,
  uninstallTheme as uninstallThemeById,
} from "./theme-loader";
import {
  ThemeConfig,
  ThemeContextType,
  ThemeInstallResult,
  ThemeType,
} from "./theme-types";

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  themes,
  setPadding: () => {},
  padding: 0, // Default padding
  wallpaper: null,
  setWallpaper: () => {},
  backgroundColor: "#6366f1", // Default background color (indigo)
  setBackgroundColor: () => {},
  primaryColor: "#a855f7", // Default primary color (purple)
  setPrimaryColor: () => {},
  loadTheme: async () => false,
  availableExternalThemes: [],
  installTheme: async () => ({ success: false }),
  uninstallTheme: async () => false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Track all themes, including dynamically loaded ones
  const [allThemes, setAllThemes] =
    useState<Record<string, ThemeConfig>>(themes);

  // External themes that can be loaded
  const [availableExternalThemes, setAvailableExternalThemes] = useState<
    string[]
  >([]);

  // Try to get stored theme from localStorage or use 'light' as default
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem("os-theme");
    return (savedTheme as ThemeType) || "light";
  });

  // Get stored padding from localStorage or use 0px as default
  const [padding, setPaddingState] = useState<number>(() => {
    const savedPadding = localStorage.getItem("window-content-padding");
    return savedPadding ? parseInt(savedPadding, 10) : 0;
  });

  // Get stored wallpaper from localStorage
  const [wallpaper, setWallpaperState] = useState<string | null>(() => {
    return localStorage.getItem("os-wallpaper");
  });

  // Get stored background color from localStorage or use default
  const [backgroundColor, setBackgroundColorState] = useState<string | null>(
    () => {
      return localStorage.getItem("os-background-color") || null;
    }
  );

  // Get stored primary color from localStorage or use default
  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem("os-primary-color") || "#a855f7";
  });

  // State for CSS loading indicator
  const [loading, setLoading] = useState<boolean>(false);

  // Compute a superset of all variable names used across themes
  const allCssVariableNames = useMemo(() => {
    // Get all CSS variable names from built-in themes
    const variableNames = new Set<string>();

    // Collect from built-in themes
    Object.values(themes).forEach((themeConfig) => {
      Object.keys(themeConfig.cssVariables).forEach((key) => {
        variableNames.add(key);
      });
    });

    // Also collect from dynamically loaded themes
    Object.values(allThemes).forEach((themeConfig) => {
      if (!themes[themeConfig.id as ThemeType]) {
        // Only process external themes not in the built-in set
        Object.keys(themeConfig.cssVariables).forEach((key) => {
          variableNames.add(key);
        });
      }
    });

    return Array.from(variableNames);
  }, [allThemes]);

  // Load available external themes
  useEffect(() => {
    const loadAvailableThemes = () => {
      const externalThemes = getAvailableExternalThemes();
      setAvailableExternalThemes(externalThemes.map((theme) => theme.id));
    };

    // Initial load
    loadAvailableThemes();

    // Set up a storage event listener to catch changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "installed-themes") {
        loadAvailableThemes();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("os-theme", newTheme);
  };

  const setPadding = (newPadding: number) => {
    setPaddingState(newPadding);
    localStorage.setItem("window-content-padding", newPadding.toString());
  };

  const setWallpaper = (newWallpaper: string | null) => {
    setWallpaperState(newWallpaper);
    if (newWallpaper) {
      localStorage.setItem("os-wallpaper", newWallpaper);
    } else {
      localStorage.removeItem("os-wallpaper");
    }
  };

  const setBackgroundColor = (newColor: string) => {
    setBackgroundColorState(newColor);
    localStorage.setItem("os-background-color", newColor);
  };

  const setPrimaryColor = (newColor: string) => {
    setPrimaryColorState(newColor);
    localStorage.setItem("os-primary-color", newColor);
  };

  // Load an external theme
  const loadTheme = async (themeId: string): Promise<boolean> => {
    // Store the current theme as a fallback
    const previousTheme = theme;

    // Windows-specific CSS injection
    if (["win98", "winxp", "win7"].includes(themeId)) {
      // Set loading state to true
      setLoading(true);

      document.getElementById("win-theme-css")?.remove();
      const link = document.createElement("link");
      link.id = "win-theme-css";
      link.rel = "stylesheet";
      link.href =
        themeId === "win98"
          ? "https://jdan.github.io/98.css/98.css"
          : themeId === "winxp"
          ? "https://botoxparty.github.io/XP.css/XP.css"
          : "https://unpkg.com/7.css@0.13.0/dist/7.css";

      // Add onload and onerror handlers
      link.onload = () => {
        setLoading(false);
        toast(
          `Windows ${
            themeId === "win7" ? "7" : themeId === "winxp" ? "XP" : "98"
          } theme loaded`,
          {
            description: "Theme changed successfully",
            position: "bottom-right",
          }
        );
        setTheme(themeId as ThemeType);
      };

      link.onerror = () => {
        setLoading(false);
        toast.error(`Failed to load Windows theme`, {
          description: "Please try again",
          position: "bottom-right",
        });
        setTheme(previousTheme);
      };

      document.head.appendChild(link);
      return true;
    }

    if (allThemes[themeId]) {
      setTheme(themeId as ThemeType);
      return true;
    }

    try {
      setLoading(true);
      const themeConfig = await loadExternalTheme(themeId);
      setLoading(false);

      if (themeConfig) {
        setAllThemes((prev) => ({
          ...prev,
          [themeId]: themeConfig,
        }));
        setTheme(themeId as ThemeType);
        return true;
      }

      // If theme loading failed, revert to previous theme
      console.error(
        `Failed to load theme: ${themeId}, reverting to ${previousTheme}`
      );
      setTheme(previousTheme);
      toast.error(`Failed to load theme: ${themeId}`);
      return false;
    } catch (error) {
      setLoading(false);
      console.error(`Error loading theme: ${themeId}`, error);
      // On error, revert to the previous theme
      setTheme(previousTheme);
      toast.error(`Error loading theme: ${themeId}`);
      return false;
    }
  };

  // Install a theme from a URL
  const installTheme = async (
    manifestUrl: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await installThemeFromUrl(manifestUrl);

      if (result.success) {
        // Refresh the list of available themes
        const externalThemes = getAvailableExternalThemes();
        setAvailableExternalThemes(externalThemes.map((theme) => theme.id));
        toast.success("Theme installed successfully");
        return { success: true };
      }

      toast.error(result.error || "Failed to install theme");
      return result;
    } catch (error) {
      console.error("Error installing theme:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Error installing theme: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  // Uninstall a theme by ID
  const uninstallTheme = async (themeId: string): Promise<boolean> => {
    try {
      // If the theme being uninstalled is the current theme, switch to light theme
      if (theme === themeId) {
        setTheme("light");
      }

      const success = await uninstallThemeById(themeId);

      if (success) {
        // Remove from loaded themes
        setAllThemes((prev) => {
          const newThemes = { ...prev };
          delete newThemes[themeId];
          return newThemes;
        });

        // Refresh available themes list
        const externalThemes = getAvailableExternalThemes();
        setAvailableExternalThemes(externalThemes.map((theme) => theme.id));

        toast.success("Theme uninstalled successfully");
        return true;
      }

      toast.error("Failed to uninstall theme");
      return false;
    } catch (error) {
      console.error("Error uninstalling theme:", error);
      toast.error(
        `Error uninstalling theme: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  // Add scrollbar fixes for Windows themes
  useEffect(() => {
    // Only apply scrollbar fixes for Windows themes
    if (!["win98", "winxp", "win7"].includes(theme)) {
      document.getElementById("scrollbar-fixes")?.remove();
      return;
    }

    const style = document.createElement("style");
    style.id = "scrollbar-fixes";

    // Compute horizontal gutter based on theme
    const gutterMap = {
      win7: "8px",
      winxp: "4px",
      win98: "1px",
    };
    const gutter = gutterMap[theme as "win7" | "winxp" | "win98"];

    // Preserve bottom margin in win7, otherwise remove it
    const bottomMarginCss =
      theme === "win7" ? "" : "margin-bottom: 0 !important;";

    style.textContent = `
      /* — existing scrollbar‐button & track fixes — */
      .has-scrollbar::-webkit-scrollbar-button:vertical:start:increment,
      .has-scrollbar::-webkit-scrollbar-button:vertical:end:decrement {
        display: none !important;
      }
      .has-scrollbar::-webkit-scrollbar-button:vertical:start:decrement,
      .has-scrollbar::-webkit-scrollbar-button:vertical:end:increment {
        width: 16px !important;
        height: 16px !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
      .has-scrollbar::-webkit-scrollbar {
        width: 16px !important;
        height: 16px !important;
      }
      .has-scrollbar::-webkit-scrollbar-corner {
        background-color: transparent !important;
      }
      .has-scrollbar::-webkit-scrollbar-track {
        margin: 0 !important;
        background-clip: padding-box !important;
      }

      /* — adjust content‐window margins (no top gap, gutter on sides, keep bottom for win7) — */
      .window-body.has-scrollbar {
        margin-top: 0 !important;
        margin-left: ${gutter} !important;
        margin-right: ${gutter} !important;
        ${bottomMarginCss}
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    `;

    document.head.appendChild(style);
    return () => void style.remove();
  }, [theme]);

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // ⇒ RESET EVERYTHING from any prior theme
    // Remove the entire style attribute so no old CSS-vars or inline rules remain
    root.removeAttribute("style");

    // Remove external Windows theme CSS if not using a Windows theme
    if (!["win98", "winxp", "win7"].includes(theme)) {
      document.getElementById("win-theme-css")?.remove();
    }

    const themeConfig = allThemes[theme];

    if (!themeConfig) {
      console.error(`Theme '${theme}' not found`);
      return;
    }

    // Now set all CSS variables from the theme on a clean slate
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set our component-specific variables
    root.style.setProperty("--window-content-padding", `${padding}px`);
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--accent-primary", primaryColor);

    // Set window control button colors
    root.style.setProperty("--wm-btn-close-bg", "#e74c3c");
    root.style.setProperty("--wm-btn-minimize-bg", "#f1c40f");
    root.style.setProperty("--wm-btn-maximize-bg", "#2ecc71");

    // Handle background via CSS variables instead of direct style manipulation
    if (wallpaper) {
      // Custom wallpaper takes priority - set as background image
      root.style.setProperty("--app-bg-image", `url(${wallpaper})`);
      root.style.setProperty("--app-bg-size", "cover");
      root.style.setProperty("--app-bg-position", "center center");
      root.style.setProperty("--app-bg-repeat", "no-repeat");
      root.style.setProperty("--app-bg-attachment", "fixed");
    } else if (wallpaper === null && backgroundColor) {
      // User-selected background color - override --app-bg
      root.style.setProperty("--app-bg", backgroundColor);
      // Clear any background image variables
      root.style.removeProperty("--app-bg-image");
      root.style.removeProperty("--app-bg-size");
      root.style.removeProperty("--app-bg-position");
      root.style.removeProperty("--app-bg-repeat");
      root.style.removeProperty("--app-bg-attachment");
    } else {
      // Default to theme's --app-bg CSS variable
      // Make sure no background image is set
      root.style.removeProperty("--app-bg-image");
      root.style.removeProperty("--app-bg-size");
      root.style.removeProperty("--app-bg-position");
      root.style.removeProperty("--app-bg-repeat");
      root.style.removeProperty("--app-bg-attachment");
      // Note: --app-bg is already set from theme.cssVariables above
    }

    // Remove all theme classes
    root.classList.remove(
      "theme-beos",
      "theme-light",
      "theme-dark",
      "theme-macos",
      "theme-windows",
      "theme-fluxbox"
    );

    // Add the active theme class
    root.classList.add(`theme-${theme}`);

    // If dark theme, add the 'dark' class for Tailwind's dark mode
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [
    theme,
    allThemes,
    padding,
    wallpaper,
    backgroundColor,
    primaryColor,
    allCssVariableNames,
  ]);

  // Determine what to render based on loading state and theme
  const renderContent = () => {
    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg p-6 bg-white rounded shadow-lg space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      );
    }

    // Add specific wrapping for Windows themes
    if (theme === "win7") {
      return <div className="win7">{children}</div>;
    } else if (theme === "win98" || theme === "winxp") {
      return <>{children}</>;
    } else {
      return <>{children}</>;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: allThemes,
        padding,
        setPadding,
        wallpaper,
        setWallpaper,
        backgroundColor,
        setBackgroundColor,
        primaryColor,
        setPrimaryColor,
        loadTheme,
        availableExternalThemes,
        installTheme,
        uninstallTheme,
      }}
    >
      {renderContent()}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';

import { themes } from './theme-definitions';
import {
    getAvailableExternalThemes, installTheme as installThemeFromUrl, loadExternalTheme,
    uninstallTheme as uninstallThemeById
} from './theme-loader';
import { ThemeConfig, ThemeContextType, ThemeInstallResult, ThemeType } from './theme-types';

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
  const loadTheme = useCallback(
    async (themeId: string): Promise<boolean> => {
      // Store current theme as a fallback
      const previousTheme = theme;

      // Run cleanup for the previous theme if it has a cleanup function
      const prevThemeConfig = allThemes[previousTheme];
      if (prevThemeConfig?.decoratorModule) {
        try {
          // @ts-expect-error - We know this might not exist on all themes
          if (typeof prevThemeConfig.decoratorModule.cleanup === "function") {
            // @ts-expect-error - Calling cleanup method from dynamically loaded module
            prevThemeConfig.decoratorModule.cleanup();
          }
        } catch (error) {
          console.error(
            `Error cleaning up previous theme: ${previousTheme}`,
            error
          );
        }
      }

      // Get theme config (built-in or load external)
      const themeConfig = allThemes[themeId];

      if (themeConfig) {
        // Theme exists in built-in themes or already loaded
        if (themeConfig.preload) {
          // Theme has a preload hook, call it
          setLoading(true);
          try {
            const success = await themeConfig.preload(previousTheme);
            setLoading(false);

            if (!success) {
              // If preload failed, revert to previous theme and show error
              console.error(
                `Failed to load theme: ${themeId}, preload hook failed`
              );
              toast.error(`Failed to load theme: ${themeId}`);
              return false;
            }
          } catch (error) {
            setLoading(false);
            console.error(`Error in theme preload hook: ${themeId}`, error);
            toast.error(`Error loading theme: ${themeId}`);
            return false;
          }
        }

        // Set the theme
        setTheme(themeId as ThemeType);

        // Run postload hook if it exists
        if (themeConfig.postload) {
          try {
            themeConfig.postload();
          } catch (error) {
            console.error(`Error in theme postload hook: ${themeId}`, error);
          }
        }

        return true;
      }

      // Theme not loaded yet, try to load it as an external theme
      try {
        setLoading(true);
        const loadedThemeConfig = await loadExternalTheme(themeId);
        setLoading(false);

        if (loadedThemeConfig) {
          // Add loaded theme to available themes
          setAllThemes((prev) => ({
            ...prev,
            [themeId]: loadedThemeConfig,
          }));

          // Run preload hook if it exists
          if (loadedThemeConfig.preload) {
            try {
              const success = await loadedThemeConfig.preload(previousTheme);
              if (!success) {
                console.error(
                  `Failed to load theme: ${themeId}, preload hook failed`
                );
                toast.error(`Failed to load theme: ${themeId}`);
                setTheme(previousTheme);
                return false;
              }
            } catch (error) {
              console.error(`Error in theme preload hook: ${themeId}`, error);
              toast.error(`Error loading theme: ${themeId}`);
              setTheme(previousTheme);
              return false;
            }
          }

          // Set the theme
          setTheme(themeId as ThemeType);

          // Run postload hook if it exists
          if (loadedThemeConfig.postload) {
            try {
              loadedThemeConfig.postload();
            } catch (error) {
              console.error(`Error in theme postload hook: ${themeId}`, error);
            }
          }

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
    },
    [theme, setTheme, setLoading, allThemes, setAllThemes]
  );

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

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;

    // ⇒ RESET EVERYTHING from any prior theme
    root.removeAttribute("style");

    // Apply CSS variables for themes
    const themeConfig = allThemes[theme];
    if (themeConfig) {
      // Now set all CSS variables from the theme on a clean slate
      Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    } else {
      console.error(`Theme '${theme}' not found`);
    }

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
      "theme-fluxbox",
      "theme-win98",
      "theme-winxp",
      "theme-win7"
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

  // Determine what to render based on theme, and overlay loading indicator when loading
  const renderContent = () => {
    return children;
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

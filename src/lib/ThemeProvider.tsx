import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { themes } from './theme-definitions';
import { getAvailableExternalThemes, loadExternalTheme } from './theme-loader';
import { ThemeConfig, ThemeContextType, ThemeType } from './theme-types';

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
  const [backgroundColor, setBackgroundColorState] = useState<string>(() => {
    return localStorage.getItem("os-background-color") || "#6366f1";
  });

  // Get stored primary color from localStorage or use default
  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    return localStorage.getItem("os-primary-color") || "#a855f7";
  });

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
    const externalThemes = getAvailableExternalThemes();
    setAvailableExternalThemes(externalThemes.map((theme) => theme.id));
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

    if (allThemes[themeId]) {
      setTheme(themeId as ThemeType);
      return true;
    }

    try {
      const themeConfig = await loadExternalTheme(themeId);
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
      console.error(`Error loading theme: ${themeId}`, error);
      // On error, revert to the previous theme
      setTheme(previousTheme);
      toast.error(`Error loading theme: ${themeId}`);
      return false;
    }
  };

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = allThemes[theme];

    if (!themeConfig) {
      console.error(`Theme '${theme}' not found`);
      return;
    }

    // 1. Clear all existing CSS variables first to avoid stale values
    allCssVariableNames.forEach((key) => {
      root.style.removeProperty(key);
    });

    // 2. Set all CSS variables from the theme
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

    // Set background based on wallpaper or color
    if (wallpaper) {
      document.body.style.background = `url(${wallpaper}) no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    } else if (wallpaper === null && backgroundColor) {
      document.body.style.background = backgroundColor;
    } else {
      document.body.style.background = themeConfig.desktopBackground;
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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

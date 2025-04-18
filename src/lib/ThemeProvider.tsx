import React, { createContext, useContext, useEffect, useState } from 'react';

import { themes } from './theme-definitions';
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
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = themes[theme];

    // Set all CSS variables from the theme
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Set window content padding
    root.style.setProperty("--window-content-padding", `${padding}px`);

    // Set body background based on wallpaper, solid color, or theme default
    if (wallpaper) {
      document.body.style.background = `url(${wallpaper}) no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    } else if (wallpaper === null && backgroundColor) {
      document.body.style.background = backgroundColor;
    } else {
      document.body.style.background = themeConfig.desktopBackground;
    }

    // Add theme class to root for other selectors
    root.classList.remove("theme-beos", "theme-light", "theme-dark");
    root.classList.add(`theme-${theme}`);

    // If dark theme, add the 'dark' class for Tailwind's dark mode
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, padding, wallpaper, backgroundColor]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes,
        padding,
        setPadding,
        wallpaper,
        setWallpaper,
        backgroundColor,
        setBackgroundColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

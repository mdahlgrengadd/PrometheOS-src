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

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("os-theme", newTheme);
  };

  const setPadding = (newPadding: number) => {
    setPaddingState(newPadding);
    localStorage.setItem("window-content-padding", newPadding.toString());
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

    // Set body background based on desktop background
    document.body.style.background = themeConfig.desktopBackground;

    // Add theme class to root for other selectors
    root.classList.remove("theme-beos", "theme-light", "theme-dark");
    root.classList.add(`theme-${theme}`);

    // If dark theme, add the 'dark' class for Tailwind's dark mode
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, padding]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, themes, padding, setPadding }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, ThemeContextType, ThemeType } from './theme-types';
import { themes } from './theme-definitions';

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  themes
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get stored theme from localStorage or use 'light' as default
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const savedTheme = localStorage.getItem('os-theme');
    return (savedTheme as ThemeType) || 'light';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('os-theme', newTheme);
  };

  // Apply theme CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = themes[theme];
    
    // Set all CSS variables from the theme
    Object.entries(themeConfig.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Set body background based on desktop background
    document.body.style.background = themeConfig.desktopBackground;
    
    // Add theme class to root for other selectors
    root.classList.remove('theme-beos', 'theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    
    // If dark theme, add the 'dark' class for Tailwind's dark mode
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
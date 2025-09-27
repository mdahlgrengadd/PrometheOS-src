// Simplified Theme Provider for Host (preserving essential theming)
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'beos',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('os-theme');
    return savedTheme || 'beos';
  });

  useEffect(() => {
    // Apply theme classes to document
    document.body.classList.remove('theme-beos', 'theme-light', 'theme-dark', 'theme-windows');
    document.body.classList.add(`theme-${theme}`);

    // Save theme preference
    localStorage.setItem('os-theme', theme);

    console.log(`[ThemeProvider] Applied theme: ${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
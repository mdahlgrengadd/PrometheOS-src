/**
 * @deprecated This provider is being deprecated in favor of the unified ThemeProvider in src/lib/ThemeProvider.tsx.
 * Please use the useTheme() hook from '@/lib/ThemeProvider' instead of useWindowsTheme().
 * The functionality from this provider has been migrated to the main ThemeProvider.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/ThemeProvider";

type WindowsTheme = "win98" | "winxp" | "win7";

const WindowsThemeContext = createContext<{
  theme: WindowsTheme;
  setTheme: (theme: WindowsTheme) => void;
}>({
  theme: "win7",
  setTheme: () => {},
});

export const useWindowsTheme = () => {
  console.warn(
    "useWindowsTheme() is deprecated. Please use useTheme() from '@/lib/ThemeProvider' instead."
  );
  return useContext(WindowsThemeContext);
};

interface WindowsThemeProviderProps {
  children: React.ReactNode;
  /**
   * when true hides the browser's native scrollbar arrows inside
   * any .has-scrollbar container so only the 98/XP/7.css arrows show.
   */
  hideNativeScrollbarButtons?: boolean;
}

export function WindowsThemeProvider({
  children,
  hideNativeScrollbarButtons = true,
}: WindowsThemeProviderProps) {
  // Get the theme from the unified ThemeProvider
  const {
    theme: globalTheme,
    setTheme: setGlobalTheme,
    loadTheme,
  } = useTheme();

  // Map the global theme to WindowsTheme if it's a Windows theme
  const windowsTheme: WindowsTheme = ["win98", "winxp", "win7"].includes(
    globalTheme
  )
    ? (globalTheme as WindowsTheme)
    : "win7";

  // Update the global theme when WindowsTheme changes
  const setWindowsTheme = (newTheme: WindowsTheme) => {
    setGlobalTheme(newTheme);
    loadTheme(newTheme);
  };

  useEffect(() => {
    console.warn(
      "WindowsThemeProvider is deprecated. The functionality has been migrated to ThemeProvider."
    );
  }, []);

  return (
    <WindowsThemeContext.Provider
      value={{ theme: windowsTheme, setTheme: setWindowsTheme }}
    >
      {children}
    </WindowsThemeContext.Provider>
  );
}

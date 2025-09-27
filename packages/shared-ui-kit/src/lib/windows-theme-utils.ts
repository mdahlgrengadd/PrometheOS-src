import { useTheme } from "@/lib/ThemeProvider";

/**
 * Custom hook to check if the current theme is a Windows theme
 */
export function useWindowsTheme() {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);
  
  return {
    isWindowsTheme,
    windowsTheme: isWindowsTheme ? theme : null
  };
}

/**
 * Helper function to get Windows-specific classNames
 */
export function getWindowsClasses(baseClass: string, theme: string | null, additionalClass?: string) {
  if (!theme || !["win98", "winxp", "win7"].includes(theme)) {
    return additionalClass || "";
  }
  
  return `${baseClass}-${theme} ${additionalClass || ""}`.trim();
}

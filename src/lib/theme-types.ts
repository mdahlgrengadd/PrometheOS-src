export type ThemeType =
  | "beos"
  | "light"
  | "dark"
  | "macos"
  | "windows"
  | "fluxbox"
  | "win98"
  | "winxp"
  | "win7"
  | string; // Allow for dynamic theme IDs

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  cssVariables: Record<string, string>;
  desktopBackground: string;
  paddingConfig?: {
    windowContent: number;
  };
  // Additional properties for external themes
  version?: string;
  author?: string;
  description?: string;
  preview?: string;
  decoratorModule?: unknown; // Loaded decorator module reference
  // New optional hooks
  preload?: (previousTheme: ThemeType) => Promise<boolean>;
  postload?: () => void;
}

export interface ExternalThemeManifest {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  cssUrl: string;
  preview: string;
  desktopBackground: string;
  decoratorPath: string;
  cssVariables: Record<string, string>;
  paddingConfig?: {
    windowContent: number;
  };
}

export interface ThemeInstallResult {
  success: boolean;
  error?: string;
}

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: Record<string, ThemeConfig>;
  setPadding: (padding: number) => void;
  padding: number;
  wallpaper: string | null;
  setWallpaper: (wallpaper: string | null) => void;
  backgroundColor: string | null;
  setBackgroundColor: (color: string) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  loadTheme: (themeId: string) => Promise<boolean>;
  availableExternalThemes: string[];
  installTheme: (manifestUrl: string) => Promise<ThemeInstallResult>;
  uninstallTheme: (themeId: string) => Promise<boolean>;
}

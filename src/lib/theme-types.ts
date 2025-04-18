export type ThemeType = "beos" | "light" | "dark";

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  cssVariables: Record<string, string>;
  desktopBackground: string;
  paddingConfig?: {
    windowContent: number;
  };
}

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: Record<ThemeType, ThemeConfig>;
  setPadding: (padding: number) => void;
  padding: number;
}

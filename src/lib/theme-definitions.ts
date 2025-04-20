import { ThemeConfig, ThemeType } from './theme-types';

// BeOS Theme
const beosTheme: ThemeConfig = {
  id: "beos",
  name: "BeOS Classic",
  desktopBackground: "linear-gradient(to bottom, #a0c1e0 0%, #c0d0e8 100%)",
  cssVariables: {
    // Window variables
    "--window-bg": "#f0f0f0",
    "--window-border": "#888888",
    "--window-border-light": "#dddddd",
    "--window-border-lighter": "#ffffff",
    "--title-gradient-start": "#ffda8f",
    "--title-gradient-end": "#ffc34e",
    "--title-border": "#b99100",
    "--title-hover": "#ffce6f",
    "--title-active": "#ffc040",

    // Text and general colors
    "--text-primary": "#000000",
    "--text-secondary": "#333333",
    "--background": "#d0d8e8",
    "--foreground": "#000000",

    // Buttons and controls
    "--button-bg": "#e8e8e8",
    "--button-hover": "#f0f0f0",
    "--button-active": "#d0d0d0",
    "--button-border": "#888888",
    "--control-bg": "linear-gradient(to bottom, #f0f0f0, #d0d0d0)",
    "--control-border": "#888888",

    // Window header properties
    "--header-position": "absolute",
    "--header-top": "-36px",
    "--header-left": "-5px",
    "--header-height": "32px",
    "--header-width": "210px",
    "--header-border-radius": "4px 4px 0 0",
    "--header-padding": "0.25rem 0.5rem",
    "--window-padding-top": "22px",
    "--window-border-radius": "0",

    // Theme specific
    "--has-window-header-dot": "1",
    "--dot-color-start": "#fff9c9",
    "--dot-color-end": "#e7c01d",
    "--dot-border": "#b99100",
    "--taskbar-bg": "#ececec",
  },
};

// Light Modern Theme
const lightTheme: ThemeConfig = {
  id: "light",
  name: "Modern Light",
  desktopBackground:
    "linear-gradient(to bottom right, hsl(240, 75%, 98%), hsl(240, 20%, 95%))",
  cssVariables: {
    // Window variables
    "--window-bg": "0 0% 100%",
    "--window-border": "240 5% 84%",
    "--window-border-light": "240 5% 96%",
    "--window-border-lighter": "0 0% 100%",
    "--title-bg": "240 5% 96%",
    "--title-hover": "240 4% 90%",
    "--title-active": "240 5% 96%",
    "--title-border": "240 5% 84%",

    // Text and general colors
    "--text-primary": "240 10% 10%",
    "--text-secondary": "240 5% 35%",
    "--background": "0 0% 100%",
    "--foreground": "224 71% 4%",

    // Default UI colors based on shadcn
    "--primary": "262.1 83.3% 57.8%",
    "--primary-foreground": "210 20% 98%",
    "--secondary": "220 14.3% 95.9%",
    "--secondary-foreground": "220.9 39.3% 11%",
    "--muted": "220 14.3% 95.9%",
    "--muted-foreground": "220 8.9% 46.1%",
    "--accent": "220 14.3% 95.9%",
    "--accent-foreground": "220.9 39.3% 11%",
    "--destructive": "0 84.2% 60.2%",
    "--destructive-foreground": "210 20% 98%",
    "--border": "240 5.9% 90%",
    "--input": "240 5.9% 90%",
    "--ring": "262.1 83.3% 57.8%",

    // Window header properties
    "--header-position": "absolute",
    "--header-top": "0",
    "--header-left": "0",
    "--header-height": "36px",
    "--header-width": "100%",
    "--header-border-radius":
      "calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0",
    "--header-padding": "0.5rem 0.75rem",
    "--window-padding-top": "36px",
    "--window-border-radius": "var(--radius)",

    // Button and control styles
    "--button-bg": "0 0% 98%",
    "--button-hover": "0 0% 96%",
    "--button-active": "0 0% 94%",
    "--button-border": "240 5% 84%",
    "--control-bg": "220 14.3% 95.9%",
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "0 0% 100% 0.8",
  },
};

// Dark Modern Theme
const darkTheme: ThemeConfig = {
  id: "dark",
  name: "Modern Dark",
  desktopBackground:
    "linear-gradient(to bottom right, hsl(220, 13%, 18%), hsl(220, 13%, 12%))",
  cssVariables: {
    // Window variables
    "--window-bg": "220 13% 18%",
    "--window-border": "220 13% 15%",
    "--window-border-light": "220 13% 20%",
    "--window-border-lighter": "220 13% 22%",
    "--title-bg": "220 13% 22%",
    "--title-hover": "220 13% 24%",
    "--title-active": "220 13% 26%",
    "--title-border": "220 13% 15%",

    // Text and general colors
    "--text-primary": "220 13% 75%",
    "--text-secondary": "220 14% 65%",
    "--background": "220 13% 18%",
    "--foreground": "220 13% 75%",

    // Default UI colors - more muted like VS Code
    "--primary": "210 100% 70%",
    "--primary-foreground": "220 13% 18%",
    "--secondary": "220 13% 25%",
    "--secondary-foreground": "220 13% 75%",
    "--muted": "220 13% 22%",
    "--muted-foreground": "220 14% 55%",
    "--accent": "210 30% 30%",
    "--accent-foreground": "220 13% 75%",
    "--destructive": "0 70% 50%",
    "--destructive-foreground": "220 13% 95%",
    "--border": "220 13% 15%",
    "--input": "220 13% 15%",
    "--ring": "210 100% 70%",

    // Window header properties
    "--header-position": "absolute",
    "--header-top": "0",
    "--header-left": "0",
    "--header-height": "36px",
    "--header-width": "100%",
    "--header-border-radius":
      "calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0",
    "--header-padding": "0.5rem 0.75rem",
    "--window-padding-top": "36px",
    "--window-border-radius": "var(--radius)",

    // Button and control styles
    "--button-bg": "220 13% 22%",
    "--button-hover": "220 13% 25%",
    "--button-active": "220 13% 20%",
    "--button-border": "220 13% 15%",
    "--control-bg": "220 13% 22%",
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "220 13% 16% 0.8",
  },
};

export const themes: Record<ThemeType, ThemeConfig> = {
  beos: beosTheme,
  light: lightTheme,
  dark: darkTheme,
};

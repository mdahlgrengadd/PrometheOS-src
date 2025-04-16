import { ThemeConfig, ThemeType } from "./theme-types";

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
    "--window-bg": "hsl(0 0% 100%)",
    "--window-border": "hsl(240 5% 84%)",
    "--window-border-light": "hsl(240 5% 96%)",
    "--window-border-lighter": "hsl(0 0% 100%)",
    "--title-bg": "hsl(240 5% 96%)",
    "--title-hover": "hsl(240 4% 90%)",
    "--title-active": "hsl(240 5% 96%)",
    "--title-border": "hsl(240 5% 84%)",

    // Text and general colors
    "--text-primary": "hsl(240 10% 10%)",
    "--text-secondary": "hsl(240 5% 35%)",
    "--background": "hsl(0 0% 100%)",
    "--foreground": "hsl(224 71% 4%)",

    // Default UI colors based on shadcn
    "--primary": "hsl(262.1 83.3% 57.8%)",
    "--primary-foreground": "hsl(210 20% 98%)",
    "--secondary": "hsl(220 14.3% 95.9%)",
    "--secondary-foreground": "hsl(220.9 39.3% 11%)",
    "--muted": "hsl(220 14.3% 95.9%)",
    "--muted-foreground": "hsl(220 8.9% 46.1%)",
    "--accent": "hsl(220 14.3% 95.9%)",
    "--accent-foreground": "hsl(220.9 39.3% 11%)",
    "--destructive": "hsl(0 84.2% 60.2%)",
    "--destructive-foreground": "hsl(210 20% 98%)",
    "--border": "hsl(240 5.9% 90%)",
    "--input": "hsl(240 5.9% 90%)",
    "--ring": "hsl(262.1 83.3% 57.8%)",

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
    "--button-bg": "hsl(0 0% 98%)",
    "--button-hover": "hsl(0 0% 96%)",
    "--button-active": "hsl(0 0% 94%)",
    "--button-border": "hsl(240 5% 84%)",
    "--control-bg": "hsl(220 14.3% 95.9%)",
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "hsla(0, 0%, 100%, 0.8)",
  },
};

// Dark Modern Theme
const darkTheme: ThemeConfig = {
  id: "dark",
  name: "Modern Dark",
  desktopBackground:
    "linear-gradient(to bottom right, hsl(240, 20%, 10%), hsl(240, 20%, 2%))",
  cssVariables: {
    // Window variables
    "--window-bg": "hsl(224 71% 4%)",
    "--window-border": "hsl(240 3.7% 15.9%)",
    "--window-border-light": "hsl(240 5.1% 14%)",
    "--window-border-lighter": "hsl(240 5.1% 18%)",
    "--title-bg": "hsl(240 5.1% 14%)",
    "--title-hover": "hsl(240 3.7% 15.9%)",
    "--title-active": "hsl(240 5.1% 14%)",
    "--title-border": "hsl(240 3.7% 15.9%)",

    // Text and general colors
    "--text-primary": "hsl(210 20% 98%)",
    "--text-secondary": "hsl(217.9 10.6% 64.9%)",
    "--background": "hsl(224 71% 4%)",
    "--foreground": "hsl(210 20% 98%)",

    // Default UI colors based on shadcn dark mode
    "--primary": "hsl(263.4 70% 50.4%)",
    "--primary-foreground": "hsl(210 20% 98%)",
    "--secondary": "hsl(215 27.9% 16.9%)",
    "--secondary-foreground": "hsl(210 20% 98%)",
    "--muted": "hsl(215 27.9% 25%)", // Increased brightness for better visibility
    "--muted-foreground": "hsl(217.9 10.6% 64.9%)",
    "--accent": "hsl(215 27.9% 16.9%)",
    "--accent-foreground": "hsl(210 20% 98%)",
    "--destructive": "hsl(0 62.8% 30.6%)",
    "--destructive-foreground": "hsl(210 20% 98%)",
    "--border": "hsl(240 3.7% 15.9%)",
    "--input": "hsl(240 3.7% 15.9%)",
    "--ring": "hsl(263.4 70% 50.4%)",

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
    "--button-bg": "hsl(215 27.9% 16.9%)",
    "--button-hover": "hsl(215 25% 22%)",
    "--button-active": "hsl(215 25% 12%)",
    "--button-border": "hsl(240 3.7% 15.9%)",
    "--control-bg": "hsl(215 27.9% 16.9%)",
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "hsla(240, 10%, 3.9%, 0.8)",
  },
};

export const themes: Record<ThemeType, ThemeConfig> = {
  beos: beosTheme,
  light: lightTheme,
  dark: darkTheme,
};

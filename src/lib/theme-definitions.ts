// import * as win7Decorator from './decorators/win7.decorator';
// import * as win98Decorator from './decorators/win98.decorator';
// import * as winxpDecorator from './decorators/winxp.decorator';
import { ThemeConfig, ThemeType } from './theme-types';

// BeOS Theme
const beosTheme: ThemeConfig = {
  id: "beos",
  name: "BeOS Classic",
  desktopBackground: "linear-gradient(to bottom, #a0c1e0 0%, #c0d0e8 100%)",
  cssVariables: {
    // Window variables
    "--window-background": "#f0f0f0",
    "--window-border": "#888888",
    "--window-border-light": "#dddddd",
    "--window-border-lighter": "#ffffff",
    "--title-gradient-start": "#ffda8f",
    "--title-gradient-end": "#ffc34e",
    "--title-border": "#b99100",
    "--title-hover": "#ffce6f",
    "--title-active": "#ffc040",

    // Theme card active background
    "--theme-card-active-bg": "#f7e9c0",

    // Text and general colors
    "--text-primary": "#000000",
    "--text-secondary": "#333333",
    "--background": "hsla(216, 41%, 83%, 1)",
    "--foreground": "#000000",

    // Buttons and controls
    "--button-bg": "#e8e8e8",
    "--button-hover": "#f0f0f0",
    "--button-active": "#d0d0d0",
    "--button-border": "#888888",
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

    // Global app styling
    "--app-bg": "#d0d8e8",
    "--app-text": "#000000",
    "--control-bg": "linear-gradient(to bottom, #f0f0f0, #d0d0d0)",
    "--control-fg": "#000000",
    "--slider-track": "#cccccc",
    "--slider-thumb": "#888888",

    // for Switch unchecked/checked & focus styling:
    "--input": "0, 0%, 91%", // ~#e8e8e8 → HSL
    "--primary": "262.1, 83.3%, 57.8%", // match light/dark purple
    "--ring": "262.1, 83.3%, 57.8%",
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
    "--window-background": "hsl(0 0% 100%)",
    "--window-border": "240, 5%, 84%",
    "--window-border-light": "240, 5%, 96%",
    "--window-border-lighter": "0, 0%, 100%",
    "--title-bg": "240, 5%, 96%",
    "--title-hover": "240, 4%, 90%",
    "--title-active": "240, 5%, 96%",
    "--title-border": "240, 5%, 84%",

    // Theme card active background
    "--theme-card-active-bg": "#e6f0ff",

    // Text and general colors
    "--text-primary": "240, 10%, 10%",
    "--text-secondary": "240, 5%, 35%",
    "--background": "hsla(0, 0%, 100%, 1)",
    "--foreground": "224, 71%, 4%",

    // Default UI colors based on shadcn
    "--primary": "262.1, 83.3%, 57.8%",
    "--primary-foreground": "210, 20%, 98%",
    "--secondary": "220, 14.3%, 95.9%",
    "--secondary-foreground": "220.9, 39.3%, 11%",
    "--muted": "220, 14.3%, 95.9%",
    "--muted-foreground": "220, 8.9%, 46.1%",
    "--accent": "220, 14.3%, 95.9%",
    "--accent-foreground": "220.9, 39.3%, 11%",
    "--destructive": "0, 84.2%, 60.2%",
    "--destructive-foreground": "210, 20%, 98%",
    "--border": "240, 5.9%, 90%",
    "--input": "240, 5.9%, 90%",
    "--ring": "262.1, 83.3%, 57.8%",

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
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "hsla(0, 0%, 100%, 0.8)",

    // Global app styling
    "--app-bg": "hsl(240, 20%, 98%)",
    "--app-text": "hsl(240, 10%, 10%)",
    "--control-bg": "hsl(220, 14.3%, 95.9%)",
    "--control-fg": "hsl(220.9, 39.3%, 11%)",
    "--slider-track": "hsl(220, 14.3%, 90%)",
    "--slider-thumb": "hsl(262.1, 83.3%, 57.8%)",
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
    "--window-background": "hsl(220 13% 18%)",
    "--window-border": "#23242a",
    "--wm-border-color": "#23242a",
    "--window-border-light": "220, 13%, 20%",
    "--window-border-lighter": "220, 13%, 22%",
    "--title-bg": "220, 13%, 16%",
    "--title-hover": "220, 13%, 18%",
    "--title-active": "220, 13%, 20%",
    "--title-border": "220, 13%, 14%",
    "--window-header-background": "hsl(220, 13%, 14%)",
    "--window-header-text": "#e6e6e6",
    "--title-color": "#e6e6e6",

    // Theme card active background
    "--theme-card-active-bg": "#232b36",

    // Text and general colors
    "--text-primary": "220, 13%, 75%",
    "--text-secondary": "220, 14%, 65%",
    "--background": "hsla(220, 13%, 18%, 1)",
    "--foreground": "220, 13%, 75%",

    // Default UI colors - more muted like VS Code
    "--primary": "210, 100%, 70%",
    "--primary-foreground": "220, 13%, 18%",
    "--secondary": "220, 13%, 25%",
    "--secondary-foreground": "220, 13%, 75%",
    "--muted": "220, 13%, 22%",
    "--muted-foreground": "220, 14%, 55%",
    "--accent": "210, 30%, 30%",
    "--accent-foreground": "220, 13%, 75%",
    "--destructive": "0, 70%, 50%",
    "--destructive-foreground": "220, 13%, 95%",
    "--border": "220, 13%, 15%",
    "--input": "220, 13%, 15%",
    "--ring": "210, 100%, 70%",

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
    "--control-border": "transparent",

    // Theme specific
    "--has-window-header-dot": "0",
    "--taskbar-bg": "hsla(220, 13%, 16%, 0.8)",

    // Window control button colors
    "--wm-btn-close-bg": "#ff5f56",
    "--wm-btn-minimize-bg": "#ffbd2e",
    "--wm-btn-maximize-bg": "#28c941",
    "--wm-btn-gap": "6px",
    "--wm-btn-size": "14px",

    // Global app styling - more muted dark theme
    "--app-bg": "hsl(220, 10%, 15%)",
    "--app-text": "hsl(220, 13%, 75%)",
    "--control-bg": "hsl(220, 13%, 22%)",
    "--control-fg": "hsl(220, 13%, 75%)",
    "--slider-track": "hsl(220, 13%, 25%)",
    "--slider-thumb": "hsl(210, 100%, 70%)",
  },
};

export const themes: Record<ThemeType, ThemeConfig> = {
  beos: beosTheme,
  //light: lightTheme,
  dark: darkTheme,
  macos: {
    id: "macos",
    name: "macOS",
    desktopBackground: "linear-gradient(to bottom, #a0d8ef 0%, #ddf1fa 100%)",
    cssVariables: {
      // Window Structure
      "--wm-border-width": "1px",
      "--wm-border-color": "rgba(0, 0, 0, 0.1)",
      "--wm-border-radius": "8px",
      "--wm-header-height": "28px",
      "--wm-window-shadow": "0 8px 24px rgba(0, 0, 0, 0.12)",
      "--window-content-padding": "16px",

      // Colors
      "--window-background": "#ffffff",
      "--window-text": "#000000",
      "--window-header-background": "#f5f5f5",
      "--window-header-text": "#333333",
      "--window-header-button-hover": "#e5e5e5",
      "--window-header-button-active": "#d5d5d5",
      "--window-resize-handle": "rgba(0, 0, 0, 0.08)",

      // Theme card active background
      "--theme-card-active-bg": "#e3e8f0",

      // Control Buttons
      "--wm-btn-size": "12px",
      "--wm-btn-gap": "8px",
      "--wm-btn-close-bg": "#ff5f56",
      "--wm-btn-minimize-bg": "#ffbd2e",
      "--wm-btn-maximize-bg": "#28c941",

      // Accent Colors
      "--accent-primary": "#007aff",
      "--accent-secondary": "#5ac8fa",
      "--accent-tertiary": "#b4e4ff",

      // Button and control styles
      "--button-bg": "#f8f8f8",
      "--button-hover": "#f0f0f0",
      "--button-active": "#e8e8e8",
      "--button-border": "rgba(0, 0, 0, 0.1)",
      "--control-border": "rgba(0, 0, 0, 0.15)",

      // Header styling
      "--header-position": "absolute",
      "--header-top": "0",
      "--header-left": "0",
      "--header-height": "28px",
      "--header-width": "100%",
      "--header-border-radius": "8px 8px 0 0",
      "--header-padding": "0.25rem 0.5rem",
      "--window-padding-top": "28px",
      "--window-border-radius": "8px",

      // Theme specific
      "--taskbar-bg": "hsla(210, 20%, 95%, 0.8)",

      // macOS Dock styling
      "--dock-width": "600px",
      "--dock-height": "64px",
      "--dock-icon-size": "32px",
      "--dock-item-gap": "16px",
      "--dock-border-radius": "16px",

      // Global app styling
      "--background": "hsla(240, 10%, 96%, 1)",
      "--app-bg": "#f5f5f7",
      "--app-text": "#333333",
      "--control-bg": "#ffffff",
      "--control-fg": "#000000",
      "--slider-track": "#e0e0e0",
      "--slider-thumb": "#007aff",

      // for Switch unchecked/checked & focus styling:
      "--input": "0, 0%, 100%", // #ffffff
      "--primary": "211, 100%, 50%", // #007aff → HSL ≈211,100%,50%
      "--ring": "211, 100%, 50%",
    },
  },
  // fluxbox: {
  //   id: "fluxbox",
  //   name: "Linux Fluxbox",
  //   desktopBackground: "#333333",
  //   cssVariables: {
  //     // Window Structure
  //     "--wm-border-width": "2px",
  //     "--wm-border-color": "#333333",
  //     "--wm-border-radius": "2px",
  //     "--wm-header-height": "26px",
  //     "--wm-window-shadow": "2px 2px 4px rgba(0, 0, 0, 0.3)",
  //     "--window-content-padding": "12px",

  //     // Colors
  //     "--window-background": "#eeeeee",
  //     "--window-text": "#000000",
  //     "--window-header-background": "#444444",
  //     "--window-header-text": "#eeeeee",
  //     "--window-header-button-hover": "#555555",
  //     "--window-header-button-active": "#666666",
  //     "--window-resize-handle": "rgba(0, 0, 0, 0.3)",

  //     // Theme card active background
  //     "--theme-card-active-bg": "#2a2a2a",

  //     // Control Buttons
  //     "--wm-btn-size": "10px",
  //     "--wm-btn-gap": "3px",
  //     "--wm-btn-close-bg": "#ff6b6b",
  //     "--wm-btn-minimize-bg": "#feca57",
  //     "--wm-btn-maximize-bg": "#1dd1a1",

  //     // Accent Colors
  //     "--accent-primary": "#546de5",
  //     "--accent-secondary": "#8c7ae6",
  //     "--accent-tertiary": "#c8d6e5",

  //     // Button and control styles
  //     "--button-bg": "#444444",
  //     "--button-hover": "#555555",
  //     "--button-active": "#333333",
  //     "--button-border": "#555555",
  //     "--control-border": "#666666",

  //     // Header styling
  //     "--header-position": "absolute",
  //     "--header-top": "0",
  //     "--header-left": "0",
  //     "--header-height": "26px",
  //     "--header-width": "100%",
  //     "--header-border-radius": "2px 2px 0 0",
  //     "--header-padding": "0.25rem 0.5rem",
  //     "--window-padding-top": "26px",
  //     "--window-border-radius": "2px",

  //     // Theme specific
  //     "--taskbar-bg": "hsla(0, 0%, 26%, 0.9)",

  //     // Global app styling
  //     "--background": "hsla(0, 0%, 20%, 1)",
  //     "--app-bg": "#333333",
  //     "--app-text": "#eeeeee",
  //     "--control-bg": "#444444",
  //     "--control-fg": "#eeeeee",
  //     "--slider-track": "#555555",
  //     "--slider-thumb": "#8c7ae6",

  //     // for Switch unchecked/checked & focus styling:
  //     "--input": "0, 0%, 27%", // #444444
  //     "--primary": "231, 57%, 67%", // #546de5 → HSL ≈231,57%,67%
  //     "--ring": "231, 57%, 67%",
  //   },
  // },
  // win98: {
  //   id: "win98",
  //   name: "Windows 98",
  //   desktopBackground: "#008080",
  //   cssVariables: {
  //     // Basic window structure
  //     "--window-background": "#c0c0c0",
  //     "--window-border": "#808080",
  //     "--text-primary": "#000000",
  //     "--app-bg": "#008080",
  //     // Common UI elements
  //     "--taskbar-bg": "#c0c0c0",
  //     "--button-bg": "#c0c0c0",
  //     "--button-hover": "#c0c0c0",
  //     "--button-active": "#c0c0c0",
  //   },
  //   preload: win98Decorator.preload,
  //   postload: win98Decorator.postload,
  // },
  // winxp: {
  //   id: "winxp",
  //   name: "Windows XP",
  //   desktopBackground:
  //     "linear-gradient(to bottom, #236B8E, #3A8FB7, #78CFEB, #C2E3F1)",
  //   cssVariables: {
  //     // Basic window structure
  //     "--window-background": "#ECE9D8",
  //     "--window-border": "#0054E3",
  //     "--text-primary": "#000000",
  //     "--app-bg": "#236B8E",
  //     // Common UI elements
  //     "--taskbar-bg": "linear-gradient(to bottom, #2A5889, #3A6EA5)",
  //     "--button-bg": "#ECE9D8",
  //     "--button-hover": "#ECE9D8",
  //     "--button-active": "#ECE9D8",
  //   },
  //   preload: winxpDecorator.preload,
  //   postload: winxpDecorator.postload,
  // },
  // win7: {
  //   id: "win7",
  //   name: "Windows 7",
  //   desktopBackground: "linear-gradient(to bottom, #1F5D9A, #66AAD7)",
  //   cssVariables: {
  //     // Basic window structure
  //     "--window-background": "#FFFFFF",
  //     "--window-border": "#AAAAAA",
  //     "--text-primary": "#000000",
  //     "--app-bg": "#1F5D9A",
  //     // Common UI elements
  //     "--taskbar-bg": "linear-gradient(to bottom, #2B5D97, #3A73B7, #2B5D97)",
  //     "--button-bg": "#E1E1E1",
  //     "--button-hover": "#E5F1FB",
  //     "--button-active": "#CCE4F7",
  //   },
  //   preload: win7Decorator.preload,
  //   postload: win7Decorator.postload,
  // },
};

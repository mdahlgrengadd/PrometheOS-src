import themeManifest from './theme-manifest.json';
import { ThemeConfig, ThemeType } from './theme-types';

interface ExternalTheme {
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
}

// Required fields for a valid theme
const requiredThemeFields = [
  "id",
  "name",
  "cssUrl",
  "desktopBackground",
  "cssVariables",
];

// All CSS variables that themes should define
const requiredCssVariables = [
  // Window structure
  "--wm-border-width",
  "--wm-border-color",
  "--wm-border-radius",
  "--wm-header-height",

  // Colors
  "--window-background",
  "--window-text",
  "--window-header-background",
  "--window-header-text",
  "--window-header-button-hover",
  "--window-header-button-active",
  "--window-resize-handle",

  // Control buttons
  "--wm-btn-close-bg",
  "--wm-btn-minimize-bg",
  "--wm-btn-maximize-bg",

  // Theme-specific variables
  "--taskbar-bg",
  "--text-primary",
  "--accent-primary",
];

// Validate that a theme has all required fields
const validateTheme = (theme: Partial<ExternalTheme>): boolean => {
  for (const field of requiredThemeFields) {
    if (!theme[field as keyof ExternalTheme]) {
      console.error(`Theme is missing required field: ${field}`);
      return false;
    }
  }

  // Check if cssVariables contains all required variables
  const variables = theme.cssVariables || {};
  const missingVars = requiredCssVariables.filter(
    (varName) => !variables[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      `Theme is missing required CSS variables: ${missingVars.join(", ")}`
    );
    return false;
  }

  return true;
};

// Convert an external theme to our internal ThemeConfig format
const convertExternalTheme = (externalTheme: ExternalTheme): ThemeConfig => {
  return {
    id: externalTheme.id as ThemeType,
    name: externalTheme.name,
    desktopBackground: externalTheme.desktopBackground,
    cssVariables: externalTheme.cssVariables,
  };
};

// Load CSS for an external theme
const loadThemeCSS = async (cssUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS from ${cssUrl}`));
    document.head.appendChild(link);
  });
};

// Load decorator module for a theme
const loadThemeDecorator = async (decoratorPath: string): Promise<unknown> => {
  try {
    const module = await import(/* @vite-ignore */ decoratorPath);
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load decorator from ${decoratorPath}`, error);
    return null;
  }
};

// Get all available themes from the manifest
export const getAvailableExternalThemes = (): ExternalTheme[] => {
  return themeManifest.themes || [];
};

// Load an external theme by ID
export const loadExternalTheme = async (
  themeId: string
): Promise<ThemeConfig | null> => {
  const externalTheme = themeManifest.themes.find(
    (theme) => theme.id === themeId
  );

  if (!externalTheme) {
    console.error(`Theme '${themeId}' not found in manifest`);
    return null;
  }

  // Validate the theme has all required fields before attempting to load
  if (!validateTheme(externalTheme)) {
    console.error(`Theme '${themeId}' has invalid schema`);
    return null;
  }

  try {
    // Load the theme's CSS
    await loadThemeCSS(externalTheme.cssUrl);

    // Load the theme's decorator if it has one
    if (externalTheme.decoratorPath) {
      await loadThemeDecorator(externalTheme.decoratorPath);
    }

    // Convert and return the theme config
    return convertExternalTheme(externalTheme);
  } catch (error) {
    console.error(`Failed to load theme '${themeId}'`, error);
    return null;
  }
};

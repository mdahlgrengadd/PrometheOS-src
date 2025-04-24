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

// Load decorator module for a theme using a script tag
const loadThemeDecorator = async (decoratorPath: string): Promise<unknown> => {
  // Check if the script is already loaded
  const existingScript = document.querySelector(
    `script[data-decorator="${decoratorPath}"]`
  );
  if (existingScript) {
    // Extract the class name from the path (e.g., "Win95Decorator" from "/themes/win95/decorator.js")
    const pathParts = decoratorPath.split("/");
    const theme = pathParts[pathParts.length - 2]; // Get the theme name (e.g., "win95")
    const decoratorClassName =
      theme.charAt(0).toUpperCase() + theme.slice(1) + "Decorator"; // e.g., "Win95Decorator"
    return window[decoratorClassName];
  }

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      script.src = decoratorPath;
      script.type = "module";
      script.dataset.decorator = decoratorPath;

      script.onload = () => {
        // Get the theme name from the path (e.g., "win95" from "/themes/win95/decorator.js")
        const pathParts = decoratorPath.split("/");
        const theme = pathParts[pathParts.length - 2];
        const decoratorClassName =
          theme.charAt(0).toUpperCase() + theme.slice(1) + "Decorator"; // e.g., "Win95Decorator"

        // Try to find the decorator class in the global scope
        setTimeout(() => {
          const decoratorClass = window[decoratorClassName];
          if (decoratorClass) {
            resolve(decoratorClass);
          } else {
            console.warn(
              `Decorator class ${decoratorClassName} not found in global scope`
            );
            resolve(null);
          }
        }, 100); // Give a small delay for the script to be evaluated
      };

      script.onerror = () => {
        reject(new Error(`Failed to load decorator from ${decoratorPath}`));
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error(`Failed to load decorator from ${decoratorPath}`, error);
      reject(error);
    }
  });
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

import {
  isValidThemeManifest,
  validateThemeManifest,
} from "@/utils/validateTheme";

import themeManifest from "./theme-manifest.json";
import { ExternalThemeManifest, ThemeConfig, ThemeType } from "./theme-types";

// Storage keys
const INSTALLED_THEMES_KEY = "installed-themes";

/**
 * Validate that a theme has all required fields
 * @param theme The theme to validate
 * @returns boolean indicating if the theme is valid
 */
const validateTheme = (theme: Partial<ExternalThemeManifest>): boolean => {
  const validationErrors = validateThemeManifest(theme);
  if (validationErrors.length > 0) {
    console.error("Theme validation errors:", validationErrors);
    return false;
  }
  return true;
};

/**
 * Convert an external theme to our internal ThemeConfig format
 * @param externalTheme The external theme manifest
 * @returns ThemeConfig object
 */
const convertExternalTheme = (
  externalTheme: ExternalThemeManifest
): ThemeConfig => {
  return {
    id: externalTheme.id,
    name: externalTheme.name,
    desktopBackground: externalTheme.desktopBackground,
    cssVariables: externalTheme.cssVariables,
    version: externalTheme.version,
    author: externalTheme.author,
    description: externalTheme.description,
    preview: externalTheme.preview,
  };
};

/**
 * Load CSS for an external theme
 * @param cssUrl The URL to the CSS file
 * @returns Promise that resolves when the CSS is loaded
 */
const loadThemeCSS = async (cssUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if this CSS is already loaded
    const existingLink = document.querySelector(`link[href="${cssUrl}"]`);
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS from ${cssUrl}`));
    document.head.appendChild(link);
  });
};

/**
 * Load decorator module for a theme using a script tag
 * @param decoratorPath The path to the decorator module
 * @returns Promise that resolves with the decorator module
 */
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
    return (window as unknown as Record<string, unknown>)[decoratorClassName];
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
          const decoratorClass = (window as unknown as Record<string, unknown>)[
            decoratorClassName
          ];
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

/**
 * Get all available themes from the manifest and localStorage
 * @returns Array of external theme manifests
 */
export const getAvailableExternalThemes = (): ExternalThemeManifest[] => {
  // Get themes from manifest
  const manifestThemes = themeManifest.themes || [];

  // Get any stored theme manifests from localStorage
  const storedThemesJson = localStorage.getItem(INSTALLED_THEMES_KEY);
  const storedThemes: ExternalThemeManifest[] = storedThemesJson
    ? JSON.parse(storedThemesJson)
    : [];

  // Combine and deduplicate
  const uniqueThemes = new Map<string, ExternalThemeManifest>();

  manifestThemes.forEach((theme) => {
    uniqueThemes.set(theme.id, theme);
  });

  storedThemes.forEach((theme) => {
    uniqueThemes.set(theme.id, theme);
  });

  return Array.from(uniqueThemes.values());
};

/**
 * Load an external theme by ID
 * @param themeId The ID of the theme to load
 * @returns Promise resolving to ThemeConfig or null
 */
export const loadExternalTheme = async (
  themeId: string
): Promise<ThemeConfig | null> => {
  // Find theme in both manifest and localStorage
  const externalThemes = getAvailableExternalThemes();
  const externalTheme = externalThemes.find((theme) => theme.id === themeId);

  if (!externalTheme) {
    console.error(`Theme '${themeId}' not found in manifest`);
    return null;
  }

  // Validate the theme has all required fields before attempting to load
  const validationErrors = validateThemeManifest(externalTheme);
  if (validationErrors.length > 0) {
    console.error(
      `Theme '${themeId}' has validation errors:`,
      validationErrors
    );
    return null;
  }

  try {
    // Load the theme's CSS
    await loadThemeCSS(externalTheme.cssUrl);

    // Convert and prepare the theme config
    const themeConfig = convertExternalTheme(externalTheme);

    // Load the theme's decorator if it has one
    if (externalTheme.decoratorPath) {
      const decoratorModule = await loadThemeDecorator(
        externalTheme.decoratorPath
      );
      themeConfig.decoratorModule = decoratorModule;
    }

    return themeConfig;
  } catch (error) {
    console.error(`Failed to load theme '${themeId}'`, error);
    return null;
  }
};

/**
 * Install a theme from a remote URL
 * @param manifestUrl URL to the theme manifest JSON
 * @returns Promise resolving to {success: boolean, error?: string} indicating success and any error message
 */
export const installTheme = async (
  manifestUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Fetch the manifest
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch manifest: ${response.statusText} (${response.status})`,
      };
    }

    let themeManifest: Partial<ExternalThemeManifest>;
    try {
      themeManifest = await response.json();
    } catch (e) {
      return {
        success: false,
        error: "Invalid JSON in theme manifest",
      };
    }

    // Validate the theme
    const validationErrors = validateThemeManifest(themeManifest);
    if (validationErrors.length > 0) {
      console.error("Theme validation errors:", validationErrors);
      return {
        success: false,
        error: `Invalid theme manifest: ${validationErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ")}`,
      };
    }

    // Add to stored themes
    const storedThemesJson = localStorage.getItem(INSTALLED_THEMES_KEY);
    const storedThemes: ExternalThemeManifest[] = storedThemesJson
      ? JSON.parse(storedThemesJson)
      : [];

    // Check if theme is already installed
    const existingIndex = storedThemes.findIndex(
      (t) => t.id === themeManifest.id
    );
    if (existingIndex >= 0) {
      storedThemes[existingIndex] = themeManifest as ExternalThemeManifest;
    } else {
      storedThemes.push(themeManifest as ExternalThemeManifest);
    }

    // Save updated themes
    localStorage.setItem(INSTALLED_THEMES_KEY, JSON.stringify(storedThemes));

    return { success: true };
  } catch (error) {
    console.error("Error installing theme:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error installing theme",
    };
  }
};

/**
 * Uninstall a theme by ID
 * @param themeId The ID of the theme to uninstall
 * @returns Promise resolving to boolean indicating success
 */
export const uninstallTheme = async (themeId: string): Promise<boolean> => {
  try {
    // Get stored themes
    const storedThemesJson = localStorage.getItem(INSTALLED_THEMES_KEY);
    if (!storedThemesJson) {
      return false;
    }

    const storedThemes: ExternalThemeManifest[] = JSON.parse(storedThemesJson);

    // Filter out the theme to uninstall
    const filteredThemes = storedThemes.filter((t) => t.id !== themeId);

    // If no change in length, theme wasn't found
    if (filteredThemes.length === storedThemes.length) {
      return false;
    }

    // Save updated themes
    localStorage.setItem(INSTALLED_THEMES_KEY, JSON.stringify(filteredThemes));

    // Remove any loaded CSS
    const theme = storedThemes.find((t) => t.id === themeId);
    if (theme?.cssUrl) {
      const cssLink = document.querySelector(`link[href="${theme.cssUrl}"]`);
      if (cssLink) {
        cssLink.remove();
      }
    }

    return true;
  } catch (error) {
    console.error("Error uninstalling theme:", error);
    return false;
  }
};

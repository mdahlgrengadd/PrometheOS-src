import { isValidThemeManifest, validateThemeManifest } from '@/utils/validateTheme';

import themeManifest from './theme-manifest.json';
import { ExternalThemeManifest, ThemeConfig, ThemeType } from './theme-types';

// Storage keys
const INSTALLED_THEMES_KEY = "installed-themes";

// Define type for theme decorator module
interface ThemeDecoratorModule {
  preload?: (previousTheme: ThemeType) => Promise<boolean>;
  postload?: () => void;
  cleanup?: () => void;
  [key: string]: unknown;
}

// Base URL for public assets under Vite
const base = import.meta.env.BASE_URL;

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
  // Inject --background / --app-bg from desktopBackground for external themes
  const cssVariablesWithBg = {
    ...externalTheme.cssVariables,
    "--app-bg": externalTheme.desktopBackground,
  };

  // Convert hex color to hsla() format for --background if it's a hex color
  if (externalTheme.desktopBackground.startsWith("#")) {
    // For simple implementation, use a placeholder HSL value
    // In a real implementation, you would use a proper hex-to-hsl conversion
    const hexColor = externalTheme.desktopBackground.toLowerCase();

    // This is a simplified implementation - for production code,
    // you would want to implement a proper hex-to-hsl converter
    if (hexColor === "#c0c0c0") {
      cssVariablesWithBg["--background"] = "hsla(0, 0%, 75%, 1)"; // gray
    } else if (hexColor === "#333333") {
      cssVariablesWithBg["--background"] = "hsla(0, 0%, 20%, 1)"; // dark gray
    } else if (hexColor === "#ffffff") {
      cssVariablesWithBg["--background"] = "hsla(0, 0%, 100%, 1)"; // white
    } else if (hexColor === "#000000") {
      cssVariablesWithBg["--background"] = "hsla(0, 0%, 0%, 1)"; // black
    } else {
      // Generic approximation for other colors
      // In a real implementation, you would properly convert hex to HSL
      cssVariablesWithBg["--background"] = "hsla(210, 10%, 50%, 1)";
    }
  } else if (
    externalTheme.desktopBackground.startsWith("linear-gradient") ||
    externalTheme.desktopBackground.startsWith("radial-gradient")
  ) {
    // For gradients, use a default hsla value
    cssVariablesWithBg["--background"] = "hsla(210, 10%, 50%, 1)";
  } else {
    // If it's already in hsla format, use it directly
    // Otherwise, wrap it in hsla format with full opacity
    if (externalTheme.desktopBackground.startsWith("hsla(")) {
      cssVariablesWithBg["--background"] = externalTheme.desktopBackground;
    } else if (externalTheme.desktopBackground.startsWith("hsl(")) {
      // Convert hsl() to hsla() by adding opacity
      cssVariablesWithBg["--background"] = externalTheme.desktopBackground
        .replace("hsl(", "hsla(")
        .replace(")", ", 1)");
    } else {
      // For any other format, use a fallback
      cssVariablesWithBg["--background"] = "hsla(210, 10%, 50%, 1)";
    }
  }

  return {
    id: externalTheme.id,
    name: externalTheme.name,
    desktopBackground: externalTheme.desktopBackground,
    cssVariables: cssVariablesWithBg,
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
export const loadThemeCSS = async (
  cssUrl: string,
  themeId?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if this CSS is already loaded
    // Resolve path relative to base
    const resolvedCssUrl = cssUrl.startsWith("http")
      ? cssUrl
      : base + cssUrl.replace(/^\/+/, "");
    const existingLink = document.querySelector(
      `link[href="${resolvedCssUrl}"]`
    );
    if (existingLink) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = resolvedCssUrl;
    // Add data attributes to make it easier to identify and remove theme CSS
    link.setAttribute("data-theme-css", "true");
    if (themeId) {
      link.setAttribute("data-theme-id", themeId);
    }
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS from ${cssUrl}`));
    document.head.appendChild(link);
  });
};

/**
 * Load decorator module for a theme using dynamic ESM import
 * @param decoratorPath The path to the decorator module
 * @returns Promise that resolves with the decorator module
 */
const loadThemeDecorator = async (
  decoratorPath: string
): Promise<ThemeDecoratorModule | null> => {
  try {
    // Using dynamic import to load the module
    console.log(`Loading decorator from ${decoratorPath} using ESM import`);

    let decoratorModule: Record<string, unknown> | null = null;

    // Resolve decoratorPath against base
    const resolvedDecoratorPath = decoratorPath.startsWith("http")
      ? decoratorPath
      : base + decoratorPath.replace(/^\/+/, "");
    // In development mode, fetch via AJAX and evaluate as module
    if (process.env.NODE_ENV === "development") {
      const response = await fetch(resolvedDecoratorPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch decorator: ${response.statusText}`);
      }

      const code = await response.text();

      // Create a blob URL from the code
      const blob = new Blob([code], { type: "application/javascript" });
      const blobURL = URL.createObjectURL(blob);

      try {
        // Import the blob URL
        const module = await import(/* @vite-ignore */ blobURL);
        decoratorModule = module.default;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobURL);
      }
    } else {
      // For production or other cases, use normal import
      // Add a random query parameter to bypass cache during development
      const cacheBuster =
        process.env.NODE_ENV === "development" ? `?_=${Date.now()}` : "";
      // Prefix with base for correct public path
      const importPath = decoratorPath.startsWith("http")
        ? decoratorPath
        : base + decoratorPath.replace(/^\/+/, "");
      const fullPath = `${importPath}${cacheBuster}`;

      // Dynamic import of the module
      const module = await import(/* @vite-ignore */ fullPath);
      decoratorModule = module.default;
    }

    if (!decoratorModule) {
      console.warn(
        `No default export found in decorator module: ${decoratorPath}`
      );
      return null;
    } // Verify that the module has the expected properties
    if (
      typeof decoratorModule === "object" &&
      decoratorModule !== null &&
      (typeof decoratorModule.preload === "function" ||
        typeof decoratorModule.Header === "function")
    ) {
      return decoratorModule as unknown as ThemeDecoratorModule;
    }
    console.warn(
      `Decorator module doesn't have expected properties: ${decoratorPath}`
    );
    return null;
  } catch (error) {
    console.error(`Failed to load decorator from ${decoratorPath}:`, error);
    return null;
  }
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

  // Debug output to check what themes are available
  console.log("Available external themes:", Array.from(uniqueThemes.values()));

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
    // Load the theme's CSS with themeId for better identification
    await loadThemeCSS(externalTheme.cssUrl, themeId);

    // Convert and prepare the theme config
    const themeConfig = convertExternalTheme(externalTheme);

    // Load the theme's decorator if it has one
    if (externalTheme.decoratorPath) {
      const decoratorModule = await loadThemeDecorator(
        externalTheme.decoratorPath
      );

      if (decoratorModule) {
        // Store the decorator module reference
        themeConfig.decoratorModule = decoratorModule;

        // Map decorator module functions to theme config hooks
        if (typeof decoratorModule.preload === "function") {
          themeConfig.preload = decoratorModule.preload;
        }
        if (typeof decoratorModule.postload === "function") {
          themeConfig.postload = decoratorModule.postload;
        }
      }
    }

    return themeConfig;
  } catch (error) {
    console.error(`Failed to load theme '${themeId}':`, error);
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
    // Fetch the manifest, resolving against base if needed
    const manifestFetchUrl = manifestUrl.startsWith("http")
      ? manifestUrl
      : base + manifestUrl.replace(/^\/+/, "");
    const response = await fetch(manifestFetchUrl);

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
    } // Add to stored themes
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

    console.log("Theme installed successfully:", themeManifest);
    console.log("Current themes in storage:", JSON.stringify(storedThemes));

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

    // Try multiple strategies for reliable CSS removal
    if (theme) {
      // 1. Remove by theme ID data attribute (most reliable)
      document
        .querySelectorAll(`link[data-theme-id="${themeId}"]`)
        .forEach((el) => el.remove());

      // 2. Remove by URL if specified
      if (theme.cssUrl) {
        document
          .querySelectorAll(`link[href="${theme.cssUrl}"]`)
          .forEach((el) => el.remove());
      }

      // 3. Try a backup approach for Win7 theme (since it uses a CDN link that might vary)
      if (themeId === "win7") {
        document
          .querySelectorAll('link[href*="7.css"]')
          .forEach((el) => el.remove());
      }
    }

    return true;
  } catch (error) {
    console.error("Error uninstalling theme:", error);
    return false;
  }
};

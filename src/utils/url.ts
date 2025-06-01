import { PluginInitData } from "../plugins/types";

/**
 * Generate a URL to directly launch an app
 * @param appId - The ID of the app to launch
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Full URL to launch the app
 */
export function getAppLaunchUrl(appId: string, baseUrl?: string): string {
  const base =
    baseUrl || `${window.location.protocol}//${window.location.host}`;
  return `${base}?open=${appId}`;
}

/**
 * Generate a URL to directly launch an app with initialization content
 * @param appId - The ID of the app to launch
 * @param initFromUrl - The initialization URL/content for the app
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Full URL to launch the app with initialization
 */
export function getAppLaunchUrlWithInit(
  appId: string,
  initFromUrl: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || `${window.location.protocol}//${window.location.host}`;
  const encodedInit = encodeURIComponent(initFromUrl);
  return `${base}?open=${appId}&initFromUrl=${encodedInit}`;
}

/**
 * Generate a URL to launch multiple apps, optionally with initialization content
 * @param apps - Array of apps to launch with optional initialization data
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Full URL to launch multiple apps
 */
export function getMultiAppLaunchUrl(
  apps: AppLaunchData[],
  baseUrl?: string
): string {
  const base =
    baseUrl || `${window.location.protocol}//${window.location.host}`;
  const appIds = apps.map((app) => app.appId).join(",");
  let url = `${base}?open=${appIds}`;

  // Add individual init parameters for apps that have them
  apps.forEach((app) => {
    if (app.initFromUrl) {
      const encodedInit = encodeURIComponent(app.initFromUrl);
      url += `&${app.appId}_init=${encodedInit}`;
    }
  });

  return url;
}

/**
 * Parse the current URL to extract query string parameters
 * that might contain app state
 * @returns Object containing parsed parameters
 */
export function parseUrlParams(): Record<string, string | string[]> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of params.entries()) {
    // Handle comma-separated values as arrays
    if (value.includes(",")) {
      result[key] = value.split(",");
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extract open apps from URL query parameters
 * @returns Array of app IDs to open
 */
export function getOpenAppsFromUrl(): string[] {
  const params = parseUrlParams();
  if (params.open && Array.isArray(params.open)) {
    return params.open;
  } else if (params.open && typeof params.open === "string") {
    return [params.open];
  }
  return [];
}

/**
 * Enhanced app launch data containing app ID and optional initialization URL
 */
export interface AppLaunchData {
  appId: string;
  initFromUrl?: string;
}

/**
 * Get apps to launch from URL query parameters
 * Supports multiple formats:
 * - ?open=appId
 * - ?open=appId1,appId2,appId3
 * - ?open=appId&initFromUrl=url
 * - ?open=appId1,appId2&appId1_init=url1&appId2_init=url2
 */
export function getAppsToLaunchFromUrl(): AppLaunchData[] {
  // Get current URL search params
  const params = new URLSearchParams(window.location.search);
  const openParam = params.get("open");

  // If no 'open' parameter, return empty array
  if (!openParam) return [];

  // If 'open' parameter exists, parse it to get app IDs
  // Use encodeURIComponent to handle commas in data URLs
  const appIds = openParam.split(",").map((id) => id.trim());

  // Return array of app launch info objects
  return appIds.map((appId) => {
    // Check for app-specific init parameter (appId_init)
    const appInitParam = params.get(`${appId}_init`);

    // If app-specific init param exists, use it
    if (appInitParam) {
      return {
        appId,
        initFromUrl: decodeURIComponent(appInitParam),
      };
    }

    // If this is the first/only app and there's a global initFromUrl param, use it
    if (appId === appIds[0] && params.get("initFromUrl")) {
      return {
        appId,
        initFromUrl: decodeURIComponent(params.get("initFromUrl") || ""),
      };
    }

    // Otherwise, return just the app ID without init data
    return { appId };
  });
}

/**
 * URL scheme types supported for plugin initialization
 */
export type UrlScheme =
  | "http"
  | "https"
  | "vfs"
  | "app"
  | "data"
  | "plain"
  | "none"
  | "error";

/**
 * Result of processing a URL for plugin initialization
 */
export interface ProcessedUrlData {
  scheme: UrlScheme;
  content: string;
  originalUrl: string;
  error?: string;
}

/**
 * Process a URL string and determine its scheme and content
 * @param url - The URL string to process
 * @returns Promise<ProcessedUrlData> with scheme, content, and any errors
 */
export async function processInitUrl(url: string): Promise<PluginInitData> {
  try {
    // Check for empty or undefined URL
    if (!url) {
      return {
        initFromUrl: url,
        scheme: "none",
        content: "",
      };
    }

    // Handle HTTP/HTTPS scheme
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const response = await fetch(url);
      const content = await response.text();
      return {
        initFromUrl: url,
        scheme: "http",
        content,
      };
    }    // Handle App scheme (app:// for published apps)
    if (url.startsWith("app://")) {
      // Extract app path from app://PublishedApps/AppName.exe
      const urlParts = url.substring(6); // Remove "app://"
      if (urlParts.startsWith("PublishedApps/")) {
        const appName = urlParts.substring(14); // Remove "PublishedApps/"
        
        // Try to get the index.html content from the published app
        const appIndexPath = `published-apps/${appName}/index.html`;
        const { getFileContent } = await import("@/store/fileSystem");
        const content = getFileContent(appIndexPath);
        
        if (content !== null) {
          return {
            initFromUrl: url,
            scheme: "app",
            content,
          };
        } else {
          throw new Error(`Published app not found: ${appName}`);
        }
      } else {
        throw new Error(`Invalid app:// URL format: ${url}`);
      }
    }

    // Handle Virtual File System scheme
    if (url.startsWith("vfs://")) {
      const fileId = url.substring(6); // Remove "vfs://" prefix
      
      // Import the file system helper function
      const { getFileContent } = await import("@/store/fileSystem");
      const content = getFileContent(fileId);
      
      if (content === null) {
        throw new Error(`File not found in VFS: ${fileId}`);
      }
      
      return {
        initFromUrl: url,
        scheme: "vfs",
        content,
      };
    }

    // Handle Data scheme (two formats: data:// and standard data:)
    if (url.startsWith("data://") || url.startsWith("data:")) {
      let content = "";
      let dataString = "";

      if (url.startsWith("data://")) {
        // Custom data:// format
        const parts = url.substring(7).split(",");
        const encoding = parts[0];
        dataString = parts.slice(1).join(",");

        if (encoding === "base64") {
          content = atob(dataString);
        } else {
          content = dataString;
        }
      } else {
        // Standard data: URL format
        const commaIndex = url.indexOf(",");
        if (commaIndex !== -1) {
          const header = url.substring(5, commaIndex);
          dataString = url.substring(commaIndex + 1);

          if (header.endsWith(";base64")) {
            content = atob(dataString);
          } else {
            content = decodeURIComponent(dataString);
          }
        }
      }

      return {
        initFromUrl: url,
        scheme: "data",
        content,
      };
    } // Default case: treat as plain text
    return {
      initFromUrl: url,
      scheme: "plain",
      content: url,
    };
  } catch (error) {
    return {
      initFromUrl: url,
      scheme: "error",
      content: "",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Create initialization data from a URL string
 * @param url - The URL string to process
 * @returns Promise<PluginInitData> ready for plugin initialization
 */
export async function createInitDataFromUrl(
  url?: string
): Promise<import("../plugins/types").PluginInitData | undefined> {
  if (!url) {
    return undefined;
  }

  const processed = await processInitUrl(url);

  return {
    initFromUrl: url,
    scheme: processed.scheme,
    content: processed.content,
    error: processed.error,
  };
}

/**
 * Extract plugin initialization parameters from URL
 * @returns Object containing plugin ID and init URL if specified
 */
export function getPluginInitFromUrl(): {
  pluginId?: string;
  initFromUrl?: string;
} | null {
  const params = parseUrlParams();

  // Check for plugin parameter with optional initFromUrl
  if (params.plugin && typeof params.plugin === "string") {
    const initFromUrl =
      params.initFromUrl && typeof params.initFromUrl === "string"
        ? params.initFromUrl
        : undefined;

    return {
      pluginId: params.plugin,
      initFromUrl,
    };
  }

  return null;
}

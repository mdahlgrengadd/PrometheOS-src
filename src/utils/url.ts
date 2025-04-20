/**
 * Generate a URL to directly launch an app
 * @param appId - The ID of the app to launch
 * @param baseUrl - Optional base URL (defaults to current host)
 * @returns Full URL to launch the app
 */
export function getAppLaunchUrl(appId: string, baseUrl?: string): string {
  const base =
    baseUrl || `${window.location.protocol}//${window.location.host}`;
  return `${base}/apps/${appId}`;
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

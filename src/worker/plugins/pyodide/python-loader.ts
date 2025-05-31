/**
 * Python code loader utilities for the Pyodide plugin
 * Enhanced with bundle fallback to handle development server serving .py files as HTML
 */

/**
 * Python bundle type for fallback loading
 */
interface PythonBundle {
  [filename: string]: string;
}

/**
 * Check if the response content is HTML (indicating server is serving .py files as HTML)
 */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<title>") ||
    trimmed.includes("<head>") ||
    trimmed.includes("<body>")
  );
}

/**
 * Global base URL set from main thread during initialization
 */
let globalBaseUrl: string | null = null;

/**
 * Set the base URL for loading Python files
 * This should be called from the main thread during worker initialization
 */
export function setBaseUrl(baseUrl: string): void {
  globalBaseUrl = baseUrl;
  console.log(`Python loader base URL set to: ${baseUrl}`);
  console.log(`globalBaseUrl is now: ${globalBaseUrl}`);
}

/**
 * Get the base URL for loading Python files
 */
function getBaseUrl(): string {
  console.log(`getBaseUrl called, globalBaseUrl is: ${globalBaseUrl}`);
  
  // Use the global base URL if available (passed from main thread)
  if (globalBaseUrl !== null) {
    console.log(`Using globalBaseUrl: ${globalBaseUrl}`);
    return globalBaseUrl;
  }
  
  // Final fallback
  console.log(`Using fallback base URL: /`);
  return '/';
}

/**
 * Load Python code from a file path with bundle fallback
 */
export async function loadPythonCode(filename: string): Promise<string> {
  try {
    // Get the base URL from the configured source
    const baseUrl = getBaseUrl();
    
    // Try multiple possible paths, starting with the most likely to work
    const possiblePaths = [
      // Production path (files copied to public/worker/)
      `${baseUrl}worker/pyodide/python/${filename}`,
    ];

    let lastError: Error | null = null;

    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load Python file from: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          const content = await response.text();

          // Check if we got HTML instead of Python code
          if (isHtmlContent(content)) {
            console.warn(
              `Got HTML content instead of Python from ${path}, trying next path...`
            );
            lastError = new Error(
              `Got HTML content instead of Python from ${path}`
            );
            continue;
          }

          console.log(`Successfully loaded Python file from: ${path}`);
          return content;
        }
        lastError = new Error(
          `Failed to load ${filename} from ${path}: ${response.statusText}`
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    // If all paths failed, try the bundle fallback
    console.log(
      `All direct paths failed for ${filename}, trying bundle fallback...`
    );
    return await loadFromBundle(filename);
  } catch (error) {
    console.error(`Error loading Python file ${filename}:`, error);
    throw error;
  }
}

/**
 * Load Python code from the bundle fallback
 */
async function loadFromBundle(filename: string): Promise<string> {
  try {
    // Get the base URL from the configured source
    const baseUrl = getBaseUrl();
    
    // Try multiple bundle paths
    const bundlePaths = [
      `${baseUrl}worker/pyodide-python-bundle.json`,
      "/public/worker/pyodide-python-bundle.json",
      "./worker/pyodide-python-bundle.json",
    ];

    for (const bundlePath of bundlePaths) {
      try {
        console.log(`Trying to load bundle from: ${bundlePath}`);
        const response = await fetch(bundlePath);
        if (response.ok) {
          const content = await response.text();

          // Check if we got HTML instead of JSON
          if (isHtmlContent(content)) {
            console.warn(`Got HTML content instead of JSON from ${bundlePath}`);
            continue;
          }

          const bundle: PythonBundle = JSON.parse(content);
          if (bundle[filename]) {
            console.log(
              `Successfully loaded ${filename} from bundle at ${bundlePath}`
            );
            return bundle[filename];
          } else {
            throw new Error(`File ${filename} not found in bundle`);
          }
        }
      } catch (error) {
        console.warn(`Failed to load bundle from ${bundlePath}:`, error);
      }
    }

    throw new Error(
      `Failed to load ${filename} from bundle - all bundle paths failed`
    );
  } catch (error) {
    console.error(`Bundle fallback failed for ${filename}:`, error);
    throw error;
  }
}

/**
 * Load and combine multiple Python files in the correct order
 */
export async function loadPythonBridge(): Promise<string> {
  const files = [
    "desktop_api.py",
    "desktop_api_legacy.py",
    "events.py",
    "mcp_protocol.py",
    "comlink_helpers.py",
    "bridge_init.py",
  ];

  try {
    const codes = await Promise.all(files.map((file) => loadPythonCode(file)));
    return codes.join("\n\n");
  } catch (error) {
    console.error("Error loading Python bridge files:", error);
    throw error;
  }
}

/**
 * Load Comlink enhancement code
 */
export async function loadComlinkHelpers(): Promise<string> {
  return loadPythonCode("comlink_helpers.py");
}

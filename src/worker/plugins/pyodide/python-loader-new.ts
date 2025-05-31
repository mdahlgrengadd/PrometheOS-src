/**
 * Python code loader utilities for the Pyodide plugin
 */

// Cache for the Python bundle
let pythonBundle: Record<string, string> | null = null;

/**
 * Load Python bundle as fallback
 */
async function loadPythonBundle(): Promise<Record<string, string>> {
  if (pythonBundle) return pythonBundle;

  try {
    const response = await fetch("/worker/pyodide-python-bundle.json");
    if (response.ok) {
      pythonBundle = await response.json();
      console.log("Loaded Python bundle successfully");
      return pythonBundle;
    }
  } catch (error) {
    console.warn("Failed to load Python bundle:", error);
  }

  return {};
}

/**
 * Load Python code from a file path relative to the plugin directory
 */
export async function loadPythonCode(filename: string): Promise<string> {
  try {
    // Try to load from individual files first
    const possiblePaths = [
      `/worker/pyodide/python/${filename}`,
      `/public/worker/pyodide/python/${filename}`,
      `./worker/pyodide/python/${filename}`,
      `/src/worker/plugins/pyodide/python/${filename}`,
    ];

    let lastError: Error | null = null;

    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load Python file from: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          const content = await response.text();
          // Check if we got HTML instead of Python (common server misconfiguration)
          if (
            !content.includes("<!DOCTYPE html>") &&
            !content.includes("<html>")
          ) {
            console.log(`Successfully loaded Python file from: ${path}`);
            return content;
          }
        }
        lastError = new Error(
          `Failed to load ${filename} from ${path}: ${response.statusText}`
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    // Fallback to bundle
    console.log(`Falling back to Python bundle for: ${filename}`);
    const bundle = await loadPythonBundle();
    if (bundle[filename]) {
      console.log(`Successfully loaded ${filename} from Python bundle`);
      return bundle[filename];
    }

    throw (
      lastError ||
      new Error(`Failed to load ${filename} from all sources including bundle`)
    );
  } catch (error) {
    console.error(`Error loading Python file ${filename}:`, error);
    throw error;
  }
}

/**
 * Load and combine multiple Python files in the correct order
 */
export async function loadPythonBridge(): Promise<string> {
  try {
    // Load all component files
    const [desktopApi, desktopApiLegacy, events, mcpProtocol, bridgeInit] =
      await Promise.all([
        loadPythonCode("desktop_api.py"),
        loadPythonCode("desktop_api_legacy.py"),
        loadPythonCode("events.py"),
        loadPythonCode("mcp_protocol.py"),
        loadPythonCode("bridge_init.py"),
      ]); // Combine them in the correct order with proper imports at the top
    return `
import js
from pyodide.ffi import create_proxy, to_js, JsProxy
import json
import uuid

print("Starting Hybrid Desktop API bridge setup...")

# First define the legacy API classes
${desktopApiLegacy}

# Then the main API that references legacy as fallback
${desktopApi}

# Then events that reference both APIs
${events}

# Then MCP protocol
${mcpProtocol}

# Now fix the references after all classes are defined
# Update Events.subscribe to use DesktopAPI
Events.subscribe = lambda event_name, callback: DesktopAPI.subscribe_event(event_name, callback)

# Update EventsLegacy.subscribe to use DesktopAPILegacy  
EventsLegacy.subscribe = lambda event_name, callback: DesktopAPILegacy.subscribe_event(event_name, callback)

# Finally the initialization that creates instances
${bridgeInit}
`;
  } catch (error) {
    console.error("Error loading Python bridge:", error);
    throw error;
  }
}

/**
 * Load Comlink enhancement code
 */
export async function loadComlinkHelpers(): Promise<string> {
  return loadPythonCode("comlink_helpers.py");
}

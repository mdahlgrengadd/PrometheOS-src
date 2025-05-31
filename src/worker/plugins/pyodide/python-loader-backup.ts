/**
 * Python code loader utilities for the Pyodide plugin
 */

/**
 * Load Python code from a file path relative to the plugin directory
 */
export async function loadPythonCode(filename: string): Promise<string> {
  try {
    // Try multiple possible paths, starting with the most likely to work
    const possiblePaths = [
      // Production path (files copied to public/worker/)
      `/worker/pyodide/python/${filename}`,
      // Development path from public root
      `/public/worker/pyodide/python/${filename}`,
      // Alternative production path with base
      `./worker/pyodide/python/${filename}`,
      // Development source path
      `/src/worker/plugins/pyodide/python/${filename}`,
      // Relative to current worker location
      `./pyodide/python/${filename}`,
      `../pyodide/python/${filename}`
    ];
    
    let lastError: Error | null = null;
    
    for (const path of possiblePaths) {
      try {
        console.log(`Trying to load Python file from: ${path}`);
        const response = await fetch(path);
        if (response.ok) {
          console.log(`Successfully loaded Python file from: ${path}`);
          return await response.text();
        }
        lastError = new Error(`Failed to load ${filename} from ${path}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }
    
    throw lastError || new Error(`Failed to load ${filename} from all attempted paths`);
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
    const [
      desktopApi,
      desktopApiLegacy,
      events,
      mcpProtocol,
      bridgeInit
    ] = await Promise.all([
      loadPythonCode('desktop_api.py'),
      loadPythonCode('desktop_api_legacy.py'),
      loadPythonCode('events.py'),
      loadPythonCode('mcp_protocol.py'),
      loadPythonCode('bridge_init.py')
    ]);    // Combine them in the correct order with proper imports at the top
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
    console.error('Error loading Python bridge:', error);
    throw error;
  }
}

/**
 * Load Comlink enhancement code
 */
export async function loadComlinkHelpers(): Promise<string> {
  return loadPythonCode('comlink_helpers.py');
}

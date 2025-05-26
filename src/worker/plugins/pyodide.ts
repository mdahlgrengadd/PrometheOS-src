/**
 * Pyodide Worker Plugin - Python runtime in Web Worker
 * Follows the established worker plugin pattern from webllm.ts
 */

import { WorkerPlugin } from "../../plugins/types";

// Interface for Python execution results
export interface PythonResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout?: string;
}

// Interface for progress updates during Pyodide loading
export interface PyodideProgress {
  phase: "initializing" | "downloading" | "extracting" | "ready";
  message: string;
  progress?: number;
}

// Pyodide interface (we'll load it dynamically)
interface PyodideInterface {
  runPython(code: string): unknown;
  loadPackage(packages: string | string[]): Promise<void>;
  globals: {
    get(name: string): unknown;
    set(name: string, value: unknown): void;
  };
  FS: {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(
      path: string,
      options?: { encoding?: string }
    ): string | Uint8Array;
  };
}

declare global {
  interface Window {
    loadPyodide?: (options?: {
      indexURL?: string;
    }) => Promise<PyodideInterface>;
  }
}

/**
 * Pyodide plugin implementation for worker
 */
const PyodideWorker: WorkerPlugin = {
  id: "pyodide",

  // Private state
  _pyodide: null as PyodideInterface | null,
  _isLoading: false,
  _progress: null as PyodideProgress | null,
  /**
   * Initialize Pyodide with progress tracking
   */
  async initPyodide(): Promise<{ status: string; message?: string }> {
    if (this._pyodide) {
      return { status: "success", message: "Pyodide already initialized" };
    }

    if (this._isLoading) {
      return {
        status: "loading",
        message: "Pyodide initialization in progress",
      };
    }

    try {
      this._isLoading = true;
      this._progress = {
        phase: "initializing",
        message: "Starting Pyodide initialization...",
      };

      console.log("Loading Pyodide from CDN...");
      this._progress = {
        phase: "downloading",
        message: "Downloading Pyodide runtime...",
      }; // Load Pyodide using fetch (ES module compatible)
      console.log("Loading Pyodide via fetch...");

      // Fetch and evaluate the Pyodide script
      const response = await fetch(
        "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch Pyodide: ${response.statusText}`);
      }

      const pyodideCode = await response.text();

      // Execute the code in the global scope
      // This is the ES module equivalent of importScripts
      const func = new Function(pyodideCode);
      func.call(globalThis);

      // Now loadPyodide should be available
      const globalScope = globalThis as unknown as {
        loadPyodide?: (options?: {
          indexURL?: string;
        }) => Promise<PyodideInterface>;
      };

      const loadPyodide = globalScope.loadPyodide;
      if (!loadPyodide) {
        throw new Error(
          "Failed to load Pyodide - loadPyodide function not available"
        );
      }

      this._pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        // stdout: (text: string) => console.log("Python stdout:", text),
        // stderr: (text: string) => console.error("Python stderr:", text),
      });

      this._progress = {
        phase: "extracting",
        message: "Installing base packages...",
      };

      // Install essential packages
      await this._pyodide.loadPackage(["micropip"]);

      // Inject Desktop API bridge
      await this._setupDesktopApiBridge();

      this._progress = {
        phase: "ready",
        message: "Pyodide ready for Python execution",
      };
      this._isLoading = false;

      console.log("Pyodide initialized successfully");
      return { status: "success", message: "Pyodide initialized" };
    } catch (error) {
      this._isLoading = false;
      this._progress = null;
      console.error("Failed to initialize Pyodide:", error);
      return {
        status: "error",
        message: `Failed to initialize Pyodide: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },
  /**
   * Setup the Desktop API bridge in Python context
   */  async _setupDesktopApiBridge(): Promise<void> {
    if (!this._pyodide) throw new Error("Pyodide not initialized");
    
    console.log("Setting up Desktop API bridge...");
    
    try {
      // Inject the desktop module into Python namespace
      const desktopApiCode = `
import js
from pyodide.ffi import create_proxy, to_js
import json
import uuid

print("Starting Desktop API bridge setup...")

class DesktopAPI:
    """Python interface to Desktop Dreamscape APIs"""
    
    @staticmethod
    def list_components():
        """List all available API components"""
        try:
            from js import postMessage
            request_id = str(uuid.uuid4())
            
            # Convert Python dict to JS object using to_js
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'list_components'
            })
              # Send request to main thread via postMessage
            postMessage(message)
            
            print(f"API request sent: list_components")
            return {'success': True, 'message': 'Request sent to main thread'}
            
        except Exception as e:
            print(f"Error listing components: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod 
    def execute(component_id, action, params=None):
        """Execute an action on a component"""
        try:
            if params is None:
                params = {}
                
            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())
            
            # Convert Python dict to JS object using to_js, with proper nested conversion
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'execute_action',
                'params': to_js({
                    'componentId': component_id,
                    'action': action,
                    'params': to_js(params)
                })
            })
            
            # Send request to main thread via postMessage
            postMessage(message)
            
            print(f"Sent API request: {component_id}.{action}")
            return {'success': True, 'message': 'Request sent to main thread'}
            
        except Exception as e:
            print(f"Error executing {component_id}.{action}: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def subscribe_event(event_name, callback):
        """Subscribe to EventBus events"""
        try:
            proxy_callback = create_proxy(callback)
            
            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())
            
            # Store callback for later use
            if not hasattr(DesktopAPI, '_event_callbacks'):
                DesktopAPI._event_callbacks = {}
            DesktopAPI._event_callbacks[event_name] = proxy_callback            # Send subscription request via postMessage
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'subscribe_event',
                'params': to_js({
                    'eventName': event_name
                })
            })
            postMessage(message)
            
            def unsubscribe():
                if hasattr(DesktopAPI, '_event_callbacks') and event_name in DesktopAPI._event_callbacks:
                    del DesktopAPI._event_callbacks[event_name]
                    # Could send unsubscribe message here if needed
            
            return unsubscribe
            
        except Exception as e:
            print(f"Error subscribing to event {event_name}: {e}")
            return lambda: None

class Events:
    """EventBus integration"""
    
    @staticmethod
    def emit(event_name, data=None):
        """Emit an event to the desktop EventBus"""
        try:
            from js import postMessage
            import uuid
            request_id = str(uuid.uuid4())
            
            message = to_js({
                'type': 'desktop-api-request',
                'requestId': request_id,
                'method': 'emit_event',
                'params': to_js({
                    'eventName': event_name,
                    'data': to_js(data) if data is not None else None
                })
            })
            postMessage(message)
            
            return {'success': True, 'message': f'Event {event_name} emitted'}
            
        except Exception as e:
            print(f"Error emitting event {event_name}: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def subscribe(event_name, callback):
        """Subscribe to desktop events"""
        return DesktopAPI.subscribe_event(event_name, callback)

# Create the desktop module structure
class Desktop:
    api = DesktopAPI()
    events = Events()

# Make it available globally
desktop = Desktop()

# Set up message handling for responses from main thread
def handle_desktop_api_response(message):
    """Handle responses from the main thread API"""
    try:
        if message.get('type') == 'desktop-api-response':
            print(f"Received API response: {message}")
            # Could store results in a promise-like structure here
            
        elif message.get('type') == 'desktop-api-event':
            # Handle event notifications
            event_name = message.get('eventName')
            data = message.get('data')
            
            if hasattr(DesktopAPI, '_event_callbacks') and event_name in DesktopAPI._event_callbacks:
                callback = DesktopAPI._event_callbacks[event_name]
                callback(data)
                
    except Exception as e:
        print(f"Error handling API response: {e}")

print("Desktop API Bridge initialized in Python context")
`;

      await this._pyodide.runPython(desktopApiCode);
      console.log("Desktop API bridge setup completed successfully");
      
    } catch (error) {
      console.error("Failed to setup Desktop API bridge:", error);
      throw error;
    }
  },

  /**
   * Execute Python code and return result
   */
  async executePython(
    code: string,
    returnStdout: boolean = false
  ): Promise<PythonResult> {
    if (!this._pyodide) {
      return {
        success: false,
        error: "Pyodide not initialized. Call initPyodide() first.",
      };
    }

    try {
      let stdout = "";

      if (returnStdout) {
        // Capture stdout
        await this._pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
sys.stdout = _stdout_capture
`);
      }

      // Execute the user code
      const result = await this._pyodide.runPython(code);

      if (returnStdout) {
        // Get captured stdout
        stdout = await this._pyodide.runPython(`
_stdout_capture.getvalue()
`);

        // Restore stdout
        await this._pyodide.runPython(`
sys.stdout = sys.__stdout__
`);
      }

      return {
        success: true,
        result: result,
        stdout: returnStdout ? stdout : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Install Python packages using micropip
   */
  async installPackage(packageName: string): Promise<PythonResult> {
    if (!this._pyodide) {
      return {
        success: false,
        error: "Pyodide not initialized",
      };
    }

    try {
      await this._pyodide.runPython(`
import micropip
await micropip.install('${packageName}')
`);

      return {
        success: true,
        result: `Package ${packageName} installed successfully`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to install ${packageName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },

  /**
   * Get current initialization progress
   */
  getProgress(): PyodideProgress | null {
    return this._progress;
  },

  /**
   * Check if Pyodide is ready
   */
  isReady(): boolean {
    return this._pyodide !== null && !this._isLoading;
  },

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this._pyodide) {
      // Pyodide doesn't have explicit cleanup, but we can clear references
      this._pyodide = null;
      this._progress = null;
      console.log("Pyodide worker cleaned up");
    }
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(method: string, params?: Record<string, unknown>): unknown {
    switch (method) {
      case "initPyodide":
        return this.initPyodide();

      case "executePython":
        if (typeof params?.code !== "string") {
          return {
            success: false,
            error: "executePython requires 'code' parameter",
          };
        }
        return this.executePython(params.code, Boolean(params.returnStdout));

      case "installPackage":
        if (typeof params?.packageName !== "string") {
          return {
            success: false,
            error: "installPackage requires 'packageName' parameter",
          };
        }
        return this.installPackage(params.packageName);
      case "getProgress":
        return this.getProgress();

      case "isReady":
        return this.isReady();

      case "cleanup":
        return this.cleanup();

      case "handleDesktopApiRequest":
        if (
          typeof params?.method !== "string" ||
          typeof params?.requestId !== "string"
        ) {
          return {
            success: false,
            error:
              "handleDesktopApiRequest requires 'method' and 'requestId' parameters",
          };
        }
        return this.handleDesktopApiRequest(
          params.method,
          params.requestId,
          params.params as Record<string, unknown>
        );

      default:
        return { success: false, error: `Unknown method: ${method}` };
    }
  },

  /**
   * Handle desktop API requests from Python
   */
  async handleDesktopApiRequest(
    method: string,
    requestId: string,
    params?: Record<string, unknown>
  ): Promise<PythonResult> {
    try {
      switch (method) {
        case "list_components": {
          // Send message to main thread to request component list
          // For now, return a placeholder response
          console.log("Python requested component list");
          return {
            success: true,
            result: {
              type: "desktop-api-response",
              requestId,
              method,
              result: [],
            },
          };
        }

        case "execute_action": {
          const { componentId, action, params: actionParams } = params || {};
          console.log(
            `Python requested action: ${componentId}.${action}`,
            actionParams
          );
          return {
            success: true,
            result: {
              type: "desktop-api-response",
              requestId,
              method,
              result: {
                success: true,
                message: `Action ${action} on ${componentId} executed`,
              },
            },
          };
        }

        case "subscribe_event": {
          const { eventName } = params || {};
          console.log(`Python ${method}: ${eventName}`);
          return {
            success: true,
            result: {
              type: "desktop-api-response",
              requestId,
              method,
              result: { success: true, message: `Subscribed to ${eventName}` },
            },
          };
        }

        case "emit_event": {
          const { eventName, data } = params || {};
          console.log(`Python emitting event: ${eventName}`, data);
          return {
            success: true,
            result: {
              type: "desktop-api-response",
              requestId,
              method,
              result: { success: true, message: `Event ${eventName} emitted` },
            },
          };
        }

        default:
          return {
            success: false,
            error: `Unknown desktop API method: ${method}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};

// Export the pyodide plugin instance as default
export default PyodideWorker;

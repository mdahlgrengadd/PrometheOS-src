/**
 * Desktop API Bridge - Connects Pyodide Python to Desktop API System
 * This runs in the main thread and communicates with the Pyodide worker
 */

import { eventBus } from "../core/EventBus";

export interface DesktopApiBridge {
  listComponents(): string[];
  execute(
    componentId: string,
    action: string,
    params?: Record<string, unknown>
  ): Promise<unknown>;
  subscribeEvent(
    eventName: string,
    callback: (data: unknown) => void
  ): () => void;
  emitEvent(eventName: string, data?: unknown): void;
}

/**
 * Creates a bridge object that can be injected into Pyodide worker
 * This provides Python access to the Desktop API system
 */
export function createDesktopApiBridge(): DesktopApiBridge {
  return {
    /**
     * List all available API components
     */
    listComponents(): string[] {
      try {
        // Access the global API context if available
        const apiContext = (globalThis as Record<string, any>)
          .desktop_api_context;
        if (apiContext && apiContext.getComponents) {
          const components = apiContext.getComponents();
          return components.map((c: any) => c.id);
        }
        return [];
      } catch (error) {
        console.error("Error listing API components:", error);
        return [];
      }
    },

    /**
     * Execute an action on a component
     */
    async execute(
      componentId: string,
      action: string,
      params?: Record<string, unknown>
    ): Promise<unknown> {
      try {
        // Access the global API context if available
        const apiContext = (globalThis as Record<string, any>)
          .desktop_api_context;
        if (apiContext && apiContext.executeAction) {
          const result = await apiContext.executeAction(
            componentId,
            action,
            params
          );
          return result;
        }
        throw new Error("API context not available");
      } catch (error) {
        console.error(`Error executing ${componentId}.${action}:`, error);
        throw error;
      }
    },

    /**
     * Subscribe to EventBus events
     */
    subscribeEvent(
      eventName: string,
      callback: (data: unknown) => void
    ): () => void {
      const unsubscribe = eventBus.subscribe(eventName, callback);
      return unsubscribe;
    },

    /**
     * Emit an event to the EventBus
     */
    emitEvent(eventName: string, data?: unknown): void {
      eventBus.emit(eventName, data);
    },
  };
}

/**
 * Setup the global bridge for Pyodide workers
 * This should be called during app initialization
 */
export function setupGlobalDesktopApiBridge(): void {
  const bridge = createDesktopApiBridge();

  // Make it available globally for worker access
  (globalThis as Record<string, unknown>).desktop_api_bridge = bridge;

  console.log("Desktop API Bridge initialized for Pyodide workers");
}

/**
 * Store the API context globally so the bridge can access it
 * This should be called when the API context is available
 */
export function setGlobalApiContext(apiContext: unknown): void {
  (globalThis as Record<string, unknown>).desktop_api_context = apiContext;
}

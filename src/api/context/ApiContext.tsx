import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useRef, useState
} from 'react';

import { eventBus } from '../../plugins/EventBus';
import { setGlobalApiContext, setupGlobalHybridApiBridge } from '../bridges/HybridDesktopApiBridge';
import { IActionResult, IApiComponent, IApiContextValue, IOpenApiSpec } from '../core/types';
import { registerLauncherApi } from '../system/registerSystemApi';
import { generateOpenApiSpec } from '../utils/openapi';

// Create the API context with null default value
const ApiContext = createContext<IApiContextValue | null>(null);

/**
 * API Provider component
 * Provides the API context to the application
 */
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State to store registered components
  const [components, setComponents] = useState<Record<string, IApiComponent>>(
    {}
  );

  // Action handlers registry
  const actionHandlersRef = useRef<
    Record<
      string,
      Record<
        string,
        (params?: Record<string, unknown>) => Promise<IActionResult>
      >
    >
  >({});

  /**
   * Register a component in the API
   * @param component The component to register
   */
  const registerComponent = (component: IApiComponent) => {
    console.log(`Registering component: ${component.id} (${component.type})`);
    setComponents((prev) => ({
      ...prev,
      [component.id]: component,
    }));

    // Emit event for component registration
    eventBus.emit("api:component:registered", component);

    // Auto-register new component as MCP tool if MCP is available
    const workerManager = (
      window as unknown as {
        workerPluginManager?: {
          autoRegisterMCPTools?: (
            components: Array<{
              id: string;
              actions: Array<{
                name: string;
                description: string;
                parameters?: Record<
                  string,
                  { type: string; description?: string; required?: boolean }
                >;
              }>;
            }>
          ) => Promise<{
            status: string;
            registered: number;
            errors: string[];
          }>;
        };
      }
    ).workerPluginManager;

    if (workerManager?.autoRegisterMCPTools) {
      setTimeout(async () => {
        try {
          // Convert component to MCP tool format
          const mcpComponent = {
            id: component.id,
            actions: component.actions.map((action) => ({
              name: action.id,  // Use action.id for consistency
              description: action.description,
              parameters: action.parameters?.reduce(
                (params, param) => ({
                  ...params,
                  [param.name]: {
                    type: param.type,
                    description: param.description,
                    required: param.required,
                  },
                }),
                {}
              ),
            })),
          };

          const registerResult = await workerManager.autoRegisterMCPTools([mcpComponent]);
          console.log(`Auto-registered MCP tool for ${component.id}:`, registerResult);
        } catch (error) {
          console.error(`Failed to auto-register MCP tool for ${component.id}:`, error);
        }
      }, 100); // Small delay to ensure component is fully registered
    }
  };
  /**
   * Unregister a component from the API
   * @param id The ID of the component to unregister
   */
  const unregisterComponent = (id: string) => {
    console.log(`Unregistering component: ${id}`);
    setComponents((prev) => {
      const newComponents = { ...prev };
      delete newComponents[id];
      return newComponents;
    });

    // Clean up action handlers
    const handlers = actionHandlersRef.current;
    if (handlers[id]) {
      delete handlers[id];
    }

    // Emit event for component unregistration
    eventBus.emit("api:component:unregistered", id);
  };

  /**
   * Update a component's state in the API
   * @param id The ID of the component to update
   * @param state The new state of the component
   */
  const updateComponentState = (
    id: string,
    state: Partial<IApiComponent["state"]>
  ) => {
    console.log(`Updating component state: ${id}`, state);
    setComponents((prev) => {
      if (!prev[id]) return prev;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          state: {
            ...prev[id].state,
            ...state,
          },
        },
      };
    });

    // Emit event for state update
    eventBus.emit("api:component:stateChanged", { id, state });
  };

  /**
   * Register an action handler for a component
   * @param componentId The ID of the component
   * @param actionId The ID of the action
   * @param handler The handler function for the action
   */
  const registerActionHandler = (
    componentId: string,
    actionId: string,
    handler: (params?: Record<string, unknown>) => Promise<IActionResult>
  ) => {
    console.log(`Registering action handler: ${componentId}.${actionId}`);
    const handlers = actionHandlersRef.current;

    if (!handlers[componentId]) {
      handlers[componentId] = {};
    }

    handlers[componentId][actionId] = handler;
  };

  /**
   * Execute an action on a component
   * @param componentId The ID of the component
   * @param actionId The ID of the action
   * @param parameters The parameters for the action
   * @returns The result of the action
   */
  const executeAction = async (
    componentId: string,
    actionId: string,
    parameters?: Record<string, unknown>
  ): Promise<IActionResult> => {
    console.log(
      `[API] Executing action: ${componentId}.${actionId}`,
      parameters
    );
    const handlers = actionHandlersRef.current;

    // Handle case where componentId might have @src suffix
    const normalizedId = componentId.endsWith("@src")
      ? componentId.substring(0, componentId.length - 4)
      : componentId;

    const alternateId = !componentId.endsWith("@src")
      ? `${componentId}@src`
      : componentId;

    // Check if we have handlers for either the original or normalized ID
    if (
      (!handlers[componentId] || !handlers[componentId][actionId]) &&
      (!handlers[normalizedId] || !handlers[normalizedId][actionId]) &&
      (!handlers[alternateId] || !handlers[alternateId][actionId])
    ) {
      // Log all registered components and actions for debugging
      console.error(
        `[API] No handler registered for action ${actionId} on component ${componentId}`
      );
      console.log(`[API] Registered components:`, Object.keys(handlers));

      if (Object.keys(handlers).length > 0) {
        // Find similar component IDs for better error messages
        const similarIds = Object.keys(handlers).filter(
          (id) =>
            id.includes(componentId) ||
            id.includes(normalizedId) ||
            componentId.includes(id) ||
            normalizedId.includes(id)
        );

        if (similarIds.length > 0) {
          console.log(
            `[API] Similar component IDs found: ${similarIds.join(", ")}`
          );
          console.log(
            `[API] Actions for similar components:`,
            similarIds.map((id) => ({
              id,
              actions: handlers[id] ? Object.keys(handlers[id]) : [],
            }))
          );
        }
      }

      const error = `No handler registered for action ${actionId} on component ${componentId}`;
      return {
        success: false,
        error,
      };
    }

    // Determine which handler to use
    const handlerComponentId =
      handlers[componentId] && handlers[componentId][actionId]
        ? componentId
        : handlers[normalizedId] && handlers[normalizedId][actionId]
        ? normalizedId
        : alternateId;

    try {
      // Emit event before action execution
      eventBus.emit("api:action:executing", {
        componentId: handlerComponentId,
        actionId,
        parameters,
      });

      // Execute the action handler
      console.log(`[API] Using handler for ${handlerComponentId}.${actionId}`);
      const result = await handlers[handlerComponentId][actionId](parameters);

      // Emit event after successful action execution
      eventBus.emit("api:action:executed", {
        componentId,
        actionId,
        parameters,
        result,
      });

      return result;
    } catch (error) {
      // Emit event for action execution error
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      eventBus.emit("api:action:failed", {
        componentId,
        actionId,
        parameters,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  };
  /**
   * Get all registered components
   * @returns Array of all registered components
   */
  const getComponents = useCallback(
    () => Object.values(components),
    [components]
  );

  /**
   * Generate OpenAPI documentation
   * @returns OpenAPI specification
   */
  const getOpenApiSpec = useCallback((): IOpenApiSpec => {
    return generateOpenApiSpec(getComponents());
  }, [getComponents]);

  // Expose methods for registering action handlers
  useEffect(() => {
    console.log("Setting up API action handler registration");
    // Make registerActionHandler available globally through eventBus
    const unsubscribe = eventBus.subscribe(
      "api:registerActionHandler",
      ({
        componentId,
        actionId,
        handler,
      }: {
        componentId: string;
        actionId: string;
        handler: (params?: Record<string, unknown>) => Promise<IActionResult>;
      }) => {
        registerActionHandler(componentId, actionId, handler);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  // Register system API components
  useEffect(() => {
    // Only run once on mount, don't use changing functions
    let mounted = true;

    const initApi = async () => {
      if (!mounted) return;

      // Create context with current function references
      const apiContext: IApiContextValue = {
        registerComponent,
        unregisterComponent,
        updateComponentState,
        executeAction,
        getComponents,
        getOpenApiSpec,
      };

      // Register the launcher API component and handler
      registerLauncherApi(apiContext);

      // Store API context globally for Desktop API Bridge
      setGlobalApiContext(apiContext);

      // Initialize the Hybrid Desktop API Bridge for Pyodide workers
      setupGlobalHybridApiBridge();

      // Tell the WorkerPluginManagerClient to setup Comlink
      const workerManager = (
        window as unknown as {
          workerPluginManager?: {
            setupComlinkBridge?: () => Promise<void>;
            initMCPServer?: () => Promise<{ status: string; message?: string }>;
            autoRegisterMCPTools?: (
              components: Array<{
                id: string;
                actions: Array<{
                  name: string;
                  description: string;
                  parameters?: Record<
                    string,
                    { type: string; description?: string; required?: boolean }
                  >;
                }>;
              }>
            ) => Promise<{
              status: string;
              registered: number;
              errors: string[];
            }>;
          };
        }
      ).workerPluginManager;

      if (workerManager) {
        try {
          // Setup Comlink bridge
          await workerManager.setupComlinkBridge();

          // Initialize MCP server
          const mcpInitResult = await workerManager.initMCPServer?.();
          console.log("MCP server initialized:", mcpInitResult);

          // Auto-register API components as MCP tools
          if (
            mcpInitResult?.status === "success" &&
            workerManager.autoRegisterMCPTools
          ) {
            // Convert API components to the format expected by autoRegisterMCPTools
            const components = getComponents().map((component) => ({
              id: component.id,
              actions: component.actions.map((action) => ({
                name: action.id,
                description: action.description,
                parameters: action.parameters?.reduce(
                  (acc, param) => ({
                    ...acc,
                    [param.name]: {
                      type: param.type,
                      description: param.description,
                      required: param.required,
                    },
                  }),
                  {}
                ),
              })),
            }));

            // Register the tools
            const registerResult = await workerManager.autoRegisterMCPTools(
              components
            );
            console.log("Auto-registered MCP tools:", registerResult);
          }
        } catch (error) {
          console.error("Failed to setup API integration:", error);
        }
      }
    };

    initApi();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - only run on mount, ignore deps to prevent infinite loop

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue: IApiContextValue = useMemo(
    () => ({
      registerComponent,
      unregisterComponent,
      updateComponentState,
      executeAction,
      getComponents,
      getOpenApiSpec,
    }),
    [getComponents, getOpenApiSpec]
  );

  // Update the global API context whenever it changes so Comlink bridge sees latest components
  useEffect(() => {
    setGlobalApiContext(contextValue);
  }, [contextValue]);

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};

/**
 * Hook to use the API context
 * @returns The API context value
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

/**
 * Register an action handler for a component
 * @param componentId The ID of the component
 * @param actionId The ID of the action
 * @param handler The handler function for the action
 */
export const registerApiActionHandler = (
  componentId: string,
  actionId: string,
  handler: (params?: Record<string, unknown>) => Promise<IActionResult>
) => {
  eventBus.emit("api:registerActionHandler", {
    componentId,
    actionId,
    handler,
  });
};

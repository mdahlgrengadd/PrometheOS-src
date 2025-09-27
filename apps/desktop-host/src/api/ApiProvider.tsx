// API Provider - Preserves sophisticated integration architecture
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Import existing API system (to be moved to host)
import { IApiComponent, IActionResult } from '../types/api';
import { eventBus } from '../plugins/EventBus';

interface IApiContextValue {
  registerComponent: (component: IApiComponent) => void;
  unregisterComponent: (id: string) => void;
  updateComponentState: (id: string, state: Partial<IApiComponent['state']>) => void;
  executeAction: (componentId: string, actionId: string, parameters?: Record<string, unknown>) => Promise<IActionResult>;
  getComponents: () => IApiComponent[];
}

interface IHostApiBridge {
  executeAction: (componentId: string, actionId: string, parameters?: Record<string, unknown>) => Promise<IActionResult>;
  registerRemoteComponent: (remoteId: string, component: IApiComponent) => Promise<void>;
  subscribeEvent: (eventName: string, callback: (data: unknown) => void) => Promise<() => void>;
  emitEvent: (eventName: string, data?: unknown) => Promise<void>;
}

const ApiContext = createContext<IApiContextValue | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Record<string, IApiComponent>>({});
  const actionHandlersRef = useRef<Record<string, Record<string, (params?: Record<string, unknown>) => Promise<IActionResult>>>>({});

  // Register component (preserving existing functionality)
  const registerComponent = (component: IApiComponent) => {
    console.log(`[API Provider] Registering component: ${component.id} (${component.type})`);
    setComponents(prev => ({
      ...prev,
      [component.id]: component,
    }));

    // Emit event for component registration
    eventBus.emit('api:component:registered', component);

    // Auto-register as MCP tool (preserving existing behavior)
    const workerManager = (window as any).workerPluginManager;
    if (workerManager?.autoRegisterMCPTools) {
      setTimeout(async () => {
        try {
          const mcpComponent = {
            id: component.id,
            actions: component.actions.map(action => ({
              name: action.id,
              description: action.description,
              parameters: action.parameters?.reduce((params, param) => ({
                ...params,
                [param.name]: {
                  type: param.type,
                  description: param.description,
                  required: param.required,
                },
              }), {}),
            })),
          };

          const registerResult = await workerManager.autoRegisterMCPTools([mcpComponent]);
          console.log(`[API Provider] Auto-registered MCP tool for ${component.id}:`, registerResult);
        } catch (error) {
          console.error(`[API Provider] Failed to auto-register MCP tool for ${component.id}:`, error);
        }
      }, 100);
    }
  };

  // Unregister component
  const unregisterComponent = (id: string) => {
    console.log(`[API Provider] Unregistering component: ${id}`);
    setComponents(prev => {
      const newComponents = { ...prev };
      delete newComponents[id];
      return newComponents;
    });

    // Clean up action handlers
    delete actionHandlersRef.current[id];

    // Emit event for component unregistration
    eventBus.emit('api:component:unregistered', id);
  };

  // Update component state
  const updateComponentState = (id: string, state: Partial<IApiComponent['state']>) => {
    setComponents(prev => {
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
    eventBus.emit('api:component:stateChanged', { id, state });
  };

  // Execute action (preserving existing functionality)
  const executeAction = async (
    componentId: string,
    actionId: string,
    parameters?: Record<string, unknown>
  ): Promise<IActionResult> => {
    console.log(`[API Provider] Executing action: ${componentId}.${actionId}`, parameters);

    const handlers = actionHandlersRef.current;
    const normalizedId = componentId.endsWith('@src')
      ? componentId.substring(0, componentId.length - 4)
      : componentId;

    if (!handlers[componentId]?.[actionId] && !handlers[normalizedId]?.[actionId]) {
      const error = `No handler registered for action ${actionId} on component ${componentId}`;
      console.error(`[API Provider] ${error}`);
      return { success: false, error };
    }

    const handlerComponentId = handlers[componentId]?.[actionId] ? componentId : normalizedId;

    try {
      eventBus.emit('api:action:executing', { componentId: handlerComponentId, actionId, parameters });

      const result = await handlers[handlerComponentId][actionId](parameters);

      eventBus.emit('api:action:executed', { componentId, actionId, parameters, result });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      eventBus.emit('api:action:failed', { componentId, actionId, parameters, error: errorMessage });

      return { success: false, error: errorMessage };
    }
  };

  // Get all components
  const getComponents = () => Object.values(components);

  // Register action handler
  const registerActionHandler = (
    componentId: string,
    actionId: string,
    handler: (params?: Record<string, unknown>) => Promise<IActionResult>
  ) => {
    console.log(`[API Provider] Registering action handler: ${componentId}.${actionId}`);

    if (!actionHandlersRef.current[componentId]) {
      actionHandlersRef.current[componentId] = {};
    }

    actionHandlersRef.current[componentId][actionId] = handler;
  };

  // Set up action handler registration via event bus
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(
      'api:registerActionHandler',
      ({ componentId, actionId, handler }: any) => {
        registerActionHandler(componentId, actionId, handler);
      }
    );
    return unsubscribe;
  }, []);

  // Create Host API Bridge for remotes
  useEffect(() => {
    const hostApiBridge: IHostApiBridge = {
      executeAction,

      async registerRemoteComponent(remoteId: string, component: IApiComponent) {
        // Add remote prefix to component ID to avoid conflicts
        const remoteComponent = {
          ...component,
          id: `${remoteId}.${component.id}`,
        };
        registerComponent(remoteComponent);
      },

      async subscribeEvent(eventName: string, callback: (data: unknown) => void) {
        return eventBus.subscribe(eventName, callback);
      },

      async emitEvent(eventName: string, data?: unknown) {
        eventBus.emit(eventName, data);
      },
    };

    // Expose API bridge globally for remotes
    (window as any).__HOST_API_BRIDGE__ = hostApiBridge;

    console.log('[API Provider] Host API Bridge exposed for remotes');
  }, [executeAction]);

  const contextValue: IApiContextValue = {
    registerComponent,
    unregisterComponent,
    updateComponentState,
    executeAction,
    getComponents,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): IApiContextValue => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
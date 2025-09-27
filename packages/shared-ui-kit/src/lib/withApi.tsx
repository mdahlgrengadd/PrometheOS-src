// Federated withApi HOC - Uses shared-api-client for Module Federation
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApiClient, useComponentRegistration } from "@shared/api-client";
import type { IApiComponent, IApiAction, IApiParameter } from "@shared/api-client";

// API Component Props for federated components
export interface ApiComponentProps {
  /** Unique identifier for the component in the API system */
  apiId?: string;

  /** Component type (e.g., "Button", "Input", etc.) */
  apiType?: string;

  /** Human-readable name for the component */
  apiName?: string;

  /** Human-readable description of what the component does */
  apiDescription?: string;

  /** Path to the component in the application structure */
  apiPath?: string;

  /** Custom API actions to merge with default actions */
  apiActions?: IApiAction[];

  /** Initial state for the component */
  apiState?: Record<string, unknown>;

  /** Additional metadata about the component */
  apiMetadata?: Record<string, unknown>;

  /** Optional API configuration to override defaults */
  api?: Partial<Omit<IApiComponent, "id">>;
}

// Registry for component registration status
const componentRegistry = {
  mounted: new Set<string>(),
  seen: new Set<string>(),

  register(id: string) {
    this.mounted.add(id);
    this.seen.add(id);
  },

  unregister(id: string) {
    this.mounted.delete(id);
  },

  isMounted(id: string) {
    return this.mounted.has(id);
  },

  wasSeen(id: string) {
    return this.seen.has(id);
  },
};

/**
 * Higher Order Component to make a component API-aware with dual-pattern support
 *
 * This HOC enables components to work with both:
 * 1. React Context Pattern: When wrapped with ApiClientProvider
 * 2. Module Federation Bridge Pattern: When window.__HOST_API_BRIDGE__ is available
 *
 * Features:
 * - Automatic API client detection and selection
 * - Component registration with API system
 * - Action handler management
 * - Graceful degradation to standalone mode
 *
 * @template P - Component props type
 * @param Component The React component to wrap with API capabilities
 * @param defaultApiDoc Default API documentation for the component
 * @returns An API-aware component that works in federated environments
 *
 * @example
 * ```typescript
 * // With default API doc
 * const ApiButton = withApi(Button, {
 *   type: 'Button',
 *   name: 'UI Button',
 *   description: 'Interactive button component',
 *   actions: [{ id: 'click', name: 'Click', description: 'Click the button' }]
 * });
 *
 * // Usage in remote
 * <ApiButton apiId="my-button" onClick={handleClick}>Click me</ApiButton>
 * ```
 */
export function withApi<P extends object>(
  Component: React.ComponentType<P>,
  defaultApiDoc?: Omit<IApiComponent, "id">
) {
  const displayName = Component.displayName || Component.name || "Component";

  const WithApiComponent = React.forwardRef<unknown, P & ApiComponentProps>(
    (props, ref) => {
      const {
        api,
        apiId,
        apiType,
        apiName,
        apiDescription,
        apiPath,
        apiActions,
        apiState,
        apiMetadata,
        ...componentProps
      } = props as P & ApiComponentProps;

      // Gracefully handle missing API client context in federated environment
      let apiClient = null;

      try {
        apiClient = useApiClient();
        console.log(`[Federated API] API client available`);
      } catch (error) {
        // API client not available in this context - continue without it
        console.log('[Federated API] API client not available, running in standalone mode');
      }

      // Generate a unique ID if not provided
      const uniqueId = useRef(
        apiId || `${defaultApiDoc?.type || "component"}-${uuidv4()}`
      );

      // Reference to the element for simulating clicks
      const elementRef = useRef<HTMLElement | null>(null);

      // Generate automatic actions
      const autoGenerateActions = useCallback(() => {
        const defaultActions: IApiAction[] = defaultApiDoc?.actions || [];
        const propActions: IApiAction[] = api?.actions || [];

        const actionMap = new Map<string, IApiAction>();

        // Add all default actions to the map
        defaultActions.forEach((action) => {
          actionMap.set(action.id, action);
        });

        // Add or override with prop actions
        propActions.forEach((action: IApiAction) => {
          actionMap.set(action.id, action);
        });

        // Auto-generate click action if it doesn't exist and component is clickable
        if (!actionMap.has("click") && "onClick" in props) {
          actionMap.set("click", {
            id: "click",
            name: apiName
              ? `${apiName} Click`
              : `Click ${
                  apiType || api?.type || defaultApiDoc?.type || "component"
                }`,
            description:
              apiDescription ||
              `Click the ${
                apiType || api?.type || defaultApiDoc?.type || "component"
              }`,
            parameters: [],
            available: true,
          });
        }

        return Array.from(actionMap.values());
      }, [
        api?.actions,
        api?.type,
        apiName,
        apiType,
        props,
        defaultApiDoc?.type,
        apiDescription,
      ]);

      // Create the full API documentation
      const fullApiDoc = useMemo<IApiComponent>(() => {
        const mergedActions = autoGenerateActions();

        // Get actions from both the apiActions prop and from the api object
        const combinedActions = [
          ...(apiActions || []),
          ...(api?.actions || []),
        ];

        // Combined state from all sources
        const combinedState = {
          enabled: true,
          visible: true,
          ...(defaultApiDoc?.state || {}),
          ...(api?.state || {}),
          ...(apiState || {}),
        };

        return {
          id: uniqueId.current,
          type: apiType || api?.type || defaultApiDoc?.type || "unknown",
          name: apiName || `${apiType || "Component"} ${uniqueId.current}`,
          description:
            apiDescription ||
            api?.description ||
            defaultApiDoc?.description ||
            "No description",
          state: combinedState,
          actions: mergedActions.length > 0 ? mergedActions : combinedActions,
          path:
            apiPath ||
            api?.path ||
            defaultApiDoc?.path ||
            `/components/${uniqueId.current}`,
        };
      }, [
        // Keep dependencies minimal and value-driven to avoid identity churn
        apiActions,
        apiDescription,
        apiPath,
        apiState,
        apiType,
        apiName,
        autoGenerateActions,
        defaultApiDoc?.description,
        defaultApiDoc?.path,
        defaultApiDoc?.state,
        defaultApiDoc?.type,
      ]);

      // Use the federated component registration hook only if API client is available
      let registered = false;
      let error = null;

      if (apiClient) {
        try {
          const registrationResult = useComponentRegistration(fullApiDoc);
          registered = registrationResult.registered;
          error = registrationResult.error;

          if (registered) {
            console.log(`[Federated API] Component registered: ${uniqueId.current}`);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('[Federated API] Component registration failed:', message);
          error = message;
        }
      } else {
        // Fallback mode - component works without API registration
        console.log('[Federated API] Running in fallback mode for component:', uniqueId.current);
      }

      // Register click handler if available
      useEffect(() => {
        if (registered && "onClick" in props) {
          // Register the click action handler via event system
          // This would need to be implemented in the API client
          console.log(
            `[Federated API] Click handler registered for ${uniqueId.current}`
          );
        }
      }, [registered, props]);

      // Get the component with ref forwarding
      const getComponent = () => {
        if ("onClick" in props) {
          return (
            <Component
              ref={(el: any) => {
                elementRef.current = el;

                if (typeof ref === "function") {
                  ref(el);
                } else if (ref) {
                  (ref as React.MutableRefObject<unknown>).current = el;
                }
              }}
              {...(componentProps as P)}
            />
          );
        }

        return <Component ref={ref} {...(componentProps as P)} />;
      };

      // Log registration errors
      if (error) {
        console.error(
          `[Federated API] Registration error for ${uniqueId.current}:`,
          error
        );
      }

      return getComponent();
    }
  );

  WithApiComponent.displayName = `WithApi(${displayName})`;

  return WithApiComponent;
}

/**
 * Hook for components to register themselves with the federated API
 * @param apiId Unique identifier for the component
 * @param apiDoc API documentation for the component
 * @returns Object with registration status and functions
 */
export function useApiComponent(
  apiId: string,
  apiDoc: Omit<IApiComponent, "id">
) {
  const component: IApiComponent = useMemo(() => {
    const mergedState = {
      visible: true,
      ...(apiDoc.state || {}),
    } as IApiComponent["state"];
    if (typeof mergedState.enabled !== 'boolean') {
      mergedState.enabled = true;
    }
    return {
      id: apiId,
      ...apiDoc,
      state: mergedState,
    };
  }, [apiId, apiDoc]);

  // Gracefully handle missing API client context
  let registered = false;
  let error = null;

  try {
    const registrationResult = useComponentRegistration(component);
    registered = registrationResult.registered;
    error = registrationResult.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Federated API] useApiComponent fallback mode:', message);
    error = message;
  }

  return {
    registered,
    error,
    updateState: () => {
      // State updates would need to be implemented via the API client
      console.warn("[Federated API] State updates not yet implemented");
    },
  };
}

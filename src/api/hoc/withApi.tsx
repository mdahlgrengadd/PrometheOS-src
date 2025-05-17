import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { eventBus } from "../../plugins/EventBus";
import { useApi } from "../context/ApiContext";
import { ApiComponentProps, IApiComponent } from "../core/types";

// Registry for component registration status, helps prevent duplicate work
// but allows proper unmounting and re-mounting
const componentRegistry = {
  // Track currently mounted components
  mounted: new Set<string>(),

  // Track components we've seen before (for debugging)
  seen: new Set<string>(),

  // Register a component as mounted
  register(id: string) {
    this.mounted.add(id);
    this.seen.add(id);
  },

  // Unregister a component when unmounted
  unregister(id: string) {
    this.mounted.delete(id);
  },

  // Check if a component is currently mounted
  isMounted(id: string) {
    return this.mounted.has(id);
  },

  // For debugging - has this component been seen before?
  wasSeen(id: string) {
    return this.seen.has(id);
  },
};

/**
 * Higher Order Component to make a component API-aware
 * This allows components to be discoverable and interactable by the AI agent
 * @param Component The component to wrap
 * @param defaultApiDoc Default API documentation for the component
 * @returns An API-aware component
 */
export function withApi<P extends object>(
  Component: React.ComponentType<P>,
  defaultApiDoc?: Omit<IApiComponent, "id">
) {
  // Create a display name for debugging
  const displayName = Component.displayName || Component.name || "Component";
  // Define the wrapped component
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
      const { registerComponent, unregisterComponent, updateComponentState } =
        useApi();

      // Generate a unique ID if not provided
      const uniqueId = useRef(
        apiId || `${defaultApiDoc?.type || "component"}-${uuidv4()}`
      );

      // Reference to the element for simulating clicks
      const elementRef = useRef<HTMLElement | null>(null); // Track registration status
      const isRegisteredRef = useRef(false);

      // Track the previous state to prevent redundant updates
      const prevStateRef = useRef<Record<string, unknown>>({});

      // Store the fullApiDoc in a ref to prevent it from triggering re-renders
      const fullApiDocRef = useRef<IApiComponent | null>(null); // Generate automatic click action for elements that can be clicked
      const autoGenerateActions = useCallback(() => {
        const defaultActions = defaultApiDoc?.actions || [];
        const propActions = api?.actions || [];

        // Create a map of actions by ID for faster lookup
        const actionMap = new Map();

        // Add all default actions to the map
        defaultActions.forEach((action) => {
          actionMap.set(action.id, action);
        });

        // Add or override with prop actions
        propActions.forEach((action) => {
          actionMap.set(action.id, action);
        }); // Auto-generate click action if it doesn't exist and component is clickable        // (Buttons, links, etc. typically have onClick handlers)
        if (!actionMap.has("click") && "onClick" in props) {
          actionMap.set("click", {
            id: "click",
            name: apiName ? `${apiName} Click` : `Click ${apiType || api?.type || defaultApiDoc?.type || "component"}`,
            description: apiDescription || 
              `Click the ${apiType || api?.type || defaultApiDoc?.type || "component"}`,
            parameters: [],
          });
        }return Array.from(actionMap.values());
      }, [api?.actions, api?.type, apiName, apiType, props, defaultApiDoc?.type]); // Create the full API documentation by merging defaults with props
      const fullApiDoc = useMemo<IApiComponent>(() => {
        const mergedActions = autoGenerateActions();

        // Get actions from both the apiActions prop and from the api object
        const combinedActions = [
          ...(apiActions || []),
          ...(api?.actions || []),
        ];

        // Combined state from all sources (priority: apiState > api.state > defaultApiDoc.state)
        const combinedState = {
          enabled: true,
          visible: true,
          ...(defaultApiDoc?.state || {}),
          ...(api?.state || {}),
          ...(apiState || {}),
        };

        // Combined metadata (priority: apiMetadata > api.metadata > defaultApiDoc.metadata)
        const combinedMetadata = {
          ...(defaultApiDoc?.metadata || {}),
          ...(api?.metadata || {}),
          ...(apiMetadata || {}),
          // Add name as metadata if provided
          ...(apiName ? { name: apiName } : {}),
        };        const doc = {
          id: uniqueId.current,
          type: apiType || api?.type || defaultApiDoc?.type || "unknown",
          name: apiName, // Add name directly to the component object
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
          metadata: combinedMetadata,
        };

        // Update the ref so we can use it in the effect without dependencies
        fullApiDocRef.current = doc;

        return doc;
      }, [
        api?.description,
        api?.metadata,
        api?.path,
        api?.state,
        api?.type,
        apiActions,
        apiDescription,
        apiMetadata,
        apiPath,
        apiState,
        apiType,
        autoGenerateActions,
        defaultApiDoc?.description,
        defaultApiDoc?.metadata,
        defaultApiDoc?.path,
        defaultApiDoc?.state,
        defaultApiDoc?.type,
      ]); // Register an automatic click handler
      const registerClickHandler = useCallback(() => {
        if (isRegisteredRef.current && "onClick" in props) {
          // Register the click action handler
          eventBus.emit("api:registerActionHandler", {
            componentId: uniqueId.current,
            actionId: "click",
            handler: async () => {
              // Simulate a click by calling the onClick handler directly
              if ("onClick" in props) {
                // Create a synthetic event object (simplified)
                // Cast to unknown first to avoid TS errors
                const syntheticEvent = {
                  preventDefault: () => {},
                  stopPropagation: () => {},
                  target: elementRef.current,
                  currentTarget: elementRef.current,
                } as unknown as React.MouseEvent<HTMLElement>;

                // Call the onClick handler with the synthetic event
                (props as any).onClick(syntheticEvent);

                // Or click the DOM element directly if we have a ref
                if (elementRef.current) {
                  elementRef.current.click();
                }

                return { success: true };
              }

              return { success: false, error: "Component is not clickable" };
            },
          });
        }
      }, [props]); // Setup component registration once on mount with cleanup on unmount
      // Using empty deps array to ensure this only runs on mount/unmount
      useEffect(() => {
        const id = uniqueId.current;
        const registerFn = registerComponent;
        const unregisterFn = unregisterComponent;
        const clickHandlerFn = registerClickHandler;

        // Only register if not already registered
        if (!isRegisteredRef.current && !componentRegistry.isMounted(id)) {
          const apiDoc = fullApiDocRef.current;

          if (apiDoc) {
            console.log(
              `[API] Registering component: ${id} (${apiDoc.type}) with ${apiDoc.actions.length} actions`
            );

            // Register the component with the API
            registerFn(apiDoc);

            // Mark as registered in our registry
            componentRegistry.register(id);
            isRegisteredRef.current = true;

            // Register click handler if available
            clickHandlerFn();
          }
        }

        // Return cleanup function - use captured variables to prevent closure issues
        return () => {
          if (isRegisteredRef.current) {
            console.log(`[API] Unregistering component: ${id}`);
            unregisterFn(id);
            componentRegistry.unregister(id);
            isRegisteredRef.current = false;
          }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []); // Empty deps = only run on mount/unmount

      // Handle state updates separately
      useEffect(() => {
        if (isRegisteredRef.current && api?.state) {
          // Check if state has actually changed before updating
          const hasStateChanged = Object.entries(api.state).some(
            ([key, value]) => {
              // If the property didn't exist before or has changed
              return (
                prevStateRef.current[key] === undefined ||
                prevStateRef.current[key] !== value
              );
            }
          );

          if (hasStateChanged) {
            console.log(
              `[API] State change detected for ${uniqueId.current}, updating`
            );
            updateComponentState(uniqueId.current, api.state);
            // Update the previous state reference
            prevStateRef.current = { ...api.state };
          }
        }
      }, [api?.state, updateComponentState]);

      // Get the component with ref forwarding
      // For DOM elements that can be clicked, store a ref to the element
      const getComponent = () => {
        if ("onClick" in props) {
          return (
            <Component
              ref={(el) => {
                // Store ref to the element for clicking
                elementRef.current = el;

                // Forward the ref if it exists
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

      return getComponent();
    }
  );

  // Set display name for debugging
  WithApiComponent.displayName = `WithApi(${displayName})`;

  return WithApiComponent;
}

/**
 * Hook for components to register themselves with the API
 * @param apiId Unique identifier for the component
 * @param apiDoc API documentation for the component
 * @returns Object with functions to update the component state
 */
export function useApiComponent(
  apiId: string,
  apiDoc: Omit<IApiComponent, "id">
) {
  const { registerComponent, unregisterComponent, updateComponentState } =
    useApi();

  // Track registration status
  const isRegisteredRef = useRef(false);
  // Track previous state to prevent redundant updates
  const prevStateRef = useRef<Record<string, unknown>>({});

  // Store the static component in a ref to prevent dependency issues
  const staticComponentRef = useRef<IApiComponent | null>(null);

  // Memoize the static component object (without mutable state)
  const staticComponent = useMemo(() => {
    // Create a copy of apiDoc without the state property
    const { state, ...staticApiDoc } = apiDoc;

    const component = {
      id: apiId,
      ...staticApiDoc,
      // Include only basic state properties that won't change
      state: {
        enabled: true,
        visible: true,
      },
    };

    // Update the ref for use in the effect
    staticComponentRef.current = component;

    return component;
  }, [apiId, apiDoc]);

  // Initialize previous state if available
  useEffect(() => {
    if (apiDoc.state) {
      prevStateRef.current = { ...apiDoc.state };
    }
  }, [apiDoc.state]); // Registration effect - register once and clean up on unmount
  // Using empty deps array to ensure this only runs on mount/unmount
  useEffect(() => {
    const id = apiId;
    const registerFn = registerComponent;
    const unregisterFn = unregisterComponent;

    // Only register if not already mounted
    if (!componentRegistry.isMounted(id)) {
      const component = staticComponentRef.current;

      if (component) {
        console.log(`[API] Registering component via hook: ${id}`);
        registerFn(component);
        componentRegistry.register(id);
        isRegisteredRef.current = true;
      }
    }

    // Return cleanup function for unmounting
    return () => {
      if (isRegisteredRef.current) {
        console.log(`[API] Unregistering component via hook: ${id}`);
        unregisterFn(id);
        componentRegistry.unregister(id);
        isRegisteredRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only run on mount/unmount

  // Handle state updates separately
  useEffect(() => {
    if (isRegisteredRef.current && apiDoc.state) {
      // Check if state has actually changed
      const hasStateChanged = Object.entries(apiDoc.state).some(
        ([key, value]) => {
          return (
            prevStateRef.current[key] === undefined ||
            prevStateRef.current[key] !== value
          );
        }
      );

      if (hasStateChanged) {
        updateComponentState(apiId, apiDoc.state);
        // Update previous state
        prevStateRef.current = { ...apiDoc.state };
      }
    }
  }, [apiId, apiDoc.state, updateComponentState]);

  // Return functions to update the component state
  return {
    updateState: (state: Partial<IApiComponent["state"]>) => {
      if (isRegisteredRef.current) {
        // Check if state has actually changed
        const hasStateChanged = Object.entries(state).some(([key, value]) => {
          return (
            prevStateRef.current[key] === undefined ||
            prevStateRef.current[key] !== value
          );
        });

        if (hasStateChanged) {
          updateComponentState(apiId, state);
          // Update previous state
          prevStateRef.current = { ...prevStateRef.current, ...state };
        }
      }
    },
  };
}

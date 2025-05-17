import React, { useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { useApi } from "../context/ApiContext";
import { ApiComponentProps, IApiComponent } from "../core/types";

// keep track of registered component IDs to prevent duplicate registration
const registeredComponents = new Set<string>();

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
      const { api, apiId, ...componentProps } = props as P & ApiComponentProps;
      const { registerComponent, unregisterComponent, updateComponentState } =
        useApi();

      // Generate a unique ID if not provided
      const uniqueId = useRef(
        apiId || `${defaultApiDoc?.type || "component"}-${uuidv4()}`
      );

      // generate uniqueId ref above

      // Track whether component has been registered
      const isRegisteredRef = useRef(false);

      // Track if this is the initial mount
      const initialMountRef = useRef(true);

      // Track the previous state to prevent redundant updates
      const prevStateRef = useRef<Record<string, unknown>>({});

      // Create the full API documentation by merging defaults with props
      const fullApiDoc = useMemo<IApiComponent>(() => {
        // Deduplicate actions by ID
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
        });

        // Convert the map back to an array
        const mergedActions = Array.from(actionMap.values());

        const doc = {
          id: uniqueId.current,
          type: api?.type || defaultApiDoc?.type || "unknown",
          description:
            api?.description || defaultApiDoc?.description || "No description",
          state: {
            enabled: true,
            visible: true,
            ...defaultApiDoc?.state,
            ...api?.state,
          },
          actions: mergedActions,
          path:
            api?.path ||
            defaultApiDoc?.path ||
            `/components/${uniqueId.current}`,
          metadata: {
            ...defaultApiDoc?.metadata,
            ...api?.metadata,
          },
        };

        return doc;
      }, [api, defaultApiDoc]);

      // Create the static API documentation (without mutable state)
      const staticApiDoc = useMemo<IApiComponent>(() => {
        return {
          id: uniqueId.current,
          type: fullApiDoc.type,
          description: fullApiDoc.description,
          actions: fullApiDoc.actions,
          path: fullApiDoc.path,
          metadata: fullApiDoc.metadata,
          // Default values only, not user state
          state: {
            enabled: true,
            visible: true,
          },
        };
      }, [
        fullApiDoc.type,
        fullApiDoc.description,
        fullApiDoc.actions,
        fullApiDoc.path,
        fullApiDoc.metadata,
      ]);

      // Combined register effect for React StrictMode compatibility
      // Only registers once on mount with static doc (no dynamic state)
      useEffect(() => {
        const id = uniqueId.current;
        if (!isRegisteredRef.current && !registeredComponents.has(id)) {
          console.log(
            `[API] Registering component: ${id} with ${staticApiDoc.actions.length} actions`
          );
          registerComponent(staticApiDoc);
          registeredComponents.add(id);
          isRegisteredRef.current = true;
        }
        // keep registered across unmounts
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // Handle state updates separately - don't re-register the component
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

      return <Component ref={ref} {...(componentProps as P)} />;
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

  // Memoize the static component object (without mutable state)
  const staticComponent = useMemo(() => {
    // Create a copy of apiDoc without the state property
    const { state, ...staticApiDoc } = apiDoc;

    return {
      id: apiId,
      ...staticApiDoc,
      // Include only basic state properties that won't change
      state: {
        enabled: true,
        visible: true,
      },
    };
  }, [
    apiId,
    apiDoc.type,
    apiDoc.description,
    apiDoc.actions,
    apiDoc.path,
    apiDoc.metadata,
  ]);

  // Initialize previous state if available
  useEffect(() => {
    if (apiDoc.state) {
      prevStateRef.current = { ...apiDoc.state };
    }
  }, [apiDoc.state]);

  // Registration effect - register once and persist (dedupe by ID)
  useEffect(() => {
    const id = apiId;
    if (registeredComponents.has(id)) {
      return;
    }
    registerComponent(staticComponent);
    registeredComponents.add(id);
    isRegisteredRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

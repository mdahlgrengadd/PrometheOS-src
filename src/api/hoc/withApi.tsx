import React, { useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useApi } from '../context/ApiContext';
import { ApiComponentProps, IApiComponent } from '../core/types';

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

      // Create the full API documentation by merging defaults with props
      const fullApiDoc = useMemo<IApiComponent>(() => {
        const doc = {
          id: uniqueId.current,
          type: defaultApiDoc?.type || "unknown",
          description:
            api?.description || defaultApiDoc?.description || "No description",
          state: {
            enabled: true,
            visible: true,
            ...defaultApiDoc?.state,
            ...api?.state,
          },
          actions: [...(defaultApiDoc?.actions || []), ...(api?.actions || [])],
          path:
            api?.path ||
            defaultApiDoc?.path ||
            `/components/${uniqueId.current}`,
          metadata: {
            ...defaultApiDoc?.metadata,
            ...api?.metadata,
          },
        };

        console.log(
          `[API] Creating API documentation for component ${uniqueId.current}`
        );
        console.log(
          `[API] Actions for ${uniqueId.current}:`,
          doc.actions.map((a) => a.id).join(", ")
        );

        return doc;
      }, [api, defaultApiDoc]);

      // Register the component when mounted
      useEffect(() => {
        console.log(
          `[API] Registering component: ${uniqueId.current} with ${fullApiDoc.actions.length} actions`
        );
        registerComponent(fullApiDoc);

        // Clean up on unmount
        return () => {
          console.log(`[API] Unregistering component: ${uniqueId.current}`);
          unregisterComponent(uniqueId.current);
        };
      }, [fullApiDoc, registerComponent, unregisterComponent]);

      // Update the component state when it changes
      useEffect(() => {
        if (api?.state) {
          updateComponentState(uniqueId.current, api.state);
        }
      }, [api?.state, uniqueId, updateComponentState]);

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

  // Register the component when mounted
  useEffect(() => {
    registerComponent({
      id: apiId,
      ...apiDoc,
    });

    // Clean up on unmount
    return () => {
      unregisterComponent(apiId);
    };
  }, [apiId, apiDoc, registerComponent, unregisterComponent]);

  // Return functions to update the component state
  return {
    updateState: (state: Partial<IApiComponent["state"]>) => {
      updateComponentState(apiId, state);
    },
  };
}

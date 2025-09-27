import React from "react";

import { useApiClient } from "@shared/api-client";
import type { IActionResult } from "@shared/api-client";

/**
 * Federated textarea handlers for API integration
 * Uses the shared API client instead of direct context access
 */
export function useTextareaHandlers(
  apiId: string,
  valueRef: React.MutableRefObject<string>,
  onChangeRef: React.MutableRefObject<
    (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  >
) {
  const apiClient = useApiClient();

  const handlers = React.useMemo(() => ({
    setValue: async (params?: Record<string, unknown>): Promise<IActionResult> => {
      if (!params || typeof params.value !== "string")
        return { success: false, error: "setValue requires 'value'" };

      const fakeEvt = {
        target: { value: params.value },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onChangeRef.current(fakeEvt);
      return { success: true, data: { value: params.value } };
    },

    getValue: async (): Promise<IActionResult> => ({
      success: true,
      data: { value: valueRef.current },
    }),

    clear: async (): Promise<IActionResult> => {
      const fakeEvt = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onChangeRef.current(fakeEvt);
      return { success: true };
    },

    appendText: async (params?: Record<string, unknown>): Promise<IActionResult> => {
      if (!params || typeof params.text !== "string")
        return { success: false, error: "appendText requires 'text'" };

      const newVal = valueRef.current + params.text;
      const fakeEvt = {
        target: { value: newVal },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      onChangeRef.current(fakeEvt);
      return { success: true, data: { value: newVal } };
    },
  }), [valueRef, onChangeRef]);

  // Register handlers with the federated API client via event bus
  React.useEffect(() => {
    const eventBus = (window as any).eventBus || (window as any).__HOST_API_BRIDGE__?.eventBus;

    if (!eventBus) {
      console.warn(`[Federated API] No event bus available for registering handlers for ${apiId}`);
      return;
    }

    // Register each handler via event bus
    const handlersToRegister = [
      { actionId: 'setValue', handler: handlers.setValue },
      { actionId: 'getValue', handler: handlers.getValue },
      { actionId: 'clear', handler: handlers.clear },
      { actionId: 'appendText', handler: handlers.appendText },
    ];

    handlersToRegister.forEach(({ actionId, handler }) => {
      eventBus.emit('api:registerActionHandler', {
        componentId: apiId,
        actionId,
        handler,
      });
      console.log(`[Federated API] Registered handler: ${apiId}.${actionId}`);
    });

    console.log(`[Federated API] All textarea handlers registered for ${apiId}`);

    // Return cleanup function
    return () => {
      console.log(`[Federated API] Cleaning up textarea handlers for ${apiId}`);
      // Note: In a full implementation, we'd unregister handlers here
    };
  }, [apiId, handlers.setValue, handlers.getValue, handlers.clear, handlers.appendText]);

  return handlers;
}

/**
 * Legacy compatibility function for direct handler registration
 * @deprecated Use useTextareaHandlers hook instead in federated environment
 */
export function registerTextareaHandlers(
  apiId: string,
  valueRef: React.MutableRefObject<string>,
  onChangeRef: React.MutableRefObject<
    (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  >
) {
  console.warn(
    `[Federated API] registerTextareaHandlers is deprecated. Use useTextareaHandlers hook instead for ${apiId}`
  );

  // For now, return a no-op cleanup function
  return () => {
    console.log(`[Federated API] Legacy cleanup for ${apiId}`);
  };
}

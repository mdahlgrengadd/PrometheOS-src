import React from "react";

import { useApiClient } from "../../../shared-api-client/src/hooks";
import type { IActionResult } from "../../../shared-api-client/src/types";

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

  // Register handlers with the federated API client
  React.useEffect(() => {
    // Note: In the federated architecture, action handlers would be registered
    // as part of the component registration process rather than individually
    // This is a placeholder for the federated approach

    console.log(`[Federated API] Textarea handlers ready for ${apiId}`);

    // Return cleanup function
    return () => {
      console.log(`[Federated API] Cleaning up textarea handlers for ${apiId}`);
    };
  }, [apiId]);

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
import React from "react";

import { registerApiActionHandler } from "@/api/context/ApiContext";
import { IActionResult } from "@/api/core/types";

/**
 * Registers handlers for a textarea component
 */
export function registerTextareaHandlers(
  apiId: string,
  valueRef: React.MutableRefObject<string>,
  onChangeRef: React.MutableRefObject<
    (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  >
) {
  const setValueHandler = async (
    params?: Record<string, unknown>
  ): Promise<IActionResult> => {
    if (!params || typeof params.value !== "string")
      return { success: false, error: "setValue requires 'value'" };
    const fakeEvt = {
      target: { value: params.value },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChangeRef.current(fakeEvt);
    return { success: true, data: { value: params.value } };
  };

  const getValueHandler = async (): Promise<IActionResult> => ({
    success: true,
    data: { value: valueRef.current },
  });

  const clearHandler = async (): Promise<IActionResult> => {
    const fakeEvt = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChangeRef.current(fakeEvt);
    return { success: true };
  };

  const appendTextHandler = async (
    params?: Record<string, unknown>
  ): Promise<IActionResult> => {
    if (!params || typeof params.text !== "string")
      return { success: false, error: "appendText requires 'text'" };
    const newVal = valueRef.current + params.text;
    const fakeEvt = {
      target: { value: newVal },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChangeRef.current(fakeEvt);
    return { success: true, data: { value: newVal } };
  };

  registerApiActionHandler(apiId, "setValue", setValueHandler);
  registerApiActionHandler(apiId, "getValue", getValueHandler);
  registerApiActionHandler(apiId, "clear", clearHandler);
  registerApiActionHandler(apiId, "appendText", appendTextHandler);

  // Also register for source endpoint
  registerApiActionHandler(`${apiId}@src`, "setValue", setValueHandler);
  registerApiActionHandler(`${apiId}@src`, "getValue", getValueHandler);
  registerApiActionHandler(`${apiId}@src`, "clear", clearHandler);
  registerApiActionHandler(`${apiId}@src`, "appendText", appendTextHandler);

  // Return cleanup function
  return () => {
    // Cleanup could be implemented here if needed
  };
}

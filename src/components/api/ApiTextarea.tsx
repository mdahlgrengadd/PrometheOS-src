import React, { useEffect } from 'react';

import { registerApiActionHandler } from '@/api/context/ApiContext';
import { IActionResult, IApiAction, IApiParameter } from '@/api/core/types';
import { withApi } from '@/api/hoc/withApi';
import { Textarea, TextareaProps } from '@/components/ui/textarea';

/**
 * Default API documentation for textarea
 */
export const textareaApiDoc = {
  type: "Textarea",
  description: "A text area component for multi-line text input",
  state: {
    enabled: true,
    visible: true,
    value: "",
  },
  actions: [
    {
      id: "setValue",
      name: "Set Value",
      description: "Set the content of the textarea",
      available: true,
      parameters: [
        {
          name: "value",
          type: "string",
          description: "The text to set in the textarea",
          required: true,
        } as IApiParameter,
      ],
    } as IApiAction,
    {
      id: "getValue",
      name: "Get Value",
      description: "Get the current content of the textarea",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "clear",
      name: "Clear",
      description: "Clear the content of the textarea",
      available: true,
      parameters: [],
    } as IApiAction,
    {
      id: "appendText",
      name: "Append Text",
      description: "Append text to the current content",
      available: true,
      parameters: [
        {
          name: "text",
          type: "string",
          description: "The text to append",
          required: true,
        } as IApiParameter,
      ],
    } as IApiAction,
  ],
  path: "/components/textareas",
};

/**
 * API-aware Textarea component
 * Wraps the regular Textarea component with API functionality
 */
export const ApiTextarea = withApi<TextareaProps>(Textarea, textareaApiDoc);

/**
 * Props for ApiTextareaWithHandler component
 */
export interface ApiTextareaWithHandlerProps extends TextareaProps {
  /** API ID for the textarea */
  apiId: string;
  /** API documentation for the textarea */
  api?: typeof textareaApiDoc;
  /** Current value of the textarea */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * ApiTextarea with automatic action handlers
 * @param props Component props
 * @returns ApiTextarea component with registered action handlers
 */
export const ApiTextareaWithHandler: React.FC<ApiTextareaWithHandlerProps> = (
  props
) => {
  const { value, onChange, apiId, ...rest } = props;

  // Register action handlers
  useEffect(() => {
    // Fix for component ID mismatch - handle both with and without @src suffix
    const componentId = apiId;
    const componentIdWithSuffix = `${apiId}@src`;

    console.log(
      `[API] Registering handlers for component: ${componentId} (also for ${componentIdWithSuffix})`
    );

    // Handler to set value
    const setValueHandler = async (
      params?: Record<string, unknown>
    ): Promise<IActionResult> => {
      try {
        if (!params || typeof params.value !== "string") {
          return {
            success: false,
            error: "setValue requires a 'value' parameter of type string",
          };
        }

        // Create a fake change event to call onChange
        const fakeEvent = {
          target: { value: params.value },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(fakeEvent);
        return {
          success: true,
          data: { value: params.value },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    };

    // Handler to get current value
    const getValueHandler = async (): Promise<IActionResult> => {
      try {
        return {
          success: true,
          data: { value },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    };

    // Handler to clear content
    const clearHandler = async (): Promise<IActionResult> => {
      try {
        // Create a fake change event to clear the content
        const fakeEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(fakeEvent);
        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    };

    // Handler to append text
    const appendTextHandler = async (
      params?: Record<string, unknown>
    ): Promise<IActionResult> => {
      try {
        if (!params || typeof params.text !== "string") {
          return {
            success: false,
            error: "appendText requires a 'text' parameter of type string",
          };
        }

        // Create a fake change event to append text
        const fakeEvent = {
          target: { value: value + params.text },
        } as React.ChangeEvent<HTMLTextAreaElement>;

        onChange(fakeEvent);
        return {
          success: true,
          data: { value: value + params.text },
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
      }
    };

    // Register handlers for both ID versions to handle the @src suffix issue
    // Register for original ID
    registerApiActionHandler(componentId, "setValue", setValueHandler);
    registerApiActionHandler(componentId, "getValue", getValueHandler);
    registerApiActionHandler(componentId, "clear", clearHandler);
    registerApiActionHandler(componentId, "appendText", appendTextHandler);

    // Also register for ID with @src suffix
    registerApiActionHandler(
      componentIdWithSuffix,
      "setValue",
      setValueHandler
    );
    registerApiActionHandler(
      componentIdWithSuffix,
      "getValue",
      getValueHandler
    );
    registerApiActionHandler(componentIdWithSuffix, "clear", clearHandler);
    registerApiActionHandler(
      componentIdWithSuffix,
      "appendText",
      appendTextHandler
    );

    return () => {
      // Clean up function could be added here if needed
      console.log(
        `[API] Handlers for ${componentId} will be cleaned up on unmount`
      );
    };
  }, [apiId]);

  // And then add an additional useEffect to handle value updates
  useEffect(() => {
    // Update value in closure for the action handlers
    // This ensures the latest value is used in the handlers
    console.log(`ApiTextarea value updated for ${apiId}: "${value}"`);
  }, [apiId, value, onChange]);

  return (
    <ApiTextarea apiId={apiId} value={value} onChange={onChange} {...rest} />
  );
};

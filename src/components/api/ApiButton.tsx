import React, { useEffect } from 'react';

import { registerApiActionHandler } from '@/api/context/ApiContext';
import { IActionResult, IApiAction } from '@/api/core/types';
import { withApi } from '@/api/hoc/withApi';
import { Button, ButtonProps } from '@/components/ui/button';

/**
 * Default API documentation for buttons
 */
const buttonApiDoc = {
  type: "Button",
  description: "A clickable button component",
  state: {
    enabled: true,
    visible: true,
  },
  actions: [
    {
      id: "click",
      name: "Click Button",
      description: "Simulate clicking the button",
      available: true,
      parameters: [],
    } as IApiAction,
  ],
  path: "/components/buttons",
};

/**
 * API-aware Button component
 * Wraps the regular Button component with API functionality
 */
export const ApiButton = withApi<ButtonProps>(Button, buttonApiDoc);

/**
 * Props for ApiButtonWithHandler component
 */
export interface ApiButtonWithHandlerProps extends ButtonProps {
  /** API ID for the button */
  apiId: string;
  /** API documentation for the button */
  api?: typeof buttonApiDoc;
}

/**
 * ApiButton with automatic click handler registration
 * @param props Component props
 * @returns ApiButton component with registered click handler
 */
export const ApiButtonWithHandler: React.FC<ApiButtonWithHandlerProps> = (
  props
) => {
  const { onClick, apiId, ...rest } = props;

  // Register the click action handler
  useEffect(() => {
    if (onClick) {
      const handler = async (): Promise<IActionResult> => {
        try {
          // TypeScript hack to allow calling onClick without a real event
          const fakeEvent = {} as React.MouseEvent<HTMLButtonElement>;
          onClick(fakeEvent);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };

      registerApiActionHandler(apiId, "click", handler);
    }
  }, [apiId, onClick]);

  return <ApiButton apiId={apiId} {...rest} onClick={onClick} />;
};

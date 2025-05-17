import React, { useEffect, useRef } from "react";
import { withApi } from "@/api/hoc/withApi";
import { registerApiActionHandler } from "@/api/context/ApiContext";
import { IActionResult, IApiAction } from "@/api/core/types";
import { Button as BaseButton, ButtonProps as BaseProps } from "@/components/ui/button";

// Default API documentation for Button
const buttonApiDoc = {
  type: "Button",
  description: "A clickable button component",
  state: { enabled: true, visible: true },
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

// HOC that injects API metadata
const ApiButton = withApi<BaseProps>(BaseButton, buttonApiDoc);

export interface ButtonProps extends BaseProps {
  /** Unique API identifier */
  apiId: string;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * API-enabled Button component
 * Registers click handler via API context
 */
export const Button: React.FC<ButtonProps> = ({ apiId, onClick, ...props }) => {
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (onClickRef.current) {
      const handler = async (): Promise<IActionResult> => {
        try {
          onClickRef.current && onClickRef.current({} as React.MouseEvent<HTMLButtonElement>);
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return { success: false, error: errorMessage };
        }
      };
      registerApiActionHandler(apiId, "click", handler);
    }
  }, [apiId]);

  return <ApiButton apiId={apiId} onClick={onClick} {...props} />;
};
Button.displayName = "Button";

// Lowercase alias for import convenience
export const button = Button;

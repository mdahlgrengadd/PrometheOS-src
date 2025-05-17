// filepath: c:\Users\mdahl\Documents\GitHub\draggable-desktop-dreamscape\src\components\ui\api\textarea.tsx
import * as React from "react";

import { withApi } from "@/api/hoc/withApi";
import {
  Textarea as BaseTextarea,
  TextareaProps as BaseProps,
} from "@/components/ui/textarea";

import { textareaApiActions, textareaApiDoc } from "./textarea-api";
import { registerTextareaHandlers } from "./textarea-handlers";

// Re-export for backward compatibility
export { textareaApiActions, textareaApiDoc } from "./textarea-api";

// Wrap base textarea with API metadata
const ApiTextarea = withApi<BaseProps>(BaseTextarea);

// Props for the API-enabled textarea
export interface TextareaProps extends BaseProps {
  /** unique API identifier */
  apiId: string;
  /** value */
  value: string;
  /** change handler */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Unified component: API HOC + action handlers
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ apiId, value, onChange, className, ...props }, ref) => {
    // keep refs to avoid re-registration
    const valueRef = React.useRef(value);
    React.useEffect(() => {
      valueRef.current = value;
    }, [value]);
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // register handlers once
    React.useEffect(() => {
      return registerTextareaHandlers(apiId, valueRef, onChangeRef);
    }, [apiId]);

    return (
      <ApiTextarea
        ref={ref}
        apiId={apiId}
        apiType="Textarea"
        apiDescription="A text area component for multi-line text input"
        apiPath="/components/textareas"
        apiActions={textareaApiActions}
        apiState={{
          enabled: true,
          visible: true,
          value,
        }}
        value={value}
        onChange={onChange}
        className={className}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

// Alias for lowercase import
export const textarea = Textarea;

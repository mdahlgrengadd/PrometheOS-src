import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { withApi } from "@/api/hoc/withApi";
import { registerApiActionHandler } from "@/api/context/ApiContext";
import { IActionResult, IApiAction, IApiParameter } from "@/api/core/types";
import { Textarea as BaseTextarea, TextareaProps as BaseProps } from "@/components/ui/textarea";

// API docs for textarea
export const textareaApiDoc = {
  type: "Textarea",
  description: "A text area component for multi-line text input",
  state: {
    enabled: true,
    visible: true,
    value: "",
  },
  actions: [
    { id: "setValue", name: "Set Value", description: "Set the content of the textarea", available: true, parameters: [{ name: "value", type: "string", description: "The text to set in the textarea", required: true } as IApiParameter] } as IApiAction,
    { id: "getValue", name: "Get Value", description: "Get the current content of the textarea", available: true, parameters: [] } as IApiAction,
    { id: "clear", name: "Clear", description: "Clear the content of the textarea", available: true, parameters: [] } as IApiAction,
    { id: "appendText", name: "Append Text", description: "Append text to the current content", available: true, parameters: [{ name: "text", type: "string", description: "The text to append", required: true } as IApiParameter] } as IApiAction,
  ],
  path: "/components/textareas",
};

// Wrap base textarea with API metadata
const ApiTextarea = withApi<BaseProps>(BaseTextarea, textareaApiDoc);

// Props for the API-enabled CVA textarea
export interface TextareaProps extends BaseProps {
  /** unique API identifier */
  apiId: string;
  /** value */
  value: string;
  /** change handler */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// Unified component: CVA styling + API HOC + action handlers
export const Textarea: React.FC<TextareaProps> = ({ apiId, value, onChange, className, ...props }) => {
  // keep refs to avoid re-registration
  const valueRef = React.useRef(value);
  React.useEffect(() => { valueRef.current = value; }, [value]);
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // register handlers once
  React.useEffect(() => {
    const setValueHandler = async (params?: Record<string, unknown>): Promise<IActionResult> => {
      if (!params || typeof params.value !== 'string') return { success: false, error: "setValue requires 'value'" };
      const fakeEvt = { target: { value: params.value } } as React.ChangeEvent<HTMLTextAreaElement>;
      onChangeRef.current(fakeEvt);
      return { success: true, data: { value: params.value } };
    };
    const getValueHandler = async (): Promise<IActionResult> => ({ success: true, data: { value: valueRef.current } });
    const clearHandler = async (): Promise<IActionResult> => {
      const fakeEvt = { target: { value: '' } } as React.ChangeEvent<HTMLTextAreaElement>;
      onChangeRef.current(fakeEvt);
      return { success: true };
    };
    const appendTextHandler = async (params?: Record<string, unknown>): Promise<IActionResult> => {
      if (!params || typeof params.text !== 'string') return { success: false, error: "appendText requires 'text'" };
      const newVal = valueRef.current + params.text;
      const fakeEvt = { target: { value: newVal } } as React.ChangeEvent<HTMLTextAreaElement>;
      onChangeRef.current(fakeEvt);
      return { success: true, data: { value: newVal } };
    };

    registerApiActionHandler(apiId, 'setValue', setValueHandler);
    registerApiActionHandler(apiId, 'getValue', getValueHandler);
    registerApiActionHandler(apiId, 'clear', clearHandler);
    registerApiActionHandler(apiId, 'appendText', appendTextHandler);
    registerApiActionHandler(`${apiId}@src`, 'setValue', setValueHandler);
    registerApiActionHandler(`${apiId}@src`, 'getValue', getValueHandler);
    registerApiActionHandler(`${apiId}@src`, 'clear', clearHandler);
    registerApiActionHandler(`${apiId}@src`, 'appendText', appendTextHandler);

    return () => {
      // optionally unregister
    };
  }, [apiId]);

  return (
    <ApiTextarea
      apiId={apiId}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
};
Textarea.displayName = 'Textarea';

// Alias for lowercase import
export const textarea = Textarea;

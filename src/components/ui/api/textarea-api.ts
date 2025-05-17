import { IApiAction, IApiParameter } from "@/api/core/types";

// Define API actions for textarea
export const textareaApiActions: IApiAction[] = [
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
  },
  {
    id: "getValue",
    name: "Get Value",
    description: "Get the current content of the textarea",
    available: true,
    parameters: [],
  },
  {
    id: "clear",
    name: "Clear",
    description: "Clear the content of the textarea",
    available: true,
    parameters: [],
  },
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
  },
];

// For backwards compatibility - will be deprecated
export const textareaApiDoc = {
  type: "Textarea",
  description: "A text area component for multi-line text input",
  state: {
    enabled: true,
    visible: true,
    value: "",
  },
  actions: textareaApiActions,
  path: "/components/textareas",
};

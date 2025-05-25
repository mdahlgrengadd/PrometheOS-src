import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { registerApiActionHandler } from "@/api/context/ApiContext";
import { useApiComponent } from "@/api/hoc/withApi";

import { IActionResult, IApiAction } from "../../../api/core/types";
import { textareaApiActions } from "./manifest";

// Define Notepad context shape
type NotepadCtx = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const Ctx = createContext<NotepadCtx | null>(null);
export const useNotepad = () => useContext(Ctx)!;

export const NotepadProvider: React.FC<{
  apiId: string;
  children: React.ReactNode;
}> = ({ apiId, children }) => {
  const [value, setValue] = useState<string>("");
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setValue(e.target.value);

  // Prepare static API doc
  const staticApiDoc = useMemo(
    () => ({
      type: "Textarea",
      description: "A text area component for multi-line text input",
      path: "/components/textareas",
      actions: textareaApiActions,
    }),
    []
  );

  // Hook into API component registry
  const { updateState } = useApiComponent(apiId, staticApiDoc);

  // Register API action handlers once
  const handlersRef = useRef(false);
  useEffect(() => {
    if (!handlersRef.current) {
      handlersRef.current = true;
      registerApiActionHandler(
        apiId,
        "setValue",
        async (params?: Record<string, unknown>): Promise<IActionResult> => {
          if (!params || typeof params.value !== "string") {
            return { success: false, error: "setValue requires 'value'" };
          }
          setValue(params.value);
          return { success: true, data: { value: params.value } };
        }
      );
      registerApiActionHandler(
        apiId,
        "getValue",
        async (): Promise<IActionResult> => {
          return { success: true, data: { value } };
        }
      );
      registerApiActionHandler(
        apiId,
        "clear",
        async (): Promise<IActionResult> => {
          setValue("");
          return { success: true };
        }
      );
      registerApiActionHandler(
        apiId,
        "appendText",
        async (params?: Record<string, unknown>): Promise<IActionResult> => {
          if (!params || typeof params.text !== "string") {
            return { success: false, error: "appendText requires 'text'" };
          }
          const newVal = value + params.text;
          setValue(newVal);
          return { success: true, data: { value: newVal } };
        }
      );
    }
  }, [apiId, value]);

  // Push state on changes
  useEffect(() => {
    updateState({ value });
  }, [value]);

  return (
    <Ctx.Provider value={{ value, onChange: handleChange }}>
      {children}
    </Ctx.Provider>
  );
};

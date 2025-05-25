import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { registerApiActionHandler } from "@/api/context/ApiContext";
import { IActionResult } from "@/api/core/types";
import { useApiComponent } from "@/api/hoc/withApi";
import { eventBus } from "@/plugins/EventBus";

import { webllmChatApiDoc } from "./manifest";

type WebLLMChatCtx = {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: (message?: string) => void;
  isDisabled: boolean;
  isTyping: boolean;
};

const Ctx = createContext<WebLLMChatCtx | null>(null);

export const WebLLMChatProvider: React.FC<
  WebLLMChatCtx & {
    apiId: string;
    children: React.ReactNode;
    exposeApi?: boolean;
  }
> = ({
  apiId,
  children,
  message,
  setMessage,
  sendMessage,
  isDisabled,
  isTyping,
  exposeApi = true,
}) => {
  const staticApiDoc = useMemo(() => {
    const { state, ...doc } = webllmChatApiDoc;
    return doc;
  }, []);

  // Only register the API doc if exposeApi is true
  const dummyApiDoc = {
    type: "none",
    description: "",
    actions: [],
    path: "",
    state: { enabled: false, visible: false },
  };

  const { updateState: realUpdateState } = useApiComponent(
    exposeApi ? apiId : `hidden-${apiId}`,
    exposeApi ? staticApiDoc : dummyApiDoc
  );

  // Store handlers in refs to maintain consistent references
  const handlersRef = useRef<{
    sendMessage: (params?: Record<string, unknown>) => Promise<IActionResult>;
    setInputText: (params?: Record<string, unknown>) => Promise<IActionResult>;
    getInputText: () => Promise<IActionResult>;
    clearInput: () => Promise<IActionResult>;
  } | null>(null);

  // Create persistent handler references
  const messageRef = useRef(message);
  const setMessageRef = useRef(setMessage);
  const sendMessageRef = useRef(sendMessage);

  // Update refs when props change
  useEffect(() => {
    messageRef.current = message;
    setMessageRef.current = setMessage;
    sendMessageRef.current = sendMessage;
  }, [message, setMessage, sendMessage]);

  // Initialize handlers only once
  useEffect(() => {
    if (!handlersRef.current) {
      // Create stable handler references
      handlersRef.current = {
        sendMessage: async (
          params?: Record<string, unknown>
        ): Promise<IActionResult> => {
          const messageToSend =
            (params?.message as string) || messageRef.current;
          if (messageToSend.trim()) {
            sendMessageRef.current(messageToSend);
          }
          return { success: true };
        },

        setInputText: async (
          params?: Record<string, unknown>
        ): Promise<IActionResult> => {
          if (!params || typeof params.text !== "string") {
            return { success: false, error: "setInputText requires 'text'" };
          }
          setMessageRef.current(params.text as string);
          return { success: true };
        },

        getInputText: async (): Promise<IActionResult> => {
          return { success: true, data: { text: messageRef.current } };
        },

        clearInput: async (): Promise<IActionResult> => {
          setMessageRef.current("");
          return { success: true };
        },
      };
    }
  }, []);

  // Track registered handlers for cleanup
  const registeredActionsRef = useRef<Array<{ id: string; action: string }>>(
    []
  );

  // Register/unregister API handlers
  useEffect(() => {
    // Only register handlers if exposeApi is true and we have handlers
    if (exposeApi && handlersRef.current) {
      const handlers = handlersRef.current;

      // Register actions with trackable IDs
      const handlerConfigs = [
        { action: "sendMessage", handler: handlers.sendMessage },
        { action: "setInputText", handler: handlers.setInputText },
        { action: "getInputText", handler: handlers.getInputText },
        { action: "clearInput", handler: handlers.clearInput },
      ];

      // Register all handlers
      handlerConfigs.forEach(({ action, handler }) => {
        registerApiActionHandler(apiId, action, handler);
        registeredActionsRef.current.push({ id: apiId, action });
        console.log(`[WebLLMChat] Registered ${apiId}.${action}`);
      });

      // On component unmount, unregister handlers via eventBus
      return () => {
        // Use the component unregistration event to clean up handlers
        eventBus.emit("api:component:unregistered", apiId);
        console.log(`[WebLLMChat] Cleanup: unregistered component ${apiId}`);
      };
    }
  }, [apiId, exposeApi]);

  // Update component state when values change
  useEffect(() => {
    if (exposeApi) {
      realUpdateState({ message, isDisabled, isTyping });
    }
  }, [exposeApi, message, isDisabled, isTyping, realUpdateState]);

  return (
    <Ctx.Provider
      value={{
        message,
        setMessage,
        sendMessage,
        isDisabled,
        isTyping,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export function useWebLLMChat() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error("useWebLLMChat must be used within a WebLLMChatProvider");
  return ctx;
}

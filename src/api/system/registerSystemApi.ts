import { toast as sonnerToast } from "sonner";

import { toast as radialToast } from "../../hooks/use-toast";
import { eventBus } from "../../plugins/EventBus";
import { registerApiActionHandler } from "../context/ApiContext";
import { IApiComponent, IApiContextValue } from "../core/types";

// Define the consolidated system API component
export const systemApiComponent: IApiComponent = {
  id: "sys",
  type: "System",
  name: "Services",
  description:
    "System-level operations including app management, notifications, dialogs, and events",
  path: "/api/sys",
  actions: [
    {
      id: "open",
      name: "Open Desktop Application",
      description: "Open an desktop app by its name",
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description: "The name of the app to launch",
          required: true,
        },
      ],
    },
    {
      id: "kill",
      name: "Close Desktop Applicaton",
      description: "Closes an app by its name",
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description: "The name of the app to close",
          required: true,
        },
      ],
    },
    {
      id: "notify",
      name: "Notify User",
      description: "Show a notification on screen",
      available: true,
      parameters: [
        {
          name: "message",
          type: "string",
          description: "The notification message to display",
          required: true,
        },
        {
          name: "type",
          type: "string",
          description: "Notification engine to use",
          required: false,
          enum: ["radix", "sonner"],
        },
      ],
    },
    {
      id: "dialog",
      name: "Open a System Dialog",
      description:
        "Opens a confirmation dialog and returns whether the user confirmed",
      available: true,
      parameters: [
        {
          name: "title",
          type: "string",
          description: "Dialog title",
          required: true,
        },
        {
          name: "description",
          type: "string",
          description: "Dialog description",
          required: false,
        },
        {
          name: "confirmLabel",
          type: "string",
          description: "Confirm button label",
          required: false,
        },
        {
          name: "cancelLabel",
          type: "string",
          description: "Cancel button label",
          required: false,
        },
      ],
    },
    {
      id: "events.waitFor",
      name: "Wait For Event",
      description:
        "Waits for the specified event to be emitted or until the timeout is reached",
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description: "The name of the event to wait for",
          required: true,
        },
        {
          name: "timeout",
          type: "number",
          description:
            "Timeout in milliseconds (optional, default is infinite)",
          required: false,
        },
      ],
    },
    {
      id: "events.list",
      name: "List Events",
      description: "Returns all known event names",
      available: true,
      parameters: [],
    },
  ],
  state: {
    enabled: true,
    visible: true,
  },
};

// Register the component and its action handler at startup
export function registerSystemApi(apiContext: IApiContextValue) {
  // Populate name parameter enum for UI dropdowns
  const nameParam = systemApiComponent.actions
    .find((action) => action.id === "events.waitFor")
    ?.parameters.find((p) => p.name === "name");
  if (nameParam) {
    nameParam.enum = eventBus.getEventNames();
  }

  // Register the consolidated component
  apiContext.registerComponent(systemApiComponent);
  // Register the action handler
  registerApiActionHandler("sys", "open", async (params) => {
    const { name } = params || {};

    if (!name) {
      return { success: false, error: "Missing app name" };
    }

    try {
      // Use eventBus to open the app - this is a pattern that works
      // regardless of whether we're in a React component context
      eventBus.emit("plugin:openWindow", name);

      return {
        success: true,
        data: { message: `App ${name} launched successfully` },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to launch app",
      };
    }
  });
  // Register killApp action handler
  registerApiActionHandler("sys", "kill", async (params) => {
    const { name } = params || {};

    if (!name) {
      return { success: false, error: "Missing app name" };
    }

    try {
      eventBus.emit("plugin:closeWindow", name);

      return {
        success: true,
        data: { message: `App ${name} closed successfully` },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to close app",
      };
    }
  });
  // Register notify action handler
  registerApiActionHandler("sys", "notify", async (params) => {
    const { message, type } = params || {};
    if (!message) {
      return { success: false, error: "Missing message" };
    }
    const messageStr = String(message);
    const engine = String(type || "radix").toLowerCase();
    try {
      if (engine === "sonner") {
        sonnerToast(messageStr);
      } else {
        radialToast({ title: messageStr });
      }
      return {
        success: true,
        data: { message: `Notification displayed: ${messageStr}`, engine },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to show notification",
      };
    }
  }); // Register openDialog action handler
  registerApiActionHandler("sys", "dialog", async (params) => {
    const { title, description, confirmLabel, cancelLabel } = params || {};
    return new Promise((resolve) => {
      // Emit an event to open the dialog; listener will invoke callback
      eventBus.emit(
        "api:openDialog",
        {
          title: String(title),
          description: String(description || ""),
          confirmLabel: String(confirmLabel || "OK"),
          cancelLabel: String(cancelLabel || "Cancel"),
        },
        (result: boolean) => {
          resolve({ success: true, data: { confirmed: result } });
        }
      );
    });
  });

  // Register waitForEvent action handler
  registerApiActionHandler("sys", "events.waitFor", async (params) => {
    // Validate parameters
    const nameRaw = params?.name;
    const timeout = params?.timeout;
    if (typeof nameRaw !== "string") {
      return { success: false, error: "Missing or invalid name" };
    }
    const eventName: string = nameRaw;
    return new Promise((resolve) => {
      let timerId: number | undefined;
      const unsubscribe = eventBus.subscribe(
        eventName,
        (...args: unknown[]) => {
          if (timerId !== undefined) clearTimeout(timerId);
          unsubscribe();
          // Extract payload
          const payload = args.length <= 1 ? args[0] : args;
          let resultData: unknown;
          // If payload is an object, attempt to unwrap single-property values
          if (
            payload !== null &&
            typeof payload === "object" &&
            !Array.isArray(payload)
          ) {
            const keys = Object.keys(payload as Record<string, unknown>);
            if (keys.length === 1) {
              resultData = (payload as Record<string, unknown>)[keys[0]];
            } else {
              resultData = payload;
            }
          } else {
            resultData = payload;
          }
          resolve({ success: true, data: resultData });
        }
      );
      if (typeof timeout === "number") {
        timerId = window.setTimeout(() => {
          unsubscribe();
          resolve({
            success: false,
            error: `Timeout of ${timeout}ms reached waiting for event ${eventName}`,
          });
        }, timeout);
      }
    });
  });

  // Register listEvents action handler
  registerApiActionHandler("sys", "events.list", async () => {
    return { success: true, data: eventBus.getEventNames() };
  });
}

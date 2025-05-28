import { toast as sonnerToast } from 'sonner';

import { toast as radialToast } from '../../hooks/use-toast';
import { eventBus } from '../../plugins/EventBus';
import { registerApiActionHandler } from '../context/ApiContext';
import { IApiComponent, IApiContextValue } from '../core/types';

// Define the consolidated services API component
export const servicesApiComponent: IApiComponent = {
  id: "services",
  type: "System",
  name: "Services",
  description: "System services for app management, notifications, dialogs, and events",
  path: "/api/services",
  actions: [
    {
      id: "launchApp",
      name: "Launch App",
      description: "Launch an app by its ID",
      available: true,
      parameters: [
        {
          name: "appId",
          type: "string",
          description: "The ID of the app to launch",
          required: true,
        },
      ],
    },
    {
      id: "killApp",
      name: "Kill App",
      description: "Closes an app by its ID",
      available: true,
      parameters: [
        {
          name: "appId",
          type: "string",
          description: "The ID of the app to close",
          required: true,
        },
      ],
    },
    {
      id: "notify",
      name: "Notify",
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
      id: "openDialog",
      name: "Open Dialog",
      description: "Opens a confirmation dialog and returns whether the user confirmed",
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
      id: "waitForEvent",
      name: "Wait For Event",
      description: "Waits for the specified event to be emitted or until the timeout is reached",
      available: true,
      parameters: [
        {
          name: "eventId",
          type: "string",
          description: "The name of the event to wait for",
          required: true,
        },
        {
          name: "timeout",
          type: "number",
          description: "Timeout in milliseconds (optional, default is infinite)",
          required: false,
        },
      ],
    },
    {
      id: "listEvents",
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

// Register the component and its action handlers at startup
export function registerSystemServicesApi(apiContext: IApiContextValue) {
  // Populate eventId parameter enum for UI dropdowns
  const waitForEventAction = servicesApiComponent.actions.find(
    (action) => action.id === "waitForEvent"
  );
  const eventIdParam = waitForEventAction?.parameters.find(
    (p) => p.name === "eventId"
  );
  if (eventIdParam) {
    eventIdParam.enum = eventBus.getEventNames();
  }

  // Register the consolidated services component
  apiContext.registerComponent(servicesApiComponent);

  // Register all action handlers under the "services" namespace
  
  // Launch App action handler
  registerApiActionHandler("services", "launchApp", async (params) => {
    const { appId } = params || {};

    if (!appId) {
      return { success: false, error: "Missing appId" };
    }

    try {
      // Use eventBus to open the app - this is a pattern that works
      // regardless of whether we're in a React component context
      eventBus.emit("plugin:openWindow", appId);

      return {
        success: true,
        data: { message: `App ${appId} launched successfully` },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to launch app",
      };
    }
  });

  // Kill App action handler
  registerApiActionHandler("services", "killApp", async (params) => {
    const { appId } = params || {};

    if (!appId) {
      return { success: false, error: "Missing appId" };
    }

    try {
      eventBus.emit("plugin:closeWindow", appId);

      return {
        success: true,
        data: { message: `App ${appId} closed successfully` },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to close app",
      };
    }
  });

  // Notify action handler
  registerApiActionHandler("services", "notify", async (params) => {
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
  });

  // Open Dialog action handler
  registerApiActionHandler("services", "openDialog", async (params) => {
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

  // Wait For Event action handler
  registerApiActionHandler("services", "waitForEvent", async (params) => {
    // Validate parameters
    const eventIdRaw = params?.eventId;
    const timeout = params?.timeout;
    if (typeof eventIdRaw !== "string") {
      return { success: false, error: "Missing or invalid eventId" };
    }
    const eventName: string = eventIdRaw;
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

  // List Events action handler
  registerApiActionHandler("services", "listEvents", async () => {
    return { success: true, data: eventBus.getEventNames() };
  });
}

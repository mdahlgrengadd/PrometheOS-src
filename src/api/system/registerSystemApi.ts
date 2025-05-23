import { toast as sonnerToast } from 'sonner';

import { toast as radialToast } from '../../hooks/use-toast';
import { eventBus } from '../../plugins/EventBus';
import { registerApiActionHandler } from '../context/ApiContext';
import { IApiComponent, IApiContextValue } from '../core/types';

// Define the launcher API component
export const launcherApiComponent: IApiComponent = {
  id: "launcher",
  type: "System",
  name: "Services",
  description: "Launches apps by ID or name",
  path: "/api/launcher",
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
  ],
  state: {
    enabled: true,
    visible: true,
  },
};

// Define the dialog API component
export const dialogApiComponent: IApiComponent = {
  id: "dialog",
  type: "System",
  name: "Dialog",
  description: "Open a confirmation dialog and return user choice",
  path: "/api/dialog",
  actions: [
    {
      id: "openDialog",
      name: "Open Dialog",
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
  ],
  state: { enabled: true, visible: true },
};

// Define the On Event API component
export const onEventApiComponent: IApiComponent = {
  id: "onEvent",
  type: "System",
  name: "On Event",
  description: "Wait for a specific event by ID or until timeout",
  path: "/api/onEvent",
  actions: [
    {
      id: "waitForEvent",
      name: "Wait For Event",
      description:
        "Waits for the specified event to be emitted or until the timeout is reached",
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
          description:
            "Timeout in milliseconds (optional, default is infinite)",
          required: false,
        },
      ],
    },
  ],
  state: { enabled: true, visible: true },
};

// Define the Event API component for listing registered event IDs
export const eventApiComponent: IApiComponent = {
  id: "event",
  type: "System",
  name: "Events",
  description: "List currently registered event IDs",
  path: "/api/event",
  actions: [
    {
      id: "listEvents",
      name: "List Events",
      description: "Returns all known event names",
      available: true,
      parameters: [],
    },
  ],
  state: { enabled: true, visible: true },
};

// Register the component and its action handler at startup
export function registerLauncherApi(apiContext: IApiContextValue) {
  // Register the component
  apiContext.registerComponent(launcherApiComponent);

  // Register the action handler
  registerApiActionHandler("launcher", "launchApp", async (params) => {
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

  // Register killApp action handler
  registerApiActionHandler("launcher", "killApp", async (params) => {
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

  // Register notify action handler
  registerApiActionHandler("launcher", "notify", async (params) => {
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

  // Register the dialog component and its handler
  apiContext.registerComponent(dialogApiComponent);
  registerApiActionHandler("dialog", "openDialog", async (params) => {
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

  // Populate eventId parameter enum for UI dropdowns
  const eventIdParam = onEventApiComponent.actions[0].parameters.find(
    (p) => p.name === "eventId"
  );
  if (eventIdParam) {
    eventIdParam.enum = eventBus.getEventNames();
  }
  apiContext.registerComponent(onEventApiComponent);
  registerApiActionHandler("onEvent", "waitForEvent", async (params) => {
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
          // Use the event payload: if only one argument, use it; otherwise include all args
          const resultData = args.length <= 1 ? args[0] : args;
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

  // Register Event listing API component and handler
  apiContext.registerComponent(eventApiComponent);
  registerApiActionHandler("event", "listEvents", async () => {
    return { success: true, data: eventBus.getEventNames() };
  });
}

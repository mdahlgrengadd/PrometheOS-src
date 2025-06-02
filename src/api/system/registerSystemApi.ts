import { toast as sonnerToast } from "sonner";

import { toast as radialToast } from "../../hooks/use-toast";
import { eventBus } from "../../plugins/EventBus";
import { registerApiActionHandler } from "../context/ApiContext";
import { IApiComponent, IApiContextValue } from "../core/types";

// Define the consolidated system API component
export const systemApiComponent: IApiComponent = {
  id: "sys",
  type: "System",
  name: "Desktop System Services",
  description: `# PromethOS System API

## Overview
The System API provides core desktop management functionality including application lifecycle management, user notifications, system dialogs, and event bus integration. This API follows JSON RPC 2.0 specification and is designed for use by MCP (Model Context Protocol) agents and other AI systems.

## Available Operations
- **Application Management**: Launch and terminate desktop applications
- **User Interface**: Display notifications and confirmation dialogs  
- **Event System**: Subscribe to and list system events
- **Initialization Support**: Launch applications with initialization data from various URL schemes

## Authentication
No authentication required for system operations.

## Rate Limiting
No rate limiting currently enforced.`,
  path: "/api/sys",
  actions: [
    {
      id: "open",
      name: "Open Desktop Application",
      description: `# Desktop Application Launcher

## Overview
Opens a desktop application by its identifier with optional initialization from string content.

## Parameters
- **name** (string, required): The application identifier to launch
- **initFromUrl** (string, optional): String content to initialize the application with

## Initialization Support
Applications that support initialization will use the provided string content to populate their initial state:
- **notepad**: Loads the string content into the text editor
- **browser**: Uses the string as initial page content or URL
- **media player**: Uses the string as file path or media URL

## JSON RPC2 Examples

### Open Audio Player to Play Music and Media Files
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "audioplayer"
  },
  "id": 1
}
\`\`\`

### Launch Notepad with Text Content, here we use a simple "Hello World!" string
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "notepad",
    "initFromUrl": "Hello World!"
  },
  "id": 2
}
\`\`\`

### Launch HybrIDE Code Editor with Code Content
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "hybride",
    "initFromUrl": "function greet(name) {\\n  return \`Hello, \${name}!\`;\\n}\\n\\nconsole.log(greet('World'));"
  },
  "id": 3
}
\`\`\`

### Launch Notepad with Markdown Content
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "notepad",
    "initFromUrl": "# Meeting Notes\\n\\n## Agenda\\n- Review project status\\n- Discuss next milestones\\n- Plan upcoming releases\\n\\n## Action Items\\n- [ ] Update documentation\\n- [ ] Test new features\\n- [ ] Prepare demo"
  },
  "id": 4
}
\`\`\`

### Launch Browser with URL
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "browser",
    "initFromUrl": "https://example.com"
  },
  "id": 5
}
\`\`\`

### Launch Notepad with JSON Content
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.open",
  "params": {
    "name": "notepad",
    "initFromUrl": "{\\n  \\"name\\": \\"John Doe\\",\\n  \\"email\\": \\"john@example.com\\",\\n  \\"projects\\": [\\n    \\"Web App\\",\\n    \\"Mobile App\\",\\n    \\"Desktop App\\"\\n  ]\\n}"
  },
  "id": 6
}
\`\`\`

## Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "message": "App notepad launched successfully"
    }
  },
  "id": 1
}
\`\`\``,
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description:
            "Application identifier to launch (e.g., 'notepad', 'calculator', 'browser')",
          required: true,
        },
        {
          name: "initFromUrl",
          type: "string",
          description:
            "Optional string content to initialize the application with (text, code, markdown, JSON, etc.)",
          required: false,
        },
      ],
    },
    {
      id: "kill",
      name: "Close Desktop Application",
      description: `# Desktop Application Terminator

## Overview
Forcefully closes a running desktop application by its identifier.

## Parameters
- **name** (string, required): The application identifier to close

## JSON RPC2 Examples

### Close Application
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.kill",
  "params": {
    "name": "notepad"
  },
  "id": 5
}
\`\`\`

## Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "message": "App notepad closed successfully"
    }
  },
  "id": 5
}
\`\`\``,
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description: "Application identifier to close (must match exactly)",
          required: true,
        },
      ],
    },
    {
      id: "notify",
      name: "User Notification System",
      description: `# User Notification Display

## Overview
Displays a notification message to the user using the specified notification engine.

## Parameters
- **message** (string, required): The notification message text
- **type** (string, optional): Notification engine to use (default: "radix")

## Supported Notification Types
- **radix**: Default notification system with toast messages
- **sonner**: Alternative notification system with different styling

## JSON RPC2 Examples

### Basic Notification (Default Engine)
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.notify",
  "params": {
    "message": "Task completed successfully"
  },
  "id": 6
}
\`\`\`

### Notification with Specific Engine
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.notify",
  "params": {
    "message": "Important system alert",
    "type": "sonner"
  },
  "id": 7
}
\`\`\`

## Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "message": "Notification displayed: Task completed successfully",
      "engine": "radix"
    }
  },
  "id": 6
}
\`\`\``,
      available: true,
      parameters: [
        {
          name: "message",
          type: "string",
          description: "The notification message text to display to the user",
          required: true,
        },
        {
          name: "type",
          type: "string",
          description: "Notification engine to use for display",
          required: false,
          enum: ["radix", "sonner"],
        },
      ],
    },
    {
      id: "dialog",
      name: "System Confirmation Dialog",
      description: `# System Dialog Interface

## Overview
Opens a modal confirmation dialog and returns the user's response. The dialog blocks execution until the user makes a choice.

## Parameters
- **title** (string, required): Dialog window title
- **description** (string, optional): Detailed description or question text
- **confirmLabel** (string, optional): Text for the confirmation button (default: "OK")
- **cancelLabel** (string, optional): Text for the cancellation button (default: "Cancel")

## JSON RPC2 Examples

### Basic Confirmation Dialog
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.dialog",
  "params": {
    "title": "Confirm Action",
    "description": "Are you sure you want to delete this file?"
  },
  "id": 8
}
\`\`\`

### Custom Button Labels
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.dialog",
  "params": {
    "title": "Save Changes",
    "description": "You have unsaved changes. What would you like to do?",
    "confirmLabel": "Save",
    "cancelLabel": "Discard"
  },
  "id": 9
}
\`\`\`

## Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "confirmed": true
    }
  },
  "id": 8
}
\`\`\``,
      available: true,
      parameters: [
        {
          name: "title",
          type: "string",
          description: "Dialog window title text",
          required: true,
        },
        {
          name: "description",
          type: "string",
          description: "Optional detailed description or question text",
          required: false,
        },
        {
          name: "confirmLabel",
          type: "string",
          description: "Text for the confirmation button (default: 'OK')",
          required: false,
        },
        {
          name: "cancelLabel",
          type: "string",
          description: "Text for the cancellation button (default: 'Cancel')",
          required: false,
        },
      ],
    },
    {
      id: "events.waitFor",
      name: "Event Subscription Waiter",
      description: `# Event System Waiter

## Overview
Waits for a specific event to be emitted on the system event bus or until a timeout is reached. This is useful for synchronizing operations with system events.

## Parameters
- **name** (string, required): The event name to wait for
- **timeout** (number, optional): Maximum wait time in milliseconds (default: infinite)

## JSON RPC2 Examples

### Wait for Event (No Timeout)
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.events.waitFor",
  "params": {
    "name": "window:opened"
  },
  "id": 10
}
\`\`\`

### Wait for Event with Timeout
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.events.waitFor",
  "params": {
    "name": "plugin:loaded",
    "timeout": 5000
  },
  "id": 11
}
\`\`\`

## Response Format (Success)
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": {
      "windowId": "notepad",
      "timestamp": 1640995200000
    }
  },
  "id": 10
}
\`\`\`

## Response Format (Timeout)
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": false,
    "error": "Timeout of 5000ms reached waiting for event plugin:loaded"
  },
  "id": 11
}
\`\`\``,
      available: true,
      parameters: [
        {
          name: "name",
          type: "string",
          description:
            "The event name to wait for (must be registered in the event bus)",
          required: true,
        },
        {
          name: "timeout",
          type: "number",
          description:
            "Maximum wait time in milliseconds (omit for infinite wait)",
          required: false,
        },
      ],
    },
    {
      id: "events.list",
      name: "Event Registry Lister",
      description: `# Event System Registry

## Overview
Returns a comprehensive list of all registered event names in the system event bus. This is useful for discovering available events for subscription or monitoring.

## Parameters
None required.

## JSON RPC2 Examples

### List All Events
\`\`\`json
{
  "jsonrpc": "2.0",
  "method": "sys.events.list",
  "params": {},
  "id": 12
}
\`\`\`

## Response Format
\`\`\`json
{
  "jsonrpc": "2.0",
  "result": {
    "success": true,
    "data": [
      "window:opened",
      "window:closed",
      "window:minimized",
      "window:maximized",
      "plugin:loaded",
      "plugin:unloaded",
      "api:openDialog",
      "webamp:trackChanged"
    ]
  },
  "id": 12
}
\`\`\``,
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
  apiContext.registerComponent(systemApiComponent); // Register the action handler
  registerApiActionHandler("sys", "open", async (params) => {
    const { name, initFromUrl } = params || {};

    if (!name) {
      return { success: false, error: "Missing app name" };
    }

    try {
      // Use eventBus to open the app - this is a pattern that works
      // regardless of whether we're in a React component context
      if (initFromUrl) {
        eventBus.emit("plugin:openWindow", { pluginId: name, initFromUrl });
      } else {
        eventBus.emit("plugin:openWindow", name);
      }

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

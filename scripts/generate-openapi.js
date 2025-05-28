// scripts/generate-openapi.js
import fs from "fs";

// Since we can't import TS files directly, let's define the components inline
const launcherApiComponent = {
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

const dialogApiComponent = {
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

const onEventApiComponent = {
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

const eventApiComponent = {
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

// Simple generateOpenApiSpec implementation
function generateOpenApiSpec(components) {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "PrometheOS API",
      description: "API for AI agent interaction with the PrometheOS",
      version: "1.0.0",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  components.forEach((component) => {
    component.actions.forEach((action) => {
      const actionPath = `/api/${component.id}/${action.id}`;

      const requestBody =
        action.parameters && action.parameters.length > 0
          ? {
              required: action.parameters.some((p) => p.required),
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: action.parameters.reduce(
                      (props, param) => ({
                        ...props,
                        [param.name]: {
                          type: param.type,
                          description: param.description,
                          ...(param.enum && { enum: param.enum }),
                        },
                      }),
                      {}
                    ),
                    required: action.parameters
                      .filter((p) => p.required)
                      .map((p) => p.name),
                  },
                },
              },
            }
          : undefined;

      spec.paths[actionPath] = {
        post: {
          summary: action.name,
          description: action.description,
          operationId: `${component.id}_${action.id}`,
          requestBody,
          responses: {
            200: {
              description: "Successful operation",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        description: "Whether the operation was successful",
                      },
                      data: {
                        type: "object",
                        description: "Result data from the operation",
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Error response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: false,
                        description: "Operation failed",
                      },
                      error: {
                        type: "string",
                        description: "Error message",
                      },
                    },
                  },
                },
              },
            },
          },
          tags: [component.type || "default"],
        },
      };
    });
  });

  return spec;
}

const components = [
  launcherApiComponent,
  dialogApiComponent,
  onEventApiComponent,
  eventApiComponent,
];

const spec = generateOpenApiSpec(components);
fs.writeFileSync("openapi.json", JSON.stringify(spec, null, 2));
console.log("📝 openapi.json generated");

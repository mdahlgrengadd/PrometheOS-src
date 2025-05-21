import { IApiComponent, IOpenApiSpec } from '../core/types';

/**
 * Generate an OpenAPI specification from the registered components
 * @param components Array of registered API components
 * @returns OpenAPI specification
 */
export const generateOpenApiSpec = (
  components: IApiComponent[]
): IOpenApiSpec => {
  // Start with the basic OpenAPI structure
  const spec: IOpenApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "Desktop Dreamscape API",
      description: "API for AI agent interaction with the Desktop Dreamscape",
      version: "1.0.0",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  // Generate paths for each component and action
  components.forEach((component) => {
    // Create a path for the component - make sure it starts with /api
    const basePath = `/api${component.path}`;

    // Add each action as an operation
    component.actions.forEach((action) => {
      // Create a simple path format that our interceptor can parse: /api/componentId/actionId
      const actionPath = `/api/${component.id}/${action.id}`;

      // Create request body from parameters
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

      // Add the operation
      spec.paths[actionPath] = {
        post: {
          summary: action.name,
          description: action.description,
          operationId: `${component.id}_${action.id}`,
          requestBody,
          responses: {
            "200": {
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
            "400": {
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

    // Add component schema
    const componentSchema = {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Unique identifier for the component",
        },
        type: {
          type: "string",
          description: "Type of component",
        },
        description: {
          type: "string",
          description: "Description of what the component does",
        },
        state: {
          type: "object",
          description: "Current state of the component",
        },
        actions: {
          type: "array",
          description:
            "Available actions that can be performed on this component",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the action",
              },
              name: {
                type: "string",
                description: "Human-readable name for the action",
              },
              description: {
                type: "string",
                description: "Description of what the action does",
              },
              available: {
                type: "boolean",
                description: "Whether the action is currently available",
              },
            },
          },
        },
      },
    };

    spec.components.schemas[component.type] = componentSchema;
  });

  return spec;
};

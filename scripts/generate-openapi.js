// scripts/generate-openapi.js
import fs from "fs";
import { extractApiComponentsSafe } from "./extract-api-components.js";

console.log("🔍 Extracting API components from source files...");

// Extract API components from the actual source code
let extractedComponents;
try {
  extractedComponents = extractApiComponentsSafe();
  console.log("✅ Successfully extracted API components from registerSystemApi.ts");
} catch (error) {
  console.error("❌ Failed to extract API components:", error.message);
  process.exit(1);
}

// Get the services component
const servicesApiComponent = extractedComponents.services;

// Validate that we have the services component
if (!servicesApiComponent) {
  console.error("❌ Services API component not found in extracted components");
  process.exit(1);
}

console.log("📋 Found services component with", servicesApiComponent.actions?.length || 0, "actions");

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

const apiComponents = [servicesApiComponent];

const spec = generateOpenApiSpec(apiComponents);
fs.writeFileSync("openapi.json", JSON.stringify(spec, null, 2));
console.log("📝 openapi.json generated");

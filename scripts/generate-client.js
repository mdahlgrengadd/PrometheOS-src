// scripts/generate-client.js
import fs from "fs";
import path from "path";

/**
 * Generate TypeScript client from OpenAPI spec
 */
function generateTypeScriptClient() {
  const openApiSpec = JSON.parse(fs.readFileSync("openapi.json", "utf8"));

  const {
    paths,
    components: { schemas },
  } = openApiSpec;

  // Generate type definitions
  let typeDefinitions = `// Generated types from OpenAPI spec
declare global {
  const desktop: {
    api: {
      execute(componentId: string, actionId: string, params?: Record<string, unknown>): Promise<unknown>;
    };
  };
}

// Base API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

`;

  // Generate request/response types for each operation
  const namespaces = new Map();

  for (const [pathKey, pathValue] of Object.entries(paths)) {
    if (!pathValue.post) continue;

    const operation = pathValue.post;
    const operationId = operation.operationId;
    const [componentId, actionId] = operationId.split("_");

    if (!namespaces.has(componentId)) {
      namespaces.set(componentId, []);
    }

    // Generate request type
    let requestType = "Record<string, never>";
    if (operation.requestBody?.content?.["application/json"]?.schema) {
      const schema = operation.requestBody.content["application/json"].schema;
      if (schema.properties) {
        const properties = Object.entries(schema.properties)
          .map(([name, prop]) => {
            const isRequired = schema.required?.includes(name) || false;
            const optional = isRequired ? "" : "?";
            const type = getTypeScriptType(prop);
            return `  ${name}${optional}: ${type};`;
          })
          .join("\n");

        requestType = `{\n${properties}\n}`;
      }
    }

    // Generate response type
    const responseType = "ApiResponse";

    typeDefinitions += `// ${operation.summary}
export interface ${capitalize(componentId)}${capitalize(actionId)}Request ${
      requestType === "Record<string, never>"
        ? "extends Record<string, never>"
        : ""
    } ${requestType === "Record<string, never>" ? "{}" : requestType}

export type ${capitalize(componentId)}${capitalize(
      actionId
    )}Response = ${responseType};

`;

    namespaces.get(componentId).push({
      actionId,
      requestType: `${capitalize(componentId)}${capitalize(actionId)}Request`,
      responseType: `${capitalize(componentId)}${capitalize(actionId)}Response`,
      description: operation.description || operation.summary,
    });
  }

  // Generate namespace implementations
  let namespaceImplementations = "";

  for (const [componentId, actions] of namespaces) {
    namespaceImplementations += `// ${componentId} component namespace
export namespace ${componentId} {
`;

    for (const action of actions) {
      namespaceImplementations += `  /**
   * ${action.description}
   */
  export async function ${action.actionId}(params: ${action.requestType}): Promise<${action.responseType}> {
    return await (globalThis as any).desktop.api.execute('${componentId}', '${action.actionId}', params) as ${action.responseType};
  }

`;
    }

    namespaceImplementations += `}

`;
  }

  // Generate main client file
  const clientContent = `${typeDefinitions}
${namespaceImplementations}
// Export low-level API access
export const api = {
  execute: (globalThis as any).desktop?.api?.execute
};

// Export all namespaces
export {
${Array.from(namespaces.keys())
  .map((ns) => `  ${ns}`)
  .join(",\n")}
};
`;

  // Write the client file
  const clientDir = "src/prometheos-client";
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  fs.writeFileSync(path.join(clientDir, "index.ts"), clientContent);

  console.log(
    "🚀 TypeScript client generated at src/prometheos-client/index.ts"
  );
}

function getTypeScriptType(propSchema) {
  if (!propSchema) return "unknown";

  switch (propSchema.type) {
    case "string":
      if (propSchema.enum) {
        return propSchema.enum.map((v) => `"${v}"`).join(" | ");
      }
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return `Array<${getTypeScriptType(propSchema.items)}>`;
    case "object":
      return "Record<string, unknown>";
    default:
      return "unknown";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

generateTypeScriptClient();

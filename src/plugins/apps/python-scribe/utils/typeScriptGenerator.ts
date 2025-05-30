interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths?: Record<
    string,
    {
      post?: {
        operationId?: string;
        summary?: string;
        description?: string;
        requestBody?: {
          required?: boolean;
          content?: {
            "application/json"?: {
              schema?: JsonSchema;
            };
          };
        };
        responses?: Record<
          string,
          {
            description?: string;
            content?: {
              "application/json"?: {
                schema?: JsonSchema;
              };
            };
          }
        >;
      };
    }
  >;
  components?: {
    schemas?: Record<string, JsonSchema>;
  };
}

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
  oneOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  nullable?: boolean;
  description?: string;
  default?: unknown;
  format?: string;
}

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
  metadata?: {
    name: string;
    docstring?: string;
    decorators: string[];
    line_number: number;
    is_async: boolean;
  };
}

const generateTypeScript = async (
  openApiSpec: OpenAPISpec,
  availableFunctions: PythonFunction[],
  fileName: string
): Promise<string> => {
  if (!openApiSpec) {
    console.warn("No OpenAPI spec provided.");
    return "";
  }

  // Generate the header with FFI declarations
  const header = `// Auto-generated TypeScript bindings for Python functions using Pyodide FFI
// Generated from: ${fileName}
// AST-based analysis with proper type preservation between Python and JavaScript

// Pyodide FFI type declarations
declare global {
  interface Window {
    pyodide: {
      globals: Map<string, any>;
      runPython: (code: string) => any;
      runPythonAsync: (code: string) => Promise<any>;
      toPy: (obj: any) => any;
      ffi: {
        wrappers: Map<string, any>;
      };
    };
  }
}

// FFI utility functions for type preservation
function convertToPython(value: any, targetType: string): any {
  if (!window.pyodide) throw new Error('Pyodide not initialized');
  
  switch (targetType) {
    case 'integer':
      return parseInt(String(value));
    case 'number':
      return parseFloat(String(value));
    case 'boolean':
      return Boolean(value);
    case 'array':
      const arrayValue = Array.isArray(value) ? value : JSON.parse(String(value));
      return window.pyodide.toPy(arrayValue);
    case 'object':
      const objValue = typeof value === 'object' ? value : JSON.parse(String(value));
      return window.pyodide.toPy(objValue);
    default:
      return String(value);
  }
}

function convertFromPython(result: any): any {
  if (!result) return result;
  
  // Handle Pyodide proxy objects
  if (typeof result === 'object' && result.toJs) {
    return result.toJs({ dict_converter: Object.fromEntries });
  }
  
  return result;
}
`;
  // Generate input interfaces and function implementations
  let functionImplementations = "";
  const exampleUsage = [];

  availableFunctions.forEach((func: PythonFunction) => {
    const pathKey = `/${func.name}`;
    const pathSpec = openApiSpec.paths?.[pathKey]?.post;

    // Generate input interface
    const interfaceName = `${capitalize(func.name)}Input`;
    let interfaceBody = "";
    const paramTypes: { [key: string]: string } = {};

    if (
      pathSpec?.requestBody?.content?.["application/json"]?.schema?.properties
    ) {
      const requestSchema =
        pathSpec.requestBody.content["application/json"].schema;
      func.parameters.forEach((paramName: string) => {
        const paramSchema = requestSchema.properties![paramName];
        const paramType = paramSchema ? jsonSchemaToTSType(paramSchema) : "any";
        const comment =
          paramSchema?.description || `Parameter for ${func.name}`;

        // Store parameter types for conversion
        paramTypes[paramName] = getConversionType(paramSchema);

        interfaceBody += `  ${paramName}: ${paramType}; // ${comment}\n`;
      });
    } else {
      // Fallback for functions without schema
      func.parameters.forEach((paramName: string) => {
        paramTypes[paramName] = "string"; // Default to string
        interfaceBody += `  ${paramName}: any; // Parameter for ${func.name}\n`;
      });
    }

    functionImplementations += `interface ${interfaceName} {\n${interfaceBody}}\n\n`;

    // Generate function implementation
    const docstring =
      pathSpec?.description ||
      func.metadata?.docstring ||
      `Execute the ${func.name} Python function`;

    functionImplementations += `export async function ${func.name}(params: ${interfaceName}): Promise<any> {
  if (!window.pyodide) throw new Error('Pyodide not initialized');
  
  try {
    // Convert and set parameters using FFI for type preservation\n`;

    // Generate parameter conversion code
    func.parameters.forEach((paramName: string) => {
      const conversionType = paramTypes[paramName] || "string";
      functionImplementations += `    if (params.${paramName} !== undefined) {
      const converted${capitalize(
        paramName
      )} = convertToPython(params.${paramName}, '${conversionType}');
      window.pyodide.globals.set('${paramName}', converted${capitalize(
        paramName
      )});
    }\n`;
    });

    functionImplementations += `    
    // Build function call with proper parameter passing
    const availableParams = [${func.parameters.map((p) => `'${p}'`).join(", ")}]
      .filter(name => params[name as keyof ${interfaceName}] !== undefined);
    const callString = \`${func.name}(\${availableParams.join(', ')})\`;
    
    // Execute function with FFI result conversion
    const rawResult = await window.pyodide.runPythonAsync(callString);
    const convertedResult = convertFromPython(rawResult);
    
    console.log(\`${func.name} executed successfully:\`, convertedResult);
    return convertedResult;
  } catch (error: any) {
    console.error(\`Error calling ${func.name}:\`, error);
    throw new Error(\`Error calling ${func.name}: \${error.message}\`);
  }
}

`;

    // Generate example usage
    const exampleParams = func.parameters
      .map((param) => {
        const paramType = paramTypes[param] || "string";
        let exampleValue = '"example"';

        switch (paramType) {
          case "number":
          case "integer":
            exampleValue = "3.14";
            break;
          case "boolean":
            exampleValue = "true";
            break;
          case "array":
            exampleValue = '["example"]';
            break;
          case "object":
            exampleValue = '{"key": "value"}';
            break;
          default:
            exampleValue = '"example"';
        }

        return `  "${param}": ${exampleValue}`;
      })
      .join(",\n");

    exampleUsage.push(
      `const result${capitalize(func.name)} = await ${
        func.name
      }({\n${exampleParams}\n});`
    );
  });

  // Generate example usage section
  const exampleSection = `// Example usage with FFI type preservation:
/*
${exampleUsage.join("\n")}
*/`;

  const typeScriptCode =
    header + "\n" + functionImplementations + exampleSection;
  return typeScriptCode;
};

const convertJsonSchemaToTypeScript = (
  schema: JsonSchema,
  typeName: string
): string => {
  if (!schema || typeof schema !== "object") {
    return `export type ${typeName} = unknown;\n`;
  }

  const tsType = jsonSchemaToTSType(schema);

  if (schema.type === "object" && schema.properties) {
    // Generate interface for object types
    let interfaceBody = "";
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const isRequired = schema.required?.includes(propName) ?? false;
      const propType = jsonSchemaToTSType(propSchema);
      const optional = isRequired ? "" : "?";
      interfaceBody += `  ${propName}${optional}: ${propType};\n`;
    }

    return `export interface ${typeName} {\n${interfaceBody}}\n`;
  } else {
    // Generate type alias for non-object types
    return `export type ${typeName} = ${tsType};\n`;
  }
};

const jsonSchemaToTSType = (schema: JsonSchema): string => {
  if (!schema || typeof schema !== "object") {
    return "unknown";
  }

  switch (schema.type) {
    case "integer":
      return "number";
    case "number":
      return "number";
    case "string":
      if (schema.enum) {
        return schema.enum.map((value: string) => `"${value}"`).join(" | ");
      }
      return "string";
    case "boolean":
      return "boolean";
    case "array":
      if (schema.items) {
        const itemType = jsonSchemaToTSType(schema.items);
        return `${itemType}[]`;
      }
      return "unknown[]";
    case "object":
      if (schema.properties) {
        // For nested objects, generate inline interface
        let objectType = "{\n";
        for (const [propName, propSchema] of Object.entries(
          schema.properties
        )) {
          const isRequired = schema.required?.includes(propName) ?? false;
          const propType = jsonSchemaToTSType(propSchema);
          const optional = isRequired ? "" : "?";
          objectType += `    ${propName}${optional}: ${propType};\n`;
        }
        objectType += "  }";
        return objectType;
      }
      if (
        schema.additionalProperties &&
        typeof schema.additionalProperties === "object"
      ) {
        const valueType = jsonSchemaToTSType(schema.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      return "Record<string, unknown>";
    case "null":
      return "null";
    default:
      // Handle union types
      if (schema.oneOf || schema.anyOf) {
        const unionSchemas = schema.oneOf || schema.anyOf;
        return unionSchemas
          .map((unionSchema: JsonSchema) => jsonSchemaToTSType(unionSchema))
          .join(" | ");
      }
      // Handle allOf (intersection types)
      if (schema.allOf) {
        return schema.allOf
          .map((intersectionSchema: JsonSchema) =>
            jsonSchemaToTSType(intersectionSchema)
          )
          .join(" & ");
      }
      return "unknown";
  }
};

const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const getConversionType = (schema: JsonSchema | undefined): string => {
  if (!schema || typeof schema !== "object") {
    return "string";
  }

  switch (schema.type) {
    case "integer":
      return "integer";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return "array";
    case "object":
      return "object";
    case "string":
    default:
      return "string";
  }
};

export { generateTypeScript };

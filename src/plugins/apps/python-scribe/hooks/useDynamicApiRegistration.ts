import { useCallback, useEffect, useRef, useState } from "react";

import { registerApiActionHandler } from "@/api/context/ApiContext";
import { IApiAction, IApiComponent, IApiParameter } from "@/api/core/types";
import { useApi } from "@/api/hooks/useApi";

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

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths?: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}

interface UseDynamicApiRegistrationProps {
  /** Unique ID for this python-scribe instance */
  instanceId?: string;
  /** Whether to enable API registration */
  enabled?: boolean;
}

/**
 * Hook to dynamically register python-scribe generated functions as API components
 * This enables Python functions to become MCP tools for WebLLM chat integration
 */
export const useDynamicApiRegistration = ({
  instanceId = "python-scribe",
  enabled = true,
}: UseDynamicApiRegistrationProps = {}) => {
  const { registerComponent, unregisterComponent } = useApi();
  const registeredComponentsRef = useRef<Set<string>>(new Set());
  const pyodideRef = useRef<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const pendingRegistrationRef = useRef<string | null>(null);

  // Store pyodide instance when available
  const setPyodideInstance = useCallback((pyodide: any) => {
    if (pyodideRef.current !== pyodide) {
      pyodideRef.current = pyodide;
      console.log("🔧 Pyodide instance updated in registration hook");
    }
  }, []);

  /**
   * Convert OpenAPI spec and functions to API component format
   */ const convertToApiComponent = useCallback(
    (
      spec: OpenAPISpec,
      functions: PythonFunction[],
      fileName: string
    ): IApiComponent => {
      // Create a simple component ID: py.filename (without extension)
      const fileBaseName = fileName
        .replace(/\.py$/, "")
        .replace(/[^a-zA-Z0-9]/g, "-");
      const componentId = `py.${fileBaseName}`;

      const actions: IApiAction[] = functions.map((func) => {
        const pathKey = `/${func.name}`;
        const pathSpec = spec.paths?.[pathKey]?.post;

        // Convert OpenAPI parameters to API parameters
        const parameters: IApiParameter[] = func.parameters.map((paramName) => {
          const paramSchema =
            pathSpec?.requestBody?.content?.["application/json"]?.schema
              ?.properties?.[paramName];

          return {
            name: paramName,
            type: paramSchema?.type || "string",
            description:
              paramSchema?.description || `Parameter for ${func.name}`,
            required: func.required.includes(paramName),
          };
        });

        return {
          id: func.name,
          name: func.metadata?.docstring
            ? func.name.charAt(0).toUpperCase() + func.name.slice(1)
            : `Execute ${func.name}`,
          description:
            func.metadata?.docstring ||
            `Execute the ${func.name} Python function with type-safe parameters`,
          available: true,
          parameters,
        };
      });
      return {
        id: componentId,
        type: "Python Script",
        name: `Python: ${fileName}`,
        description: `Dynamically generated API component from Python script: ${fileName}. Contains ${functions.length} executable function(s).`,
        path: `/api/py/${fileBaseName}`,
        actions,
        state: {
          enabled: true,
          visible: true,
          fileName,
          functionsCount: functions.length,
        },
        metadata: {
          source: "python-scribe",
          fileName,
          instanceId,
          generatedAt: new Date().toISOString(),
        },
      };
    },
    [instanceId]
  );

  /**
   * Register action handlers for all Python functions
   */
  const registerActionHandlers = useCallback(
    (componentId: string, functions: PythonFunction[], spec: OpenAPISpec) => {
      functions.forEach((func) => {
        registerApiActionHandler(
          componentId,
          func.name,
          async (params = {}) => {
            if (!pyodideRef.current) {
              return {
                success: false,
                error: "Pyodide not available",
              };
            }

            try {
              // Get parameter type information from OpenAPI spec
              const pathKey = `/${func.name}`;
              const pathSpec = spec.paths?.[pathKey]?.post;
              const paramSchemas =
                pathSpec?.requestBody?.content?.["application/json"]?.schema
                  ?.properties || {};

              // Set parameters in Pyodide globals with proper type conversion
              for (const [paramName, value] of Object.entries(params)) {
                if (func.parameters.includes(paramName)) {
                  const paramSchema = paramSchemas[paramName];
                  const convertedValue = convertParameterValue(
                    value,
                    paramSchema?.type || "string"
                  );
                  pyodideRef.current.globals.set(paramName, convertedValue);
                }
              }

              // Build function call
              const availableParams = func.parameters.filter(
                (p) => params[p] !== undefined
              );
              const callString = `${func.name}(${availableParams.join(", ")})`;

              // Execute function
              const rawResult = await pyodideRef.current.runPythonAsync(
                callString
              );

              // Convert result from Python
              let result = rawResult;
              if (result && typeof result === "object" && result.toJs) {
                result = result.toJs({ dict_converter: Object.fromEntries });
              }

              return {
                success: true,
                data: {
                  result,
                  function: func.name,
                  parameters: params,
                  executedAt: new Date().toISOString(),
                },
              };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                data: {
                  function: func.name,
                  parameters: params,
                  errorAt: new Date().toISOString(),
                },
              };
            }
          }
        );
      });
    },
    []
  );

  /**
   * Convert parameter values to appropriate types based on OpenAPI schema
   */
  const convertParameterValue = (value: any, type: string): any => {
    if (value === undefined || value === null || value === "") {
      return value;
    }

    switch (type) {
      case "integer":
        const intValue = parseInt(String(value), 10);
        return isNaN(intValue) ? value : intValue;

      case "number":
        const numValue = parseFloat(String(value));
        return isNaN(numValue) ? value : numValue;

      case "boolean":
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
          const lower = value.toLowerCase();
          if (lower === "true") return true;
          if (lower === "false") return false;
        }
        return Boolean(value);

      case "array":
        if (Array.isArray(value)) return value;
        try {
          return JSON.parse(String(value));
        } catch {
          return value;
        }

      case "object":
        if (typeof value === "object") return value;
        try {
          return JSON.parse(String(value));
        } catch {
          return value;
        }

      default: // 'string' or unknown types
        return String(value);
    }
  };

  /**
   * Unregister all components for a specific file
   */
  const unregisterByFileName = useCallback(
    (fileName: string) => {
      const fileBaseName = fileName
        .replace(/\.py$/, "")
        .replace(/[^a-zA-Z0-9]/g, "-");
      const fileComponentId = `py.${fileBaseName}`;
      const componentsToRemove = Array.from(
        registeredComponentsRef.current
      ).filter(
        (id) => id === fileComponentId || id.startsWith(`py.${fileBaseName}-`)
      );

      for (const componentId of componentsToRemove) {
        try {
          unregisterComponent(componentId);
          registeredComponentsRef.current.delete(componentId);
          console.log(
            `🗑️  Unregistered Python API component for file update: ${componentId}`
          );
        } catch (error) {
          console.error(
            `Failed to unregister component ${componentId}:`,
            error
          );
        }
      }
    },
    [unregisterComponent]
  );

  /**
   * Register Python functions as API components
   */
  const registerPythonFunctions = useCallback(
    (spec: OpenAPISpec, functions: PythonFunction[], fileName: string) => {
      if (!enabled || !spec || !functions.length) {
        console.log("🚫 Python API registration skipped:", {
          enabled,
          spec: !!spec,
          functionsCount: functions.length,
        });
        return;
      }

      // Prevent duplicate registrations
      const registrationId = `${fileName}-${functions.length}-${functions
        .map((f) => f.name)
        .join(",")}`;
      if (pendingRegistrationRef.current === registrationId || isRegistering) {
        console.log(
          "🚫 Registration already in progress or duplicate:",
          registrationId
        );
        return;
      }

      pendingRegistrationRef.current = registrationId;
      setIsRegistering(true);
      console.log("🔧 Starting Python function registration:", {
        fileName,
        functionsCount: functions.length,
        functions: functions.map((f) => f.name),
        specPaths: Object.keys(spec.paths || {}),
        enabled,
        registrationId,
      });

      try {
        const apiComponent = convertToApiComponent(spec, functions, fileName);

        // Unregister all previous components for this file (handles file updates/edits)
        unregisterByFileName(fileName);

        // Register the new component
        registerComponent(apiComponent);
        registeredComponentsRef.current.add(apiComponent.id);

        // Register action handlers with OpenAPI spec for type conversion
        registerActionHandlers(apiComponent.id, functions, spec);

        console.log(`✅ Registered Python API component: ${apiComponent.id}`, {
          functions: functions.map((f) => f.name),
          actions: apiComponent.actions.length,
          componentId: apiComponent.id,
        });

        return apiComponent;
      } catch (error) {
        console.error(
          "Failed to register Python functions as API component:",
          error
        );
      } finally {
        setIsRegistering(false);
        pendingRegistrationRef.current = null;
      }
    },
    [
      enabled,
      convertToApiComponent,
      registerComponent,
      registerActionHandlers,
      isRegistering,
      unregisterByFileName,
    ]
  );

  /**
   * Unregister all components created by this instance
   */
  const unregisterAll = useCallback(() => {
    for (const componentId of registeredComponentsRef.current) {
      try {
        unregisterComponent(componentId);
        console.log(`🗑️  Unregistered Python API component: ${componentId}`);
      } catch (error) {
        console.error(`Failed to unregister component ${componentId}:`, error);
      }
    }
    registeredComponentsRef.current.clear();
  }, [unregisterComponent]);

  return {
    registerPythonFunctions,
    unregisterAll,
    unregisterByFileName,
    setPyodideInstance,
    registeredComponents: Array.from(registeredComponentsRef.current),
  };
};

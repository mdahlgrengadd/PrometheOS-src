import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@/api/hooks/useApi';
import { IApiComponent, IApiAction, IApiParameter } from '@/api/core/types';
import { registerApiActionHandler } from '@/api/context/ApiContext';

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
  instanceId = 'python-scribe',
  enabled = true
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
      console.log('🔧 Pyodide instance updated in registration hook');
    }
  }, []);

  /**
   * Convert OpenAPI spec and functions to API component format
   */
  const convertToApiComponent = useCallback((
    spec: OpenAPISpec,
    functions: PythonFunction[],
    fileName: string
  ): IApiComponent => {
    const componentId = `${instanceId}-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    const actions: IApiAction[] = functions.map(func => {
      const pathKey = `/${func.name}`;
      const pathSpec = spec.paths?.[pathKey]?.post;
      
      // Convert OpenAPI parameters to API parameters
      const parameters: IApiParameter[] = func.parameters.map(paramName => {
        const paramSchema = pathSpec?.requestBody?.content?.['application/json']?.schema?.properties?.[paramName];
        
        return {
          name: paramName,
          type: paramSchema?.type || 'string',
          description: paramSchema?.description || `Parameter for ${func.name}`,
          required: func.required.includes(paramName),
        };
      });

      return {
        id: func.name,
        name: func.metadata?.docstring ? 
          func.name.charAt(0).toUpperCase() + func.name.slice(1) : 
          `Execute ${func.name}`,
        description: func.metadata?.docstring || 
          `Execute the ${func.name} Python function with type-safe parameters`,
        available: true,
        parameters,
      };
    });

    return {
      id: componentId,
      type: 'Python Script',
      name: `Python Functions: ${fileName}`,
      description: `Dynamically generated API component from Python script: ${fileName}. Contains ${functions.length} executable function(s).`,
      path: `/plugins/apps/python-scribe/${componentId}`,
      actions,
      state: {
        enabled: true,
        visible: true,
        fileName,
        functionsCount: functions.length,
      },
      metadata: {
        source: 'python-scribe',
        fileName,
        instanceId,
        generatedAt: new Date().toISOString(),
      }
    };
  }, [instanceId]);

  /**
   * Register action handlers for all Python functions
   */
  const registerActionHandlers = useCallback((
    componentId: string,
    functions: PythonFunction[]
  ) => {
    functions.forEach(func => {
      registerApiActionHandler(componentId, func.name, async (params = {}) => {
        if (!pyodideRef.current) {
          return {
            success: false,
            error: 'Pyodide not available'
          };
        }

        try {
          // Set parameters in Pyodide globals
          for (const [paramName, value] of Object.entries(params)) {
            if (func.parameters.includes(paramName)) {
              pyodideRef.current.globals.set(paramName, value);
            }
          }

          // Build function call
          const availableParams = func.parameters.filter(p => params[p] !== undefined);
          const callString = `${func.name}(${availableParams.join(', ')})`;
          
          // Execute function
          const rawResult = await pyodideRef.current.runPythonAsync(callString);
          
          // Convert result from Python
          let result = rawResult;
          if (result && typeof result === 'object' && result.toJs) {
            result = result.toJs({ dict_converter: Object.fromEntries });
          }

          return {
            success: true,
            data: {
              result,
              function: func.name,
              parameters: params,
              executedAt: new Date().toISOString(),
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
            data: {
              function: func.name,
              parameters: params,
              errorAt: new Date().toISOString(),
            }
          };
        }
      });
    });
  }, []);  /**
   * Register Python functions as API components
   */
  const registerPythonFunctions = useCallback((
    spec: OpenAPISpec,
    functions: PythonFunction[],
    fileName: string
  ) => {
    if (!enabled || !spec || !functions.length) {
      console.log('🚫 Python API registration skipped:', { enabled, spec: !!spec, functionsCount: functions.length });
      return;
    }

    // Prevent duplicate registrations
    const registrationId = `${fileName}-${functions.length}-${functions.map(f => f.name).join(',')}`;
    if (pendingRegistrationRef.current === registrationId || isRegistering) {
      console.log('🚫 Registration already in progress or duplicate:', registrationId);
      return;
    }

    pendingRegistrationRef.current = registrationId;
    setIsRegistering(true);

    console.log('🔧 Starting Python function registration:', {
      fileName,
      functionsCount: functions.length,
      functions: functions.map(f => f.name),
      specPaths: Object.keys(spec.paths || {}),
      enabled,
      instanceId,
      registrationId
    });

    try {
      const apiComponent = convertToApiComponent(spec, functions, fileName);

      // Unregister previous component if exists
      if (registeredComponentsRef.current.has(apiComponent.id)) {
        console.log(`🔄 Updating existing component: ${apiComponent.id}`);
        unregisterComponent(apiComponent.id);
        registeredComponentsRef.current.delete(apiComponent.id);
      }

      // Register the new component
      registerComponent(apiComponent);
      registeredComponentsRef.current.add(apiComponent.id);

      // Register action handlers
      registerActionHandlers(apiComponent.id, functions);

      console.log(`✅ Registered Python API component: ${apiComponent.id}`, {
        functions: functions.map(f => f.name),
        actions: apiComponent.actions.length,
        componentId: apiComponent.id,
      });

      return apiComponent;
    } catch (error) {
      console.error('Failed to register Python functions as API component:', error);
    } finally {
      setIsRegistering(false);
      pendingRegistrationRef.current = null;
    }
  }, [enabled, convertToApiComponent, registerComponent, unregisterComponent, registerActionHandlers, isRegistering]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Use the ref directly to avoid dependency issues
      for (const componentId of registeredComponentsRef.current) {
        try {
          unregisterComponent(componentId);
          console.log(`🗑️  Unregistered Python API component: ${componentId}`);
        } catch (error) {
          console.error(`Failed to unregister component ${componentId}:`, error);
        }
      }
      registeredComponentsRef.current.clear();
    };
  }, []); // Empty dependency array - only run on unmount

  return {
    registerPythonFunctions,
    unregisterAll,
    setPyodideInstance,
    registeredComponents: Array.from(registeredComponentsRef.current),
  };
};

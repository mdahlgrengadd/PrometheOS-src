import { AlertCircle, CheckCircle, Play, Zap } from "lucide-react";
import React, { useState } from "react";

import { useToast } from "@/hooks/use-toast";
import {
  executePythonFunction,
  formatExecutionResult,
} from "../../utils/pyodideExecutor";

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
}

interface PyodideInterface {
  globals: {
    set(name: string, value: unknown): void;
    get(name: string): unknown;
  };
  runPythonAsync(code: string): Promise<unknown>;
  loadPackage(packages: string[]): Promise<void>;
}

interface PropertySchema {
  type: "string" | "integer" | "number" | "boolean" | "array" | "object";
  description?: string;
  default?: unknown;
  enum?: unknown[];
}

interface OpenAPISchema {
  properties?: Record<string, PropertySchema>;
  required?: string[];
}

interface OpenAPISpec {
  paths?: Record<
    string,
    {
      post?: {
        requestBody?: {
          content?: {
            "application/json"?: {
              schema?: OpenAPISchema;
            };
          };
        };
      };
    }
  >;
}

interface FunctionTesterProps {
  pyodide: PyodideInterface | null;
  functions: PythonFunction[];
  openApiSpec: OpenAPISpec | null;
}

const FunctionTester: React.FC<FunctionTesterProps> = ({
  pyodide,
  functions,
  openApiSpec,
}) => {
  const [selectedFunction, setSelectedFunction] = useState("");
  const [testInputs, setTestInputs] = useState<
    Record<string, Record<string, string>>
  >({});
  const [testResult, setTestResult] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const { toast } = useToast();
  const validateInput = (
    value: string | number | boolean,
    schema: PropertySchema,
    paramName: string
  ) => {
    if (!value && value !== 0 && value !== false && value !== "") {
      return null;
    }

    const stringValue = String(value);

    switch (schema.type) {
      case "integer":
        if (!/^-?\d+$/.test(stringValue.trim())) {
          return `${paramName} must be a whole number`;
        }
        break;
      case "number":
        if (!/^-?\d*\.?\d+$/.test(stringValue.trim())) {
          return `${paramName} must be a number`;
        }
        break;
      case "boolean":
        if (
          stringValue !== "true" &&
          stringValue !== "false" &&
          value !== true &&
          value !== false
        ) {
          return `${paramName} must be true or false`;
        }
        break;
    }
    return null;
  };

  const validateAllInputs = (
    funcName: string,
    inputs: Record<string, string>
  ) => {
    const errors: Record<string, string> = {};
    const funcInfo = functions.find((f) => f.name === funcName);
    const schema =
      openApiSpec?.paths[`/${funcName}`]?.post?.requestBody?.content?.[
        "application/json"
      ]?.schema;

    if (!funcInfo || !schema) return errors;
    funcInfo.required.forEach((paramName) => {
      const value = inputs[paramName];
      if (!value || value.trim() === "") {
        errors[paramName] = `${paramName} is required`;
      }
    });

    Object.entries(inputs).forEach(([paramName, value]) => {
      if (value && value.trim() !== "") {
        const paramSchema = schema?.properties?.[paramName];
        if (paramSchema) {
          const error = validateInput(value, paramSchema, paramName);
          if (error) {
            errors[paramName] = error;
          }
        }
      }
    });

    return errors;
  };

  const testFunction = async (
    funcName: string,
    params: Record<string, string>
  ) => {
    if (!pyodide) return;

    const errors = validateAllInputs(funcName, params);
    setValidationErrors((prev) => ({ ...prev, [funcName]: errors }));

    if (Object.keys(errors).length > 0) {
      setTestResult(
        `❌ Validation Error: Please fix the input errors before running.`
      );
      toast({
        title: "Validation Error",
        description: "Please fix the input errors before running the function",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsRunning(true);
      setTestResult(`🔄 Running ${funcName}...`);
      const convertedParams: Record<string, unknown> = {};
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          const funcInfo = functions.find((f) => f.name === funcName);
          if (funcInfo && openApiSpec) {
            const schema =
              openApiSpec.paths?.[`/${funcName}`]?.post?.requestBody?.content?.[
                "application/json"
              ]?.schema;
            const propSchema = schema?.properties?.[key];

            if (propSchema) {
              switch (propSchema.type) {
                case "integer":
                  convertedParams[key] = parseInt(value);
                  break;
                case "number":
                  convertedParams[key] = parseFloat(value);
                  break;
                case "boolean":
                  convertedParams[key] = value === "true";
                  break;
                default:
                  convertedParams[key] = String(value);
                  break;
              }
            }
          }
        }
      });

      // Execute function with stdout capture
      const executionResult = await executePythonFunction(
        pyodide,
        funcName,
        convertedParams
      );
      const formattedResult = formatExecutionResult(executionResult);
      if (formattedResult.error) {
        let errorMessage = `❌ Error: ${formattedResult.error}`;
        // If there's stdout output even during an error, show it
        if (
          formattedResult.type === "error_with_output" &&
          formattedResult.stdout
        ) {
          errorMessage += `\n📤 Output before error:\n${formattedResult.stdout}`;
        }
        setTestResult(errorMessage);
        toast({
          title: "Execution Error",
          description: formattedResult.error,
          variant: "destructive",
        });
      } else {
        // Format the display based on the result type
        let displayResult = "";
        if (formattedResult.type === "success_with_output") {
          displayResult = `✅ Result: ${JSON.stringify(
            formattedResult.result,
            null,
            2
          )}\n📤 Output:\n${formattedResult.stdout}`;
        } else {
          const resultType = typeof formattedResult.result;
          displayResult = `✅ Success (${resultType}): ${JSON.stringify(
            formattedResult.result,
            null,
            2
          )}`;
        }

        setTestResult(displayResult);
        toast({
          title: "Function Executed",
          description: `${funcName} completed successfully`,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const errorMsg = `❌ Runtime Error: ${errorMessage}`;
      setTestResult(errorMsg);

      toast({
        title: "Runtime Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleInputChange = (
    funcName: string,
    paramName: string,
    value: string
  ) => {
    setTestInputs((prev) => ({
      ...prev,
      [funcName]: {
        ...prev[funcName],
        [paramName]: value,
      },
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [funcName]: {
        ...prev[funcName],
        [paramName]: "",
      },
    }));
  };

  const clearInputs = (funcName: string) => {
    setTestInputs((prev) => ({
      ...prev,
      [funcName]: {},
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [funcName]: {},
    }));
    setTestResult("");
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-500 rounded-lg">
          <Play className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Function Tester</h2>
          <p className="text-blue-200 text-sm">
            Test your Python functions in real-time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select Function
            </label>
            <select
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedFunction}
              onChange={(e) => {
                setSelectedFunction(e.target.value);
                setTestResult("");
                setValidationErrors((prev) => ({
                  ...prev,
                  [e.target.value]: {},
                }));
              }}
            >
              <option value="">Choose a function...</option>
              {functions.map((func) => (
                <option key={func.name} value={func.name}>
                  {func.name}({func.parameters.join(", ")})
                </option>
              ))}
            </select>
          </div>

          {selectedFunction && openApiSpec && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Test: {selectedFunction}()</span>
              </h3>
              {(() => {
                const schema =
                  openApiSpec.paths?.[`/${selectedFunction}`]?.post?.requestBody
                    ?.content?.["application/json"]?.schema;
                const funcInfo = functions.find(
                  (f) => f.name === selectedFunction
                );

                return (
                  <div className="space-y-3">
                    {Object.entries(schema?.properties || {}).map(
                      ([paramName, paramSchema]) => {
                        const typedParamSchema = paramSchema as PropertySchema;
                        const isRequired =
                          funcInfo?.required.includes(paramName);
                        const currentValue =
                          testInputs[selectedFunction]?.[paramName] || "";
                        const hasError =
                          validationErrors[selectedFunction]?.[paramName];

                        return (
                          <div key={paramName}>
                            <label className="block text-sm font-medium text-white mb-1">
                              {paramName}
                              {isRequired && (
                                <span className="text-red-400 ml-1">*</span>
                              )}
                              <span className="text-blue-300 text-xs ml-2">
                                ({typedParamSchema.type})
                              </span>
                            </label>

                            {paramSchema.type === "boolean" ? (
                              <select
                                className={`w-full p-2 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                                  hasError
                                    ? "border-red-500"
                                    : "border-slate-600"
                                }`}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    selectedFunction,
                                    paramName,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select...</option>
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : (
                              <input
                                type={
                                  paramSchema.type === "integer" ||
                                  paramSchema.type === "number"
                                    ? "number"
                                    : "text"
                                }
                                step={
                                  paramSchema.type === "number"
                                    ? "any"
                                    : undefined
                                }
                                className={`w-full p-2 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                                  hasError
                                    ? "border-red-500"
                                    : "border-slate-600"
                                }`}
                                placeholder={`Enter ${paramSchema.type}`}
                                value={currentValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    selectedFunction,
                                    paramName,
                                    e.target.value
                                  )
                                }
                              />
                            )}

                            {hasError && (
                              <p className="text-xs text-red-400 mt-1 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {hasError}
                              </p>
                            )}
                          </div>
                        );
                      }
                    )}

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() =>
                          testFunction(
                            selectedFunction,
                            testInputs[selectedFunction] || {}
                          )
                        }
                        disabled={
                          isRunning ||
                          Object.keys(
                            validationErrors[selectedFunction] || {}
                          ).some(
                            (key) => validationErrors[selectedFunction][key]
                          )
                        }
                        className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                          isRunning ||
                          Object.keys(
                            validationErrors[selectedFunction] || {}
                          ).some(
                            (key) => validationErrors[selectedFunction][key]
                          )
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Running...</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Run Function</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => clearInputs(selectedFunction)}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white">Output</h3>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-300">Type Preserved</span>
            </div>
          </div>{" "}
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[300px] overflow-auto border border-slate-700">
            {testResult ? (
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            ) : (
              <div className="text-slate-500">
                <p>
                  Select a function and click "Run Function" to see results...
                </p>
                <br />
                <p className="text-xs">
                  🔧 <strong>FFI Features:</strong>
                </p>
                <p className="text-xs">• Python ↔ JavaScript type conversion</p>
                <p className="text-xs">• Automatic error handling</p>
                <p className="text-xs">• Real-time validation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionTester;

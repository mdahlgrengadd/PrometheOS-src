import * as Comlink from 'comlink';

// Import the worker-specific calculator
import { WorkerCalculator, WorkerCalculatorType } from './plugins/calculator';
// Import the worker-specific WebLLM
import { Message, ProgressUpdate, WorkerWebLLMInstance, WorkerWebLLMType } from './plugins/webllm';

// Define type for calculator params
interface CalculatorParams {
  firstOperand: number;
  secondOperand: number;
  operator: string;
}

// Define type for WebLLM params
interface WebLLMParams {
  modelName?: string;
  messages?: Message[];
  temperature?: number;
}

// Define interface for worker plugins
interface WorkerPlugin {
  id: string;
  [key: string]: unknown;
}

// Define the response type
type PluginResponse =
  | { error: string }
  | number
  | ProgressUpdate
  | { status: string; message?: string }
  | Record<string, unknown>
  | ReadableStream<string>;

/**
 * Worker-compatible version of Plugin Manager that doesn't rely on DOM
 * and exposes a serializable interface for Comlink
 */
class WorkerPluginManager {
  private plugins: Map<string, unknown> = new Map();
  private calculatorPlugin: WorkerCalculatorType | null = null;
  private webllmPlugin: WorkerWebLLMType | null = null;

  constructor() {
    // Register the Calculator plugin
    this.registerCalculator(WorkerCalculator);
    // Register the WebLLM plugin
    this.registerWebLLM(WorkerWebLLMInstance);
  }

  /**
   * Register the calculator plugin
   */
  registerCalculator(calculator: WorkerCalculatorType): void {
    this.calculatorPlugin = calculator;
    this.plugins.set(calculator.id, calculator);
    console.log(`Worker registered calculator plugin: ${calculator.id}`);
  }

  /**
   * Register the WebLLM plugin
   */
  registerWebLLM(webllm: WorkerWebLLMType): void {
    this.webllmPlugin = webllm;
    this.plugins.set(webllm.id, webllm);
    console.log(`Worker registered WebLLM plugin: ${webllm.id}`);
  }

  /**
   * Check if a plugin is active
   */
  isPluginActive(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }
  /**
   * Get plugin configuration (simplified for worker)
   */
  getPluginInfo(pluginId: string): { id: string } | null {
    if (pluginId === "calculator" && this.calculatorPlugin) {
      return { id: this.calculatorPlugin.id };
    }
    if (pluginId === "webllm" && this.webllmPlugin) {
      return { id: this.webllmPlugin.id };
    }
    return null;
  }

  /**
   * Get all registered plugins' basic info
   */
  getAllPlugins(): Array<{ id: string }> {
    return Array.from(this.plugins.keys()).map((id) => ({ id }));
  }
  /**
   * Call a plugin's method and return a serializable result
   * For the Calculator and WebLLM, we'll implement special support for their functions
   */
  async callPlugin(
    pluginId: string,
    method: string,
    params?: Record<string, unknown>
  ): Promise<PluginResponse> {
    if (pluginId === "calculator") {
      if (!this.calculatorPlugin) {
        return { error: "Calculator plugin not registered" };
      }

      if (!params) {
        return { error: "Missing parameters for calculator" };
      }

      // Type check for calculator params
      if (
        typeof params.firstOperand !== "number" ||
        typeof params.secondOperand !== "number" ||
        typeof params.operator !== "string"
      ) {
        return { error: "Invalid parameters for calculator" };
      }

      // Now we can safely call the calculator
      return this.handleCalculatorCall(method, {
        firstOperand: params.firstOperand,
        secondOperand: params.secondOperand,
        operator: params.operator,
      });
    } else if (pluginId === "webllm") {
      if (!this.webllmPlugin) {
        return { error: "WebLLM plugin not registered" };
      }

      // Handle WebLLM calls
      return this.handleWebLLMCall(method, params as WebLLMParams);
    }

    return { error: `Plugin ${pluginId} not supported in worker yet` };
  }
  /**
   * Handle Calculator plugin operations
   */
  private handleCalculatorCall(
    method: string,
    params: CalculatorParams
  ): PluginResponse {
    if (!this.calculatorPlugin) {
      return { error: "Calculator plugin not registered" };
    }

    switch (method) {
      case "calculate": {
        const { firstOperand, secondOperand, operator } = params;
        try {
          console.log(
            `Worker calculating: ${firstOperand} ${operator} ${secondOperand}`
          );
          const result = this.calculatorPlugin.calculate(
            firstOperand,
            secondOperand,
            operator
          );
          console.log(`Worker result: ${result}`);
          return result;
        } catch (error) {
          console.error("Worker calculation error:", error);
          return { error: "Calculation failed in worker" };
        }
      }
      default:
        return { error: `Method ${method} not supported for calculator` };
    }
  }

  /**
   * Handle WebLLM plugin operations
   */
  private async handleWebLLMCall(
    method: string,
    params?: WebLLMParams
  ): Promise<PluginResponse> {
    if (!this.webllmPlugin) {
      return { error: "WebLLM plugin not registered" };
    }

    try {
      switch (method) {
        case "loadModel": {
          if (!params?.modelName) {
            return { error: "Missing modelName parameter" };
          }
          console.log(`Worker loading model: ${params.modelName}`);
          const result = await this.webllmPlugin.loadModel(params.modelName);
          console.log(`Worker model loading result:`, result);
          return result;
        }
        case "getProgress": {
          const progress = this.webllmPlugin.getProgress();
          return progress || { text: "", progress: 0 };
        }
        case "chat": {
          if (!params?.messages) {
            return { error: "Missing messages parameter" };
          }
          console.log(
            `Worker chat: processing ${params.messages.length} messages`
          );

          // Get the stream from WebLLM
          const stream = this.webllmPlugin.chat(
            params.messages,
            params.temperature || 0.7
          );

          // Tell Comlink to transfer, not clone
          return Comlink.transfer(stream, [stream]);
        }
        case "cleanup": {
          this.webllmPlugin.cleanup();
          return { status: "success" };
        }
        default:
          return { error: `Method ${method} not supported for WebLLM` };
      }
    } catch (error) {
      console.error(`Worker WebLLM error (${method}):`, error);
      return {
        error: `WebLLM ${method} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}

// Create the worker instance
const workerManager = new WorkerPluginManager();

// Expose all public methods via Comlink
Comlink.expose(workerManager);

import * as Comlink from "comlink";

// Import the worker-specific calculator
import { WorkerCalculator, WorkerCalculatorType } from "./plugins/calculator";

// Define type for calculator params
interface CalculatorParams {
  firstOperand: number;
  secondOperand: number;
  operator: string;
}

// Define interface for worker plugins
interface WorkerPlugin {
  id: string;
  [key: string]: unknown;
}

// Define the response type
type PluginResponse = { error: string } | number | Record<string, unknown>;

/**
 * Worker-compatible version of Plugin Manager that doesn't rely on DOM
 * and exposes a serializable interface for Comlink
 */
class WorkerPluginManager {
  private plugins: Map<string, unknown> = new Map();
  private calculatorPlugin: WorkerCalculatorType | null = null;

  constructor() {
    // Register the Calculator plugin
    this.registerCalculator(WorkerCalculator);
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
   * For the Calculator, we'll implement special support for its functions
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
}

// Create the worker instance
const workerManager = new WorkerPluginManager();

// Expose all public methods via Comlink
Comlink.expose(workerManager);

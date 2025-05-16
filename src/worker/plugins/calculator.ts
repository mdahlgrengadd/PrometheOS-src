/**
 * Worker-specific Calculator plugin implementation that doesn't depend on React or DOM
 */

// Define the plugin interface
export interface WorkerPlugin {
  id: string;
  [key: string]: unknown;
}

/**
 * Simple calculator functionality without any UI dependencies
 */
const WorkerCalculator: WorkerPlugin = {
  id: "calculator",

  // Calculator calculation functions that can run safely in a worker
  calculate(
    firstOperand: number,
    secondOperand: number,
    operator: string
  ): number {
    console.log(
      `Worker calculating: ${firstOperand} ${operator} ${secondOperand}`
    );
    let result: number;

    switch (operator) {
      case "+":
        result = firstOperand + secondOperand;
        break;
      case "-":
        result = firstOperand - secondOperand;
        break;
      case "*":
        result = firstOperand * secondOperand;
        break;
      case "/":
        result = firstOperand / secondOperand;
        break;
      default:
        result = secondOperand;
    }

    console.log(`Worker result: ${result}`);
    return result;
  },

  /**
   * Generic handler function that processes method calls with parameters
   */
  handle(
    method: string,
    params?: Record<string, unknown>
  ): number | { error: string } {
    if (method === "calculate") {
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

      return this.calculate(
        params.firstOperand as number,
        params.secondOperand as number,
        params.operator as string
      );
    }

    return { error: `Method ${method} not supported for calculator` };
  },
};

// Export the calculator instance as default
export default WorkerCalculator;

// Built worker plugin: calculator
// Generated on: 2025-05-19T17:17:03.076Z

// src/worker/plugins/calculator.ts
var WorkerCalculator = {
  id: "calculator",
  // Calculator calculation functions that can run safely in a worker
  calculate(firstOperand, secondOperand, operator) {
    console.log(
      `Worker calculating: ${firstOperand} ${operator} ${secondOperand}`
    );
    let result;
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
  handle(method, params) {
    if (method === "calculate") {
      if (!params) {
        return { error: "Missing parameters for calculator" };
      }
      if (typeof params.firstOperand !== "number" || typeof params.secondOperand !== "number" || typeof params.operator !== "string") {
        return { error: "Invalid parameters for calculator" };
      }
      return this.calculate(
        params.firstOperand,
        params.secondOperand,
        params.operator
      );
    }
    return { error: `Method ${method} not supported for calculator` };
  }
};
var calculator_default = WorkerCalculator;
export {
  calculator_default as default
};

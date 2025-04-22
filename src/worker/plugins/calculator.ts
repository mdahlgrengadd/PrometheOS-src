/**
 * Worker-specific Calculator plugin implementation that doesn't depend on React or DOM
 */

// Type definition for the worker calculator
export interface WorkerCalculatorType {
  id: string;
  calculate(
    firstOperand: number,
    secondOperand: number,
    operator: string
  ): number;
}

// Simple calculator functionality without any UI dependencies
export const WorkerCalculator: WorkerCalculatorType = {
  id: "calculator",

  // Calculator calculation functions that can run safely in a worker
  calculate(
    firstOperand: number,
    secondOperand: number,
    operator: string
  ): number {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  },
};

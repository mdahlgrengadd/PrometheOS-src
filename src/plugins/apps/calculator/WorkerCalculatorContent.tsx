import React, { useState } from "react";

import { workerPluginManager } from "../../WorkerPluginManagerClient";

const WorkerCalculatorContent: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      // Set calculating state to true
      setIsCalculating(true);
      try {
        // Use the worker to perform the calculation
        const result = await workerPluginManager.calculate(
          firstOperand,
          inputValue,
          operator
        );
        setDisplay(String(result));
        setFirstOperand(result);
      } catch (error) {
        console.error("Calculator worker error:", error);
        setDisplay("Error");
      } finally {
        setIsCalculating(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = async () => {
    if (firstOperand === null || operator === null) {
      return;
    }

    const inputValue = parseFloat(display);

    // Set calculating state to true
    setIsCalculating(true);
    try {
      // Use the worker to perform the calculation
      const result = await workerPluginManager.calculate(
        firstOperand,
        inputValue,
        operator
      );
      setDisplay(String(result));
      setFirstOperand(result);
      setOperator(null);
      setWaitingForSecondOperand(true);
    } catch (error) {
      console.error("Calculator worker error:", error);
      setDisplay("Error");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-gray-500">Worker Calculator</div>
        {isCalculating && (
          <div className="text-xs text-blue-500">Computing...</div>
        )}
      </div>
      <div className="bg-white p-2 mb-2 text-right text-xl h-10 overflow-hidden">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={clearDisplay}
          className="col-span-2 bg-red-500 text-white p-2"
        >
          AC
        </button>
        <button
          onClick={() => performOperation("/")}
          className="bg-gray-300 p-2"
        >
          /
        </button>
        <button
          onClick={() => performOperation("*")}
          className="bg-gray-300 p-2"
        >
          ×
        </button>

        <button onClick={() => inputDigit("7")} className="bg-white p-2">
          7
        </button>
        <button onClick={() => inputDigit("8")} className="bg-white p-2">
          8
        </button>
        <button onClick={() => inputDigit("9")} className="bg-white p-2">
          9
        </button>
        <button
          onClick={() => performOperation("-")}
          className="bg-gray-300 p-2"
        >
          -
        </button>

        <button onClick={() => inputDigit("4")} className="bg-white p-2">
          4
        </button>
        <button onClick={() => inputDigit("5")} className="bg-white p-2">
          5
        </button>
        <button onClick={() => inputDigit("6")} className="bg-white p-2">
          6
        </button>
        <button
          onClick={() => performOperation("+")}
          className="bg-gray-300 p-2"
        >
          +
        </button>

        <button onClick={() => inputDigit("1")} className="bg-white p-2">
          1
        </button>
        <button onClick={() => inputDigit("2")} className="bg-white p-2">
          2
        </button>
        <button onClick={() => inputDigit("3")} className="bg-white p-2">
          3
        </button>
        <button
          onClick={handleEquals}
          className="bg-blue-500 text-white p-2 row-span-2"
        >
          =
        </button>

        <button
          onClick={() => inputDigit("0")}
          className="bg-white p-2 col-span-2"
        >
          0
        </button>
        <button onClick={inputDecimal} className="bg-white p-2">
          .
        </button>
      </div>
    </div>
  );
};

export default WorkerCalculatorContent;

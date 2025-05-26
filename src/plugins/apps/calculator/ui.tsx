import React, { useEffect, useState } from 'react';

import { registerApiActionHandler, useApi } from '../../../api/context/ApiContext';
import { workerPluginManager } from '../../WorkerPluginManagerClient';
import { manifest } from './manifest';

const CalculatorContent: React.FC = () => {
  // API integration
  const { registerComponent, unregisterComponent } = useApi();

  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  useEffect(() => {
    // Register the calculator plugin when component mounts
    const initCalculator = async () => {
      try {
        // Check if calculator is already registered
        const isRegistered = await workerPluginManager.isPluginRegistered(
          "calculator"
        );

        if (!isRegistered) {
          // Use workerEntrypoint from manifest
          let workerPath = undefined;
          if (manifest.workerEntrypoint) {
            workerPath = import.meta.env.PROD
              ? `/worker/${manifest.workerEntrypoint}`
              : `/worker/${manifest.workerEntrypoint}`;
          } else {
            console.error("No workerEntrypoint defined in manifest");
          }

          if (workerPath) {
            const success = await workerPluginManager.registerPlugin(
              manifest.id,
              workerPath
            );

            if (success) {
              setIsWorkerReady(true);
              console.log("Calculator worker registered successfully");
            } else {
              console.error("Failed to register calculator worker");
            }
          }
        } else {
          setIsWorkerReady(true);
          console.log("Calculator worker already registered");
        }
      } catch (error) {
        console.error("Error initializing calculator worker:", error);
      }
    };

    initCalculator();

    // Define the calculator API component
    const componentDoc = {
      id: manifest.id,
      type: "Calculator",
      name: manifest.name,
      description: manifest.description,
      path: `/api/${manifest.id}`,
      state: { enabled: true, visible: true },
      actions: [
        {
          id: "add",
          name: "Add",
          description: "Add two numbers",
          parameters: [
            {
              name: "a",
              type: "number",
              description: "First operand",
              required: true,
            },
            {
              name: "b",
              type: "number",
              description: "Second operand",
              required: true,
            },
          ],
          available: true,
        },
      ],
    };

    // Register component and action handler
    registerComponent(componentDoc);
    registerApiActionHandler(manifest.id, "add", async (params) => {
      const a = params?.a as number;
      const b = params?.b as number;
      if (typeof a !== "number" || typeof b !== "number") {
        return { success: false, error: "Invalid parameters for add" };
      }
      try {
        // Use worker to perform addition (operator '+')
        const result = await workerPluginManager.calculate(a, b, "+");
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    // Cleanup on unmount
    return () => {
      unregisterComponent(manifest.id);
    };
  }, []);

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
    <div className="flex flex-col p-4 calculator-root h-full">
      <div className="flex-row justify-between items-center mb-2">
        <div className="text-xs text-muted-foreground">Worker Calculator</div>
        {isCalculating && (
          <div className="text-xs text-blue-500">Computing...</div>
        )}
        {!isWorkerReady && (
          <div className="text-xs text-amber-500">Initializing worker...</div>
        )}
      </div>
      <div className="flex-row bg-card p-2 mb-2 text-right text-xl h-10 overflow-hidden text-foreground border border-border">
        {display}
      </div>
      <div className="flex-row grid grid-cols-4 gap-1 grow">
        <button
          onClick={clearDisplay}
          className="col-span-2 bg-red-500 text-white p-2"
          disabled={!isWorkerReady}
        >
          AC
        </button>
        <button
          onClick={() => performOperation("/")}
          className="bg-muted p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          /
        </button>
        <button
          onClick={() => performOperation("*")}
          className="bg-muted p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          ×
        </button>

        <button
          onClick={() => inputDigit("7")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          7
        </button>
        <button
          onClick={() => inputDigit("8")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          8
        </button>
        <button
          onClick={() => inputDigit("9")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          9
        </button>
        <button
          onClick={() => performOperation("-")}
          className="bg-muted p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          -
        </button>

        <button
          onClick={() => inputDigit("4")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          4
        </button>
        <button
          onClick={() => inputDigit("5")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          5
        </button>
        <button
          onClick={() => inputDigit("6")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          6
        </button>
        <button
          onClick={() => performOperation("+")}
          className="bg-muted p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          +
        </button>

        <button
          onClick={() => inputDigit("1")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          1
        </button>
        <button
          onClick={() => inputDigit("2")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          2
        </button>
        <button
          onClick={() => inputDigit("3")}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          3
        </button>
        <button
          onClick={handleEquals}
          className="bg-blue-500 text-white p-2 row-span-2"
          disabled={!isWorkerReady}
        >
          =
        </button>

        <button
          onClick={() => inputDigit("0")}
          className="bg-card p-2 col-span-2 text-foreground"
          disabled={!isWorkerReady}
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="bg-card p-2 text-foreground"
          disabled={!isWorkerReady}
        >
          .
        </button>
      </div>
    </div>
  );
};

export default CalculatorContent;

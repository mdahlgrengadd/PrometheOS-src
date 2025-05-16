import React, { useEffect, useState } from 'react';

import { workerPluginManager } from '../../WorkerPluginManagerClient';

const WorkerCalculatorContent: React.FC = () => {
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
          // Get the correct worker path based on environment
          const workerPath = import.meta.env.PROD
            ? "/workers/calculator-worker.js" // Production path
            : "/workers/calculator-worker.js"; // Development path

          // Register the calculator plugin with its worker URL
          const success = await workerPluginManager.registerPlugin(
            "calculator",
            workerPath
          );

          if (success) {
            setIsWorkerReady(true);
            console.log("Calculator worker registered successfully");
          } else {
            console.error("Failed to register calculator worker");
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

    // Clean up when component unmounts
    return () => {
      // We don't unregister here since other instances might use it
      // In a real app, you might want to track reference counts
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
    <div className="p-4 calculator-root">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-muted-foreground">Worker Calculator</div>
        {isCalculating && (
          <div className="text-xs text-blue-500">Computing...</div>
        )}
        {!isWorkerReady && (
          <div className="text-xs text-amber-500">Initializing worker...</div>
        )}
      </div>
      <div className="bg-card p-2 mb-2 text-right text-xl h-10 overflow-hidden text-foreground border border-border">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1">
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

export default WorkerCalculatorContent;

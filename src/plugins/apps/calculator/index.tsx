
import React, { useState } from 'react';
import { Plugin, PluginManifest } from '../../types';
import { Calculator } from 'lucide-react';

export const manifest: PluginManifest = {
  id: "calculator",
  name: "Calculator",
  version: "1.0.0",
  description: "A simple calculator",
  author: "Desktop System",
  icon: <Calculator className="h-8 w-8" />,
  entry: "apps/calculator"
};

const CalculatorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Calculator plugin initialized");
  },
  render: () => {
    const [display, setDisplay] = useState("0");
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

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

    const performOperation = (nextOperator: string) => {
      const inputValue = parseFloat(display);

      if (firstOperand === null) {
        setFirstOperand(inputValue);
      } else if (operator) {
        const result = calculate(firstOperand, inputValue, operator);
        setDisplay(String(result));
        setFirstOperand(result);
      }

      setWaitingForSecondOperand(true);
      setOperator(nextOperator);
    };

    const calculate = (firstOperand: number, secondOperand: number, operator: string) => {
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
    };

    const handleEquals = () => {
      if (firstOperand === null || operator === null) {
        return;
      }

      const inputValue = parseFloat(display);
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
      setOperator(null);
      setWaitingForSecondOperand(true);
    };

    return (
      <div className="p-4 bg-gray-100">
        <div className="bg-white p-2 mb-2 text-right text-xl h-10 overflow-hidden">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button onClick={clearDisplay} className="col-span-2 bg-red-500 text-white p-2">AC</button>
          <button onClick={() => performOperation("/")} className="bg-gray-300 p-2">/</button>
          <button onClick={() => performOperation("*")} className="bg-gray-300 p-2">×</button>
          
          <button onClick={() => inputDigit("7")} className="bg-white p-2">7</button>
          <button onClick={() => inputDigit("8")} className="bg-white p-2">8</button>
          <button onClick={() => inputDigit("9")} className="bg-white p-2">9</button>
          <button onClick={() => performOperation("-")} className="bg-gray-300 p-2">-</button>
          
          <button onClick={() => inputDigit("4")} className="bg-white p-2">4</button>
          <button onClick={() => inputDigit("5")} className="bg-white p-2">5</button>
          <button onClick={() => inputDigit("6")} className="bg-white p-2">6</button>
          <button onClick={() => performOperation("+")} className="bg-gray-300 p-2">+</button>
          
          <button onClick={() => inputDigit("1")} className="bg-white p-2">1</button>
          <button onClick={() => inputDigit("2")} className="bg-white p-2">2</button>
          <button onClick={() => inputDigit("3")} className="bg-white p-2">3</button>
          <button onClick={handleEquals} className="bg-blue-500 text-white p-2 row-span-2">=</button>
          
          <button onClick={() => inputDigit("0")} className="bg-white p-2 col-span-2">0</button>
          <button onClick={inputDecimal} className="bg-white p-2">.</button>
        </div>
      </div>
    );
  }
};

export default CalculatorPlugin;


import React, { useState } from 'react';
import { Plugin, PluginManifest } from '../../types';
import { eventBus } from '../../EventBus';

// Calculator component
const CalculatorContent: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  
  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };
  
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }
    
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };
  
  const clearDisplay = () => {
    setDisplay('0');
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
  
  const calculate = (firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
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
    <div className="calculator p-2">
      <div className="display bg-gray-200 p-2 mb-2 text-right">{display}</div>
      <div className="keypad grid grid-cols-4 gap-1">
        {['7', '8', '9', '/'].map(key => (
          <button 
            key={key} 
            className="bg-gray-300 p-2"
            onClick={() => key === '/' ? performOperation(key) : inputDigit(key)}
          >
            {key}
          </button>
        ))}
        {['4', '5', '6', '*'].map(key => (
          <button 
            key={key} 
            className="bg-gray-300 p-2"
            onClick={() => key === '*' ? performOperation(key) : inputDigit(key)}
          >
            {key}
          </button>
        ))}
        {['1', '2', '3', '-'].map(key => (
          <button 
            key={key} 
            className="bg-gray-300 p-2"
            onClick={() => key === '-' ? performOperation(key) : inputDigit(key)}
          >
            {key}
          </button>
        ))}
        {['0', '.', '=', '+'].map(key => (
          <button 
            key={key} 
            className="bg-gray-300 p-2"
            onClick={() => {
              if (key === '.') inputDecimal();
              else if (key === '=') handleEquals();
              else if (key === '+') performOperation(key);
              else inputDigit(key);
            }}
          >
            {key}
          </button>
        ))}
        <button 
          className="bg-red-300 p-2 col-span-4"
          onClick={clearDisplay}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// Plugin manifest
export const manifest: PluginManifest = {
  id: "calculator",
  name: "Calculator",
  version: "1.0.0",
  description: "A simple calculator application",
  author: "Desktop System",
  icon: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"></rect>
      <line x1="8" y1="6" x2="16" y2="6"></line>
      <line x1="8" y1="10" x2="10" y2="10"></line>
      <line x1="14" y1="10" x2="16" y2="10"></line>
      <line x1="8" y1="14" x2="10" y2="14"></line>
      <line x1="14" y1="14" x2="16" y2="14"></line>
      <line x1="8" y1="18" x2="10" y2="18"></line>
      <line x1="14" y1="18" x2="16" y2="18"></line>
    </svg>
  ),
  entry: "apps/calculator"
};

// Create and export the plugin
const calculatorPlugin: Plugin = {
  id: manifest.id,
  manifest,
  
  init: () => {
    console.log("Calculator plugin initialized");
    // Subscribe to events if needed
  },
  
  render: () => <CalculatorContent />,
  
  onOpen: () => {
    console.log("Calculator opened");
  },
  
  onClose: () => {
    console.log("Calculator closed");
  },
  
  onDestroy: () => {
    console.log("Calculator plugin destroyed");
    // Clean up any resources, event listeners, etc.
  }
};

export default calculatorPlugin;

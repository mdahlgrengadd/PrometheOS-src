import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import WordEditor from "./WordEditor";

// Notepad App
const Notepad = () => {
  const [text, setText] = useState("");
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex gap-2">
        <Button variant="outline" size="sm">File</Button>
        <Button variant="outline" size="sm">Edit</Button>
        <Button variant="outline" size="sm">View</Button>
      </div>
      <Textarea 
        className="flex-1 resize-none" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
    </div>
  );
};

// Calculator App
const Calculator = () => {
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
    if (firstOperand === null || operator === null) return;
    
    const inputValue = parseFloat(display);
    const result = calculate(firstOperand, inputValue, operator);
    
    setDisplay(String(result));
    setFirstOperand(result);
    setOperator(null);
    setWaitingForSecondOperand(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 border rounded text-right text-xl h-12 mb-2 bg-gray-50">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button variant="outline" onClick={() => clearDisplay()}>C</Button>
        <Button variant="outline" onClick={() => setDisplay(String(parseFloat(display) * -1))}>+/-</Button>
        <Button variant="outline" onClick={() => performOperation("%")}>%</Button>
        <Button variant="default" onClick={() => performOperation("/")}>/</Button>
        
        <Button variant="outline" onClick={() => inputDigit("7")}>7</Button>
        <Button variant="outline" onClick={() => inputDigit("8")}>8</Button>
        <Button variant="outline" onClick={() => inputDigit("9")}>9</Button>
        <Button variant="default" onClick={() => performOperation("*")}>×</Button>
        
        <Button variant="outline" onClick={() => inputDigit("4")}>4</Button>
        <Button variant="outline" onClick={() => inputDigit("5")}>5</Button>
        <Button variant="outline" onClick={() => inputDigit("6")}>6</Button>
        <Button variant="default" onClick={() => performOperation("-")}>-</Button>
        
        <Button variant="outline" onClick={() => inputDigit("1")}>1</Button>
        <Button variant="outline" onClick={() => inputDigit("2")}>2</Button>
        <Button variant="outline" onClick={() => inputDigit("3")}>3</Button>
        <Button variant="default" onClick={() => performOperation("+")}>+</Button>
        
        <Button variant="outline" onClick={() => inputDigit("0")} className="col-span-2">0</Button>
        <Button variant="outline" onClick={() => inputDecimal()}>.</Button>
        <Button variant="default" onClick={() => handleEquals()}>=</Button>
      </div>
    </div>
  );
};

// Browser App
const Browser = () => {
  const [url, setUrl] = useState("https://example.com");
  const [activeTab, setActiveTab] = useState("tab1");
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 mb-2">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor"></path>
          </svg>
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor"></path>
          </svg>
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 1C3.91015 1 1 3.91015 1 7.5C1 11.0899 3.91015 14 7.5 14C11.0899 14 14 11.0899 14 7.5C14 3.91015 11.0899 1 7.5 1ZM7.5 2C10.5376 2 13 4.46243 13 7.5C13 10.5376 10.5376 13 7.5 13C4.46243 13 2 10.5376 2 7.5C2 4.46243 4.46243 2 7.5 2Z" fill="currentColor"></path>
            <path d="M7.5 4.5C7.77614 4.5 8 4.72386 8 5V7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5V5C7 4.72386 7.22386 4.5 7.5 4.5Z" fill="currentColor"></path>
            <path d="M7.5 9.5C7.77614 9.5 8 9.72386 8 10C8 10.2761 7.77614 10.5 7.5 10.5C7.22386 10.5 7 10.2761 7 10C7 9.72386 7.22386 9.5 7.5 9.5Z" fill="currentColor"></path>
          </svg>
        </Button>
        <Input 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-8 flex-1"
        />
      </div>
      
      <Tabs defaultValue="tab1" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="tab1">Example.com</TabsTrigger>
          <TabsTrigger value="tab2">About</TabsTrigger>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor"></path>
            </svg>
          </Button>
        </TabsList>
        <TabsContent value="tab1" className="flex-1 p-4 border rounded mt-2 overflow-auto">
          <div className="text-center flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Example Domain</h1>
            <p className="mb-4">This domain is for use in illustrative examples in documents.</p>
            <p>You may use this domain in literature without prior coordination or asking for permission.</p>
          </div>
        </TabsContent>
        <TabsContent value="tab2" className="flex-1 p-4 border rounded mt-2 overflow-auto">
          <div className="text-center flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">About This Browser</h1>
            <p className="mb-4">This is a simulated web browser running inside a window.</p>
            <p>Part of the draggable desktop dreamscape!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Settings App
const Settings = () => {
  return (
    <div className="h-full">
      <Tabs defaultValue="general" className="h-full flex">
        <div className="w-1/4 border-r pr-4">
          <h2 className="font-medium mb-2">Settings</h2>
          <TabsList className="flex flex-col items-stretch h-auto">
            <TabsTrigger value="general" className="justify-start mb-1">General</TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start mb-1">Appearance</TabsTrigger>
            <TabsTrigger value="about" className="justify-start">About</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="w-3/4 pl-4">
          <TabsContent value="general" className="m-0">
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Notifications</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span>Sound Effects</span>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-save</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0">
            <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2">Theme</label>
                <select className="w-full p-2 border rounded">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Desktop Background</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 bg-blue-500 rounded cursor-pointer"></div>
                  <div className="h-16 bg-purple-500 rounded cursor-pointer"></div>
                  <div className="h-16 bg-green-500 rounded cursor-pointer"></div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="m-0">
            <h3 className="text-lg font-medium mb-4">About</h3>
            <div className="space-y-2">
              <p><strong>Desktop OS Simulator</strong></p>
              <p>Version: 1.0.0</p>
              <p>Created with React, Tailwind CSS, and shadcn/ui</p>
              <p className="mt-4">© 2023 Virtual OS Inc.</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

// Word Editor App
const Word = () => {
  return <WordEditor />;
};

export const AppWindow = {
  Notepad,
  Calculator,
  Browser,
  Settings,
  Word
};

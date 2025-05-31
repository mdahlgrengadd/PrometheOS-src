
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initPyodide = async () => {
      try {
        setIsLoading(true);
        console.log('Loading Pyodide...');
        
        const pyodideModule = await (window as any).loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        
        console.log('Installing packages...');
        await pyodideModule.loadPackage(["micropip"]);
        await pyodideModule.runPythonAsync(`
import micropip
await micropip.install("pydantic")
        `);
        
        setPyodide(pyodideModule);
        setIsLoading(false);
        console.log('Pyodide initialized successfully');
        
        toast({
          title: "Environment Ready",
          description: "Python runtime loaded successfully with FFI support",
        });
      } catch (err: any) {
        console.error('Pyodide initialization error:', err);
        setIsLoading(false);
        toast({
          title: "Initialization Error",
          description: `Failed to load Python runtime: ${err.message}`,
          variant: "destructive",
        });
      }
    };

    // Load Pyodide script if not already loaded
    if (!(window as any).loadPyodide) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      script.onload = initPyodide;
      script.onerror = () => {
        setIsLoading(false);
        toast({
          title: "Load Error",
          description: "Failed to load Pyodide script",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    } else {
      initPyodide();
    }
  }, [toast]);

  return { pyodide, isLoading };
};

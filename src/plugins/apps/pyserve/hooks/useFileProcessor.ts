
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useFileProcessor = (pyodide: any, processUserScript: (code: string) => Promise<any>) => {
  const { toast } = useToast();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (!pyodide) {
      toast({
        title: "Not Ready",
        description: "Python runtime is still loading",
        variant: "destructive",
      });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const pythonFile = files.find(file => file.name.endsWith('.py'));
    
    if (!pythonFile) {
      toast({
        title: "Invalid File",
        description: "Please drop a Python (.py) file",
        variant: "destructive",
      });
      return;
    }

    try {
      const code = await pythonFile.text();
      const result = await processUserScript(code);
      
      if (result.requiresConfirmation) {
        return { code, fileName: pythonFile.name, result, requiresConfirmation: true };
      }
      
      toast({
        title: "File Processed",
        description: `Successfully converted ${pythonFile.name} with AST analysis and auto-installed dependencies`,
      });
      
      return { code, fileName: pythonFile.name, result };
    } catch (err: any) {
      console.error('File processing error:', err);
      toast({
        title: "Processing Error",
        description: `Error processing file: ${err.message}`,
        variant: "destructive",
      });
      throw err;
    }
  }, [pyodide, toast, processUserScript]);

  return { handleDrop };
};

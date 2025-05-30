import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { usePyodide } from '../hooks/usePyodide';
import { useScriptProcessor } from '../hooks/useScriptProcessor';
import { useDynamicApiRegistration } from '../hooks/useDynamicApiRegistration';
import { generateTypeScript } from '../utils/typeScriptGenerator';
import PythonEditorLayout from './editor/PythonEditorLayout';
import LoadingScreen from './editor/LoadingScreen';
import MissingFilesDialog from './editor/MissingFilesDialog';

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
}

const PythonCodeEditor = () => {
  const [pythonCode, setPythonCode] = useState('');
  const [generatedTS, setGeneratedTS] = useState('');
  const [fileName, setFileName] = useState('');
  const [showMissingFilesDialog, setShowMissingFilesDialog] = useState(false);
  const [tsFullscreen, setTsFullscreen] = useState(false);
  const { toast } = useToast();

  const { pyodide, isLoading } = usePyodide();
  const { 
    isProcessing,
    openApiSpec,
    availableFunctions,
    missingFiles,
    processUserScript,
    confirmProcessing,
    handleDrop: handleScriptDrop,
    setIsProcessing
  } = useScriptProcessor(pyodide);

  // Dynamic API registration for converting Python functions to MCP tools
  const { 
    registerPythonFunctions, 
    setPyodideInstance, 
    unregisterAll, 
    registeredComponents 
  } = useDynamicApiRegistration({
    instanceId: `python-scribe-${Date.now()}`,
    enabled: true
  });

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    try {
      const result = await handleScriptDrop(e);
      if (result) {
        setPythonCode(result.code);
        setFileName(result.fileName);
        
        if (result.requiresConfirmation) {
          setShowMissingFilesDialog(true);
        } else if (result.result && !result.result.requiresConfirmation && 'spec' in result.result && 'functions' in result.result) {
          const tsCode = await generateTypeScript(result.result.spec, result.result.functions, result.fileName);
          setGeneratedTS(tsCode);
          
          // Note: Registration will be handled by the main useEffect to prevent duplicates
        }
      }
    } catch (err) {
      // Error handling is done in useScriptProcessor
    }
  }, [handleScriptDrop]);

  const handleMissingFilesContinue = useCallback(async () => {
    try {
      const result = await confirmProcessing(true);
      if (result && !result.requiresConfirmation && 'spec' in result && 'functions' in result) {
        const tsCode = await generateTypeScript(result.spec, result.functions, fileName);
        setGeneratedTS(tsCode);
        
        // Note: Registration will be handled by the main useEffect to prevent duplicates
      }
    } catch (err) {
      // Error already handled
    } finally {
      setShowMissingFilesDialog(false);
    }
  }, [confirmProcessing, fileName]);

  const handleMissingFilesAbort = useCallback(() => {
    setShowMissingFilesDialog(false);
    setPythonCode('');
    setFileName('');
    toast({
      title: "Processing Aborted",
      description: "Please upload the required files and try again",
    });
  }, [toast]);

  const handlePythonCodeChange = useCallback(async (code: string) => {
    setPythonCode(code);
    if (code.trim() && pyodide) {
      try {
        setIsProcessing(true);
        const result = await processUserScript(code);
        
        if (result.requiresConfirmation) {
          setShowMissingFilesDialog(true);
          return;
        }
        
        if ('spec' in result && 'functions' in result) {
          const tsCode = await generateTypeScript(result.spec, result.functions, fileName);
          setGeneratedTS(tsCode);
          
          // Note: Registration will be handled by the main useEffect to prevent duplicates
          
          toast({
            title: "Code Updated",
            description: `Python code processed with AST analysis. ${result.functions.length} functions will be registered as API tools.`,
          });
        }
      } catch (err: any) {
        console.error('Code processing error:', err);
        toast({
          title: "Processing Error",
          description: `Error processing code: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [pyodide, toast, processUserScript, fileName, setIsProcessing]);

  const handleTypeScriptChange = useCallback((code: string) => {
    setGeneratedTS(code);
    toast({
      title: "TypeScript Updated",
      description: "TypeScript code has been modified",
    });
  }, [toast]);

  const handlePythonSave = useCallback(async (code: string) => {
    setPythonCode(code);
    if (code.trim() && pyodide) {
      try {
        setIsProcessing(true);
        const result = await processUserScript(code);
        
        if (result.requiresConfirmation) {
          setShowMissingFilesDialog(true);
          return;
        }
        
        if ('spec' in result && 'functions' in result) {
          const tsCode = await generateTypeScript(result.spec, result.functions, fileName);
          setGeneratedTS(tsCode);
          
          // Note: Registration will be handled by the main useEffect to prevent duplicates
          
          toast({
            title: "Python Code Saved",
            description: `TypeScript bindings regenerated with FFI support. ${result.functions.length} functions available as API tools.`,
          });
        }
      } catch (err: any) {
        console.error('Code processing error:', err);
        toast({
          title: "Processing Error",
          description: `Error processing code: ${err.message}`,
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }
  }, [pyodide, toast, processUserScript, fileName, setIsProcessing]);

  const handleTypeScriptSave = useCallback((code: string) => {
    setGeneratedTS(code);
    toast({
      title: "TypeScript Saved",
      description: "Your custom TypeScript code has been saved",
    });
  }, [toast]);

  // Set Pyodide instance when available
  useEffect(() => {
    if (pyodide) {
      setPyodideInstance(pyodide);
    }
  }, [pyodide, setPyodideInstance]);

  // Debounced registration to prevent infinite loops
  const registrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRegisteredStateRef = useRef<string>('');

  useEffect(() => {
    // Clear any existing timeout
    if (registrationTimeoutRef.current) {
      clearTimeout(registrationTimeoutRef.current);
    }

    // Create a hash of the current state to detect actual changes
    const currentState = JSON.stringify({
      hasOpenApiSpec: !!openApiSpec,
      functionsCount: availableFunctions.length,
      functionNames: availableFunctions.map(f => f.name).sort(),
      fileName,
      hasPyodide: !!pyodide,
    });

    // Only register if state actually changed
    if (
      pyodide && 
      openApiSpec && 
      availableFunctions.length > 0 && 
      fileName &&
      currentState !== lastRegisteredStateRef.current
    ) {
      registrationTimeoutRef.current = setTimeout(() => {
        console.log('🔧 Registering Python functions as API components (debounced):', {
          fileName,
          functionsCount: availableFunctions.length,
          functions: availableFunctions.map(f => f.name)
        });
        
        const functionsToRegister = availableFunctions.filter(fn => fn.name && fn.parameters);
        
        if (functionsToRegister.length > 0) {
          registerPythonFunctions(openApiSpec, functionsToRegister, fileName);
          lastRegisteredStateRef.current = currentState;
          
          console.log(`✅ Successfully registered ${functionsToRegister.length} Python functions as API components`);
        }
      }, 500); // 500ms debounce
    }

    // Cleanup timeout on unmount
    return () => {
      if (registrationTimeoutRef.current) {
        clearTimeout(registrationTimeoutRef.current);
      }
    };
  }, [pyodide, openApiSpec, availableFunctions, fileName, registerPythonFunctions]);

  // Store unregisterAll function in a ref to avoid dependency issues
  const unregisterAllRef = useRef(unregisterAll);
  unregisterAllRef.current = unregisterAll;

  // Cleanup registered components on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up Python API components...');
      unregisterAllRef.current();
    };
  }, []); // Empty dependency array - only run on unmount

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PythonEditorLayout
        pythonCode={pythonCode}
        generatedTS={generatedTS}
        openApiSpec={openApiSpec}
        availableFunctions={availableFunctions}
        fileName={fileName}
        isProcessing={isProcessing}
        pyodide={pyodide}
        tsFullscreen={tsFullscreen}
        registeredComponents={registeredComponents}
        onDrop={handleDrop}
        onPythonCodeChange={handlePythonCodeChange}
        onTypeScriptChange={handleTypeScriptChange}
        onPythonSave={handlePythonSave}
        onTypeScriptSave={handleTypeScriptSave}
        onTsFullscreenToggle={() => setTsFullscreen(!tsFullscreen)}
      />
      
      <MissingFilesDialog
        open={showMissingFilesDialog}
        missingFiles={missingFiles}
        onContinue={handleMissingFilesContinue}
        onAbort={handleMissingFilesAbort}
      />
    </>
  );
};

export default PythonCodeEditor;

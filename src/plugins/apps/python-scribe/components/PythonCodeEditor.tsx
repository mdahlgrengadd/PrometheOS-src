
import React, { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { usePyodide } from '../hooks/usePyodide';
import { useScriptProcessor } from '../hooks/useScriptProcessor';
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
          toast({
            title: "Code Updated",
            description: "Python code processed with AST analysis",
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
          toast({
            title: "Python Code Saved",
            description: "TypeScript bindings regenerated with FFI support",
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

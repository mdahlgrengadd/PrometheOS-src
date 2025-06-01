import { useCallback, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import { installRequiredPackages } from "../utils/packageInstaller";
import { processUserScriptWithAST } from "../utils/pythonAstProcessor";

import { useFileProcessor } from "./useFileProcessor";

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
}

export const useScriptProcessor = (pyodide: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [availableFunctions, setAvailableFunctions] = useState<
    PythonFunction[]
  >([]);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [pendingScript, setPendingScript] = useState<string>("");
  const { toast } = useToast();

  const processUserScript = useCallback(
    async (userScript: string, ignoreMissingFiles: boolean = false) => {
      if (!pyodide) return;

      try {
        // First, install required packages
        await installRequiredPackages(userScript, pyodide);

        const result = await processUserScriptWithAST(
          userScript,
          pyodide,
          ignoreMissingFiles
        );

        // Check if we need user confirmation for missing files
        if (result.requiresConfirmation) {
          setMissingFiles(result.missingFiles || []);
          setPendingScript(userScript);
          return {
            requiresConfirmation: true,
            missingFiles: result.missingFiles,
          };
        }

        setOpenApiSpec(result.spec);
        setAvailableFunctions(result.functions);

        return result;
      } catch (err: any) {
        throw new Error(
          `Failed to parse Python script with AST: ${err.message}`
        );
      }
    },
    [pyodide]
  );

  const confirmProcessing = useCallback(
    async (ignoreMissingFiles: boolean) => {
      if (!pendingScript) return;

      try {
        setIsProcessing(true);
        const result = await processUserScript(
          pendingScript,
          ignoreMissingFiles
        );

        if (!result.requiresConfirmation) {
          setMissingFiles([]);
          setPendingScript("");

          toast({
            title: "Processing Complete",
            description: ignoreMissingFiles
              ? "Script processed with file operations mocked"
              : "Script processed successfully",
          });
        }

        return result;
      } catch (err: any) {
        console.error("Confirmation processing error:", err);
        toast({
          title: "Processing Error",
          description: `Error processing script: ${err.message}`,
          variant: "destructive",
        });
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [pendingScript, processUserScript, toast]
  );

  const { handleDrop } = useFileProcessor(pyodide, processUserScript);

  return {
    isProcessing,
    openApiSpec,
    availableFunctions,
    missingFiles,
    processUserScript,
    confirmProcessing,
    handleDrop,
    setIsProcessing,
  };
};

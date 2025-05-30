
import React from 'react';
import Header from './Header';
import DropZone from './DropZone';
import CodePanels from './CodePanels';

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
}

interface PythonEditorLayoutProps {
  pythonCode: string;
  generatedTS: string;
  openApiSpec: any;
  availableFunctions: PythonFunction[];
  fileName: string;
  isProcessing: boolean;
  pyodide: any;
  tsFullscreen?: boolean;
  registeredComponents?: string[];
  onDrop: (e: React.DragEvent) => void;
  onPythonCodeChange: (code: string) => void;
  onTypeScriptChange: (code: string) => void;
  onPythonSave: (code: string) => void;
  onTypeScriptSave: (code: string) => void;
  onTsFullscreenToggle?: () => void;
}

const PythonEditorLayout: React.FC<PythonEditorLayoutProps> = ({
  pythonCode,
  generatedTS,
  openApiSpec,
  availableFunctions,
  fileName,
  isProcessing,
  pyodide,
  tsFullscreen = false,
  registeredComponents = [],
  onDrop,
  onPythonCodeChange,
  onTypeScriptChange,
  onPythonSave,
  onTypeScriptSave,
  onTsFullscreenToggle
}) => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {!pythonCode ? (
        <div className="h-full flex items-center justify-center px-6 py-8">
          <DropZone onDrop={onDrop} isProcessing={isProcessing} />
        </div>
      ) : (
        <CodePanels
          pythonCode={pythonCode}
          generatedTS={generatedTS}
          openApiSpec={openApiSpec}
          fileName={fileName}
          pyodide={pyodide}
          availableFunctions={availableFunctions}
          tsFullscreen={tsFullscreen}
          onPythonCodeChange={onPythonCodeChange}
          onTypeScriptChange={onTypeScriptChange}
          onPythonSave={onPythonSave}
          onTypeScriptSave={onTypeScriptSave}
          onTsFullscreenToggle={onTsFullscreenToggle}
        />
      )}
    </div>
  );
};

export default PythonEditorLayout;

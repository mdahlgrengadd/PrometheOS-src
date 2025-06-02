import {
  BookOpen,
  CheckCircle,
  Code,
  Edit,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Save,
  Upload,
} from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import CodeEditor from "./CodeEditor";
import FunctionTester from "./FunctionTester";
import SwaggerUIComponent from "./SwaggerUI";

interface PythonFunction {
  name: string;
  parameters: string[];
  required: string[];
}

interface CodePanelsProps {
  pythonCode: string;
  generatedTS: string;
  openApiSpec: any;
  fileName: string;
  pyodide: any;
  availableFunctions: PythonFunction[];
  tsFullscreen?: boolean;
  onPythonCodeChange?: (code: string) => void;
  onTypeScriptChange?: (code: string) => void;
  onPythonSave?: (code: string) => void;
  onTypeScriptSave?: (code: string) => void;
  onTsFullscreenToggle?: () => void;
}

const CodePanels: React.FC<CodePanelsProps> = ({
  pythonCode,
  generatedTS,
  openApiSpec,
  fileName,
  pyodide,
  availableFunctions,
  tsFullscreen = false,
  onPythonCodeChange,
  onTypeScriptChange,
  onPythonSave,
  onTypeScriptSave,
  onTsFullscreenToggle,
}) => {
  const [activeTab, setActiveTab] = useState<
    "python" | "typescript" | "openapi" | "swagger" | "tester"
  >("python");
  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    python: false,
    typescript: false,
  });
  const [editedCode, setEditedCode] = useState<Record<string, string>>({
    python: pythonCode,
    typescript: generatedTS,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<
    Record<string, boolean>
  >({
    python: false,
    typescript: false,
  });

  const fileNames = {
    python: "main.py",
    typescript: "generated.ts",
    openapi: "openapi.json",
    swagger: "swagger-ui.html",
    tester: "test.js"
  } as const;

  const tabs = [
    {
      id: "python",
      label: "Python Source",
      icon: FileText,
      color: "text-green-400",
    },
    {
      id: "typescript",
      label: "Generated TypeScript",
      icon: Code,
      color: "text-blue-400",
    },
    {
      id: "openapi",
      label: "OpenAPI Spec",
      icon: CheckCircle,
      color: "text-purple-400",
    },
    {
      id: "swagger",
      label: "API Documentation",
      icon: BookOpen,
      color: "text-cyan-400",
    },
    {
      id: "tester",
      label: "Function Tester",
      icon: Play,
      color: "text-orange-400",
    },
  ];

  const toggleEditMode = (tab: string) => {
    const newEditMode = !editMode[tab];
    setEditMode((prev) => ({
      ...prev,
      [tab]: newEditMode,
    }));

    // Reset edited code to current when entering edit mode
    if (newEditMode) {
      setEditedCode((prev) => ({
        ...prev,
        [tab]: tab === "python" ? pythonCode : generatedTS,
      }));
      setHasUnsavedChanges((prev) => ({
        ...prev,
        [tab]: false,
      }));
    }
  };

  const handleCodeEdit = (tab: string, value: string) => {
    setEditedCode((prev) => ({
      ...prev,
      [tab]: value,
    }));

    const originalCode = tab === "python" ? pythonCode : generatedTS;
    setHasUnsavedChanges((prev) => ({
      ...prev,
      [tab]: value !== originalCode,
    }));
  };

  const handleSave = (tab: string) => {
    const code = editedCode[tab];

    if (tab === "python" && onPythonSave) {
      onPythonSave(code);
    } else if (tab === "typescript" && onTypeScriptSave) {
      onTypeScriptSave(code);
    }

    setHasUnsavedChanges((prev) => ({
      ...prev,
      [tab]: false,
    }));
  };

  const handleRevert = (tab: string) => {
    const originalCode = tab === "python" ? pythonCode : generatedTS;
    setEditedCode((prev) => ({
      ...prev,
      [tab]: originalCode,
    }));
    setHasUnsavedChanges((prev) => ({
      ...prev,
      [tab]: false,
    }));
  };

  const getContent = () => {
    switch (activeTab) {
      case "python":
        return editMode.python ? editedCode.python : pythonCode;
      case "typescript":
        return editMode.typescript ? editedCode.typescript : generatedTS;
      case "openapi":
        return openApiSpec ? JSON.stringify(openApiSpec, null, 2) : "";
      case "tester":
        return "";
      default:
        return "";
    }
  };

  const canEdit = (tab: string) => {
    return (
      (tab === "python" && onPythonSave) ||
      (tab === "typescript" && onTypeScriptSave)
    );
  };

  const handleCodeChange = (value: string) => {
    if (editMode[activeTab]) {
      handleCodeEdit(activeTab, value);
    }
  };
  const getLanguage = (): "python" | "typescript" | "json" => {
    switch (activeTab) {
      case "python":
        return "python";
      case "typescript":
        return "typescript";
      case "openapi":
      case "swagger":
        return "json";
      default:
        return "python";
    }
  };

  // Update edited code when props change
  React.useEffect(() => {
    setEditedCode((prev) => ({
      ...prev,
      python: pythonCode,
      typescript: generatedTS,
    }));
  }, [pythonCode, generatedTS]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col overflow-hidden">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-2xl flex-shrink-0">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center space-x-3">
            <Upload className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">{fileName}</span>
          </div>
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as
                        | "python"
                        | "typescript"
                        | "openapi"
                        | "swagger"
                        | "tester"
                    )
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      activeTab === tab.id ? tab.color : ""
                    }`}
                  />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {hasUnsavedChanges[tab.id] && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-hidden relative">
        {activeTab === "tester" ? (
          <FunctionTester
            pyodide={pyodide}
            functions={availableFunctions}
            openApiSpec={openApiSpec}
          />
        ) : activeTab === "swagger" ? (
          <SwaggerUIComponent openApiSpec={openApiSpec} pyodide={pyodide} />
        ) : (
          <div className="h-full rounded-xl border border-slate-700 overflow-hidden bg-slate-800">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>{" "}
                <span className="ml-4 text-slate-400 text-sm font-mono">
                  {fileNames[activeTab] || ""}
                </span>
                {hasUnsavedChanges[activeTab] && (
                  <span className="ml-2 text-yellow-400 text-xs">
                    • Unsaved changes
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {activeTab === "typescript" && onTsFullscreenToggle && (
                  <button
                    onClick={onTsFullscreenToggle}
                    className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
                  >
                    {tsFullscreen ? (
                      <>
                        <Minimize2 className="h-3 w-3" />
                        <span>Exit Fullscreen</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3 w-3" />
                        <span>Fullscreen</span>
                      </>
                    )}
                  </button>
                )}

                {canEdit(activeTab) && (
                  <>
                    <button
                      onClick={() => toggleEditMode(activeTab)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                        editMode[activeTab]
                          ? "bg-green-600 text-white"
                          : "bg-slate-600 text-slate-300 hover:bg-slate-500"
                      }`}
                    >
                      {editMode[activeTab] ? (
                        <>
                          <Edit className="h-3 w-3" />
                          <span>Editing</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </>
                      )}
                    </button>

                    {editMode[activeTab] && (
                      <>
                        <Button
                          onClick={() => handleSave(activeTab)}
                          disabled={!hasUnsavedChanges[activeTab]}
                          size="sm"
                          className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {activeTab === "python"
                            ? "Save & Regenerate"
                            : "Save"}
                        </Button>

                        {hasUnsavedChanges[activeTab] && (
                          <Button
                            onClick={() => handleRevert(activeTab)}
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Revert
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="h-full">
              <CodeEditor
                value={getContent()}
                onChange={handleCodeChange}
                language={getLanguage()}
                readOnly={!editMode[activeTab]}
                placeholder={`Enter ${activeTab} code...`}
                fullscreen={activeTab === "typescript" && tsFullscreen}
              />
            </div>
          </div>
        )}

        {activeTab === "typescript" && !tsFullscreen && (
          <div className="absolute bottom-6 right-6 max-w-sm z-10">
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center space-x-2 text-blue-300 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">TypeScript Features:</span>
              </div>
              <ul className="mt-2 text-xs text-blue-200 space-y-1 ml-6">
                <li>• Type-safe function bindings</li>
                <li>• Automatic parameter validation</li>
                <li>• Pyodide FFI integration</li>
                <li>• Error handling and type conversion</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePanels;

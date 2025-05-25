import "../lib/monaco"; // Import Monaco configuration first

import { Save, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import useIdeStore from "../store/ide-store";
import { registerEditor, unregisterEditor } from "../utils/editor-registry";
import PreviewPanel from "./PreviewPanel";

import type * as monacoType from "monaco-editor";

const EditorArea: React.FC = () => {
  const {
    tabs,
    activeTab,
    closeTab,
    setActiveTab,
    panelVisible,
    previewPanelVisible,
    theme,
    setTabDirty,
    saveFile,
  } = useIdeStore();
  const [editorContent, setEditorContent] = useState<{ [key: string]: string }>(
    {}
  );
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const editorInstances = useRef<{
    [key: string]: monacoType.editor.IStandaloneCodeEditor;
  }>({});
  // Load Monaco editor on component mount
  useEffect(() => {
    let monaco: typeof monacoType | undefined;
    const disposables: { dispose: () => void }[] = [];
    const listeners: (() => void)[] = [];
    const currentEditorInstances = editorInstances.current; // Capture ref value for cleanup

    // Function to initialize Monaco editor for a given tab
    const initializeEditor = async (tabId: string) => {
      const { getFileById, getTabById } = useIdeStore.getState();
      const tab = getTabById(tabId);
      if (!tab) return;

      const file = getFileById(tab.fileId);
      if (!file || !file.content) return;

      if (!monaco) {
        // Import the configured Monaco
        const monacoModule = await import("../lib/monaco");
        monaco = monacoModule.default;
      }

      const editorDiv = editorRefs.current[tabId];
      if (!editorDiv) return;

      // Create the editor
      const editor = monaco.editor.create(editorDiv, {
        value: file.content,
        language: tab.language,
        theme: theme === "dark" ? "vs-dark" : "vs",
        automaticLayout: false, // We'll handle layout manually
        minimap: {
          enabled: true,
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "JetBrains Mono, monospace",
      });

      // Store the editor instance
      editorInstances.current[tabId] = editor;
      registerEditor(tabId, editor);

      // Initial layout to correct any misalignment on load (e.g., devtools docked)
      editor.layout();

      // 1) Wait for fonts to load then update layout
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => editor.layout());
      } else {
        // Fallback for browsers without Font Loading API
        setTimeout(() => editor.layout(), 100);
      }

      // 2) Handle window resize
      const onResize = () => editor.layout();
      window.addEventListener("resize", onResize);
      listeners.push(() => window.removeEventListener("resize", onResize));

      // 3) Layout on focus
      disposables.push(editor.onDidFocusEditorText(() => editor.layout()));

      // 4) Track content changes and set dirty state
      disposables.push(
        editor.onDidChangeModelContent(() => {
          const content = editor.getValue();
          setEditorContent((prev) => ({
            ...prev,
            [tabId]: content,
          }));

          // Mark the tab as dirty since content has changed
          setTabDirty(tabId, true);
        })
      );

      return editor;
    };

    // Initialize editor for active tab
    if (activeTab) {
      initializeEditor(activeTab);
    }

    // Update theme when it changes
    if (monaco && monaco.editor) {
      monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");

      // Update layout of all editors when theme changes
      Object.values(editorInstances.current).forEach((editor) => {
        editor.layout();
      });
    }
    return () => {
      // Clean up listeners
      listeners.forEach((fn) => fn());
      disposables.forEach((d) => d.dispose());

      // Clean up editors on unmount
      if (monaco && monaco.editor) {
        Object.keys(currentEditorInstances).forEach((tabId) => {
          const editor = currentEditorInstances[tabId];
          if (editor) {
            editor.dispose();
            unregisterEditor(tabId);
          }
        });
        monaco.editor.getModels().forEach((model) => model.dispose());
      }
    };
  }, [activeTab, theme, setTabDirty]);

  // Ensure layout update when switching tabs
  useEffect(() => {
    if (activeTab && editorInstances.current[activeTab]) {
      const editor = editorInstances.current[activeTab];
      // Delay layout to ensure DOM has updated
      setTimeout(() => {
        editor.layout();
        editor.focus();
      }, 10);
    }
  }, [activeTab]);

  const handleSaveFile = (tabId: string) => {
    const editor = editorInstances.current[tabId];
    if (!editor) return;

    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const content = editor.getValue();
    saveFile(tab.fileId, content);
  };

  return (
    <div
      className={`editor-area flex h-full ${
        previewPanelVisible ? "flex-row" : "flex-col"
      }`}
    >
      {tabs.length > 0 ? (
        <>
          <div className="editor-pane flex-1 flex flex-col">
            <div className="editor-tabs">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`editor-tab ${
                    activeTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="truncate flex-1">{tab.title}</span>
                  {tab.isDirty && (
                    <span className="ml-1 text-amber-400">•</span>
                  )}
                  <button
                    className="ml-2 text-blue-500 hover:text-blue-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveFile(tab.id);
                    }}
                    title="Save"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    className="ml-2 hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="editor-content flex-1 relative">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  ref={(el) => (editorRefs.current[tab.id] = el)}
                  className="absolute inset-0"
                  style={{ display: activeTab === tab.id ? "block" : "none" }}
                  data-tab-id={tab.id}
                ></div>
              ))}
            </div>
            {/* only show Terminal/Output panel inside the editor pane */}
            {panelVisible && <PanelArea />}
          </div>

          {/* preview pane slides in on the right */}
          {previewPanelVisible && (
            <div className="preview-pane w-1/2 h-full">
              <PreviewPanel />
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <h3 className="text-xl mb-2">Welcome to IDE Clone</h3>
            <p>Open a file to start editing</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- replace the old PanelArea with this two-tab version ---
const PanelArea: React.FC = () => {
  const { togglePanel, buildOutput, buildError, isBuilding } = useIdeStore();
  const [activeTab, setActiveTab] = useState<"terminal" | "output">("terminal");
  const [command, setCommand] = useState<string>("");

  // Auto-switch to output tab when there's new build output or error
  useEffect(() => {
    if (buildOutput || buildError) {
      setActiveTab("output");
    }
  }, [buildOutput, buildError]);

  // Run an esbuild command
  const runCommand = (commandInput: string) => {
    if (commandInput.startsWith("esbuild ")) {
      // Call the runBuild function from the window object
      if (typeof window.runBuild === "function") {
        window.runBuild(commandInput);
      }
    }
  };

  return (
    <div className="panel-area flex flex-col h-1/3 border-t border-sidebar-border">
      <div className="flex items-center border-b border-sidebar-border p-1">
        <div className="flex space-x-2">
          <button
            className={`px-2 ${
              activeTab === "terminal" ? "border-b-2 border-foreground" : ""
            }`}
            onClick={() => setActiveTab("terminal")}
          >
            Terminal
          </button>
          <button
            className={`px-2 ${
              activeTab === "output" ? "border-b-2 border-foreground" : ""
            }`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
        </div>
        <button
          className="ml-auto text-sidebar-foreground hover:text-foreground p-1"
          onClick={togglePanel}
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 p-2 font-mono text-sm overflow-auto">
        {activeTab === "terminal" && (
          <div className="text-muted-foreground">
            ~ $ {/* your shell goes here */}
          </div>
        )}
        {activeTab === "output" && (
          <div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="esbuild app.jsx --bundle"
                className="w-full bg-input text-foreground px-2 py-1 rounded text-sm font-mono"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    runCommand(command);
                    setCommand("");
                  }
                }}
              />
            </div>

            {isBuilding && (
              <div className="text-blue-500 mb-2">Building...</div>
            )}

            {buildError && (
              <div className="bg-destructive/10 text-destructive p-2 rounded whitespace-pre-wrap overflow-auto mb-2">
                {buildError}
              </div>
            )}

            {!buildError && buildOutput && (
              <div className="text-xs font-mono bg-sidebar-accent p-2 rounded overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {buildOutput.slice(0, 1000)}
                  {buildOutput.length > 1000 ? "..." : ""}
                </pre>
              </div>
            )}

            {!isBuilding && !buildError && !buildOutput && (
              <div className="text-muted-foreground">
                Run preview to see build output here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorArea;

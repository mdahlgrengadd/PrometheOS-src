// Register all basic languages contributions
import "../lib/monaco"; // Import Monaco configuration first

import { Play, Save, Square, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import useIdeStore from "../store/ide-store";
import { registerEditor, unregisterEditor } from "../utils/editor-registry";
import HybrideStartScreen from "./HybrideStartScreen";
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
    togglePreviewPanel,
    getTabById,
    runBuild,
  } = useIdeStore();
  const [editorContent, setEditorContent] = useState<{ [key: string]: string }>(
    {}
  );
  const [isPreviewRunning, setIsPreviewRunning] = useState(false);
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const editorInstances = useRef<{
    [key: string]: monacoType.editor.IStandaloneCodeEditor;
  }>({});
  const [previewTargetTabId, setPreviewTargetTabId] = useState<string | null>(
    null
  );

  // Load Monaco editor on component mount
  useEffect(() => {
    let monaco: typeof monacoType | undefined;
    const disposables: { dispose: () => void }[] = [];
    const listeners: (() => void)[] = [];
    const currentEditorInstances = editorInstances.current;

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
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "JetBrains Mono, monospace",
      });

      // Store and register the editor instance
      editorInstances.current[tabId] = editor;
      registerEditor(tabId, editor);

      // Initial layout
      editor.layout();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => editor.layout());
      } else {
        setTimeout(() => editor.layout(), 100);
      }

      // Window resize
      const onResize = () => editor.layout();
      window.addEventListener("resize", onResize);
      listeners.push(() => window.removeEventListener("resize", onResize));

      // Layout on focus
      disposables.push(editor.onDidFocusEditorText(() => editor.layout()));

      // Track content changes
      disposables.push(
        editor.onDidChangeModelContent(() => {
          const content = editor.getValue();
          setEditorContent((prev) => ({ ...prev, [tabId]: content }));
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
      Object.values(editorInstances.current).forEach((e) => e.layout());
    }

    return () => {
      listeners.forEach((fn) => fn());
      disposables.forEach((d) => d.dispose());
      if (monaco && monaco.editor) {
        Object.keys(currentEditorInstances).forEach((tabId) => {
          const e = currentEditorInstances[tabId];
          if (e) {
            e.dispose();
            unregisterEditor(tabId);
          }
        });
        monaco.editor.getModels().forEach((m) => m.dispose());
      }
    };
  }, [activeTab, theme, setTabDirty]);

  // Ensure layout update when switching tabs
  useEffect(() => {
    if (activeTab && editorInstances.current[activeTab]) {
      const e = editorInstances.current[activeTab];
      setTimeout(() => {
        e.layout();
        e.focus();
      }, 10);
    }
  }, [activeTab]);
  // Sync preview-as-tab behavior with preview panel toggle
  useEffect(() => {
    if (previewPanelVisible) {
      if (activeTab && activeTab !== "preview") {
        setPreviewTargetTabId(activeTab);
      }
      setActiveTab("preview");
    } else {
      if (activeTab === "preview" && previewTargetTabId) {
        setActiveTab(previewTargetTabId);
      }
      setPreviewTargetTabId(null);
    }
  }, [previewPanelVisible, activeTab, previewTargetTabId, setActiveTab]);
  const handleSaveFile = (tabId: string) => {
    const editor = editorInstances.current[tabId];
    if (!editor) return;
    const fileTab = useIdeStore.getState().tabs.find((t) => t.id === tabId);
    if (!fileTab) return;
    saveFile(fileTab.fileId, editor.getValue());
  };

  const handleRunPreview = async () => {
    if (isPreviewRunning) {
      // Stop preview
      setIsPreviewRunning(false);
      if (previewPanelVisible) {
        togglePreviewPanel();
      }
      return;
    }

    // Run build first, then open preview
    await runBuild();
    setIsPreviewRunning(true);

    // Open preview panel if not already open
    if (!previewPanelVisible) {
      togglePreviewPanel();
    }
  };
  // Stop preview when preview panel is closed
  useEffect(() => {
    if (!previewPanelVisible && isPreviewRunning) {
      setIsPreviewRunning(false);
    }
  }, [previewPanelVisible, isPreviewRunning]);

  // Handle panel visibility when switching between preview and editor tabs
  useEffect(() => {
    const handlePanelVisibilityForTabs = async () => {
      const { ideSettings } = await import("../utils/esbuild-settings");
      if (!ideSettings.hideTerminalDuringPreview) return;

      const { panelVisible, panelVisibilityBeforePreview, togglePanel } =
        useIdeStore.getState();

      if (activeTab === "preview") {
        // Switching to preview tab - hide panel if visible and remember state
        if (panelVisible) {
          useIdeStore.setState({ panelVisibilityBeforePreview: true });
          if (panelVisible) togglePanel();
        }
      } else if (activeTab && activeTab !== "preview") {
        // Switching to non-preview tab - restore panel if it was visible before
        if (panelVisibilityBeforePreview && !panelVisible) {
          togglePanel();
          useIdeStore.setState({ panelVisibilityBeforePreview: false });
        }
      }
    };

    handlePanelVisibilityForTabs();
  }, [activeTab]);

  return (
    <div className="editor-area">
      {tabs.length > 0 || previewPanelVisible ? (
        <>
          <div className="editor-tabs">
            <div className="flex items-center justify-between w-full">
              <div className="flex">
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
                {previewPanelVisible &&
                  previewTargetTabId &&
                  (() => {
                    const fileTab = getTabById(previewTargetTabId);
                    const previewTitle = fileTab
                      ? `Preview - ${fileTab.title}`
                      : "Preview";
                    return (
                      <div
                        key="preview"
                        className={`editor-tab ${
                          activeTab === "preview" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("preview")}
                      >
                        <span className="truncate flex-1">{previewTitle}</span>
                        <button
                          className="ml-2 hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePreviewPanel();
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })()}
              </div>

              {/* Run Preview button in upper right corner */}
              {activeTab && activeTab !== "preview" && (
                <button
                  className={`px-3 py-1 rounded text-sm flex items-center gap-1 mr-2 ${
                    isPreviewRunning
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  onClick={handleRunPreview}
                  title={isPreviewRunning ? "Stop" : "Run"}
                >
                  {isPreviewRunning ? (
                    <>
                      <Square size={14} />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Run
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="editor-content">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                ref={(el) => (editorRefs.current[tab.id] = el)}
                className="h-full w-full"
                style={{ display: activeTab === tab.id ? "block" : "none" }}
                data-tab-id={tab.id}
              />
            ))}
            {previewPanelVisible && previewTargetTabId && (
              <div
                key="preview"
                className="h-full w-full"
                style={{ display: activeTab === "preview" ? "block" : "none" }}
              >
                <PreviewPanel previewTabId={previewTargetTabId} />
              </div>
            )}
          </div>
        </>      ) : (
        <div className="h-full">
          <HybrideStartScreen />
        </div>
      )}

      {panelVisible && <PanelArea />}
    </div>
  );
};

const PanelArea: React.FC = () => {
  const {
    togglePanel,
    buildOutput,
    buildError,
    isBuilding,
    runBuild,
    togglePreviewPanel,
  } = useIdeStore();
  const [activeTab, setActiveTab] = useState<"terminal" | "output">("terminal");
  const [command, setCommand] = useState<string>("");

  useEffect(() => {
    if (buildOutput || buildError || isBuilding) {
      setActiveTab("output");
    }
  }, [buildOutput, buildError, isBuilding]);

  const runCommand = async (cmd: string) => {
    if (cmd.startsWith("esbuild ")) {
      await runBuild(cmd);
      setCommand("");
    }
  };
  // Get active file for default command
  const getDefaultCommand = () => {
    const {
      activeTab: activeTabId,
      getTabById,
      getFileById,
    } = useIdeStore.getState();
    if (!activeTabId) return "esbuild app.js --bundle --minify --format=esm";

    const tab = getTabById(activeTabId);
    if (!tab) return "esbuild app.js --bundle --minify --format=esm";

    const file = getFileById(tab.fileId);
    if (!file || file.type !== "file")
      return "esbuild app.js --bundle --minify --format=esm";

    // Use file.id for correct path, especially for files in subfolders
    return `esbuild ${file.id} --bundle --minify --format=esm`;
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
          <div className="text-muted-foreground">~ $</div>
        )}{" "}
        {activeTab === "output" && (
          <div>
            <div className="mb-2">
              <input
                type="text"
                placeholder={getDefaultCommand()}
                value={command}
                className="w-full bg-input text-foreground px-2 py-1 rounded text-sm font-mono"
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    runCommand(e.currentTarget.value);
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
                <pre className="whitespace-pre-wrap">{buildOutput}</pre>
              </div>
            )}
            {!isBuilding && !buildError && !buildOutput && (
              <div className="text-muted-foreground">
                Enter an esbuild command above or run preview to see build
                output here
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorArea;

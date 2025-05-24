// Register all basic languages contributions
import 'monaco-editor/esm/vs/basic-languages/monaco.contribution.js';

import { X } from 'lucide-react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import React, { useEffect, useRef, useState } from 'react';

import useIdeStore from '../store/ide-store';
import PreviewPanel from './PreviewPanel';

if (typeof window !== "undefined") {
  window.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === "json") return new jsonWorker();
      if (label === "css" || label === "scss" || label === "less")
        return new cssWorker();
      if (label === "html" || label === "handlebars" || label === "razor")
        return new htmlWorker();
      if (label === "typescript" || label === "javascript")
        return new tsWorker();
      return new editorWorker();
    },
  };
}

const EditorArea: React.FC = () => {
  const {
    tabs,
    activeTab,
    closeTab,
    setActiveTab,
    panelVisible,
    previewPanelVisible,
    theme,
    togglePreviewPanel,
    getFileById,
    getTabById,
  } = useIdeStore();
  const [editorContent, setEditorContent] = useState<{ [key: string]: string }>(
    {}
  );
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [previewTargetTabId, setPreviewTargetTabId] = useState<string | null>(
    null
  );

  // Initialize Monaco editor when activeTab or theme changes
  useEffect(() => {
    // Create the editor for the active tab
    const initializeEditor = (tabId: string) => {
      const { getFileById, getTabById } = useIdeStore.getState();
      const tab = getTabById(tabId);
      if (!tab) return;

      const file = getFileById(tab.fileId);
      if (!file || !file.content) return;

      const editorDiv = editorRefs.current[tabId];
      if (!editorDiv) return;

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

      editor.onDidChangeModelContent(() => {
        setEditorContent((prev) => ({ ...prev, [tabId]: editor.getValue() }));
      });
      return editor;
    };

    if (activeTab) initializeEditor(activeTab);
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");

    return () => {
      monaco.editor.getModels().forEach((model) => model.dispose());
    };
  }, [activeTab, theme]);

  // Sync preview panel with tabs, remembering which file we preview
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
  }, [previewPanelVisible]);

  return (
    <div className="editor-area">
      {tabs.length > 0 || previewPanelVisible ? (
        <>
          <div className="editor-tabs">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`editor-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="truncate flex-1">{tab.title}</span>
                {tab.isDirty && <span className="ml-1">•</span>}
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
          <div className="editor-content">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                ref={(el) => (editorRefs.current[tab.id] = el)}
                className="h-full w-full"
                style={{ display: activeTab === tab.id ? "block" : "none" }}
                data-tab-id={tab.id}
              ></div>
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
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <h3 className="text-xl mb-2">Welcome to IDE Clone</h3>
            <p>Open a file to start editing</p>
          </div>
        </div>
      )}

      {panelVisible && <PanelArea />}
    </div>
  );
};

const PanelArea: React.FC = () => {
  const { togglePanel } = useIdeStore();

  return (
    <div className="panel-area">
      <div className="flex items-center border-b border-sidebar-border p-1">
        <div className="font-medium text-sm px-2">Terminal</div>
        <button
          className="ml-auto text-sidebar-foreground hover:text-foreground p-1"
          onClick={togglePanel}
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-2 font-mono text-sm">
        <div className="text-muted-foreground">~ $</div>
      </div>
    </div>
  );
};

export default EditorArea;

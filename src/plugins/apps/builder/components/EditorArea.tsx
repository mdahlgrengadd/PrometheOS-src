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
  } = useIdeStore();
  const [editorContent, setEditorContent] = useState<{ [key: string]: string }>(
    {}
  );
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  return (
    <div className="editor-area">
      {tabs.length > 0 ? (
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
      {previewPanelVisible && <PreviewPanel />}
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

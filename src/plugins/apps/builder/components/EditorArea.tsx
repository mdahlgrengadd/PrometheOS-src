import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import useIdeStore from '../store/ide-store';
import PreviewPanel from './PreviewPanel';

const EditorArea: React.FC = () => {
  const { tabs, activeTab, closeTab, setActiveTab, panelVisible, previewPanelVisible, theme } = useIdeStore();
  const [editorContent, setEditorContent] = useState<{ [key: string]: string }>({});
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Load Monaco editor on component mount
  useEffect(() => {
    let monaco: any;
    
    // Function to initialize Monaco editor for a given tab
    const initializeEditor = async (tabId: string) => {
      const { getFileById, getTabById } = useIdeStore.getState();
      const tab = getTabById(tabId);
      if (!tab) return;
      
      const file = getFileById(tab.fileId);
      if (!file || !file.content) return;
      
      if (!monaco) {
        // Only load Monaco once
        monaco = await import('monaco-editor');
      }
      
      const editorDiv = editorRefs.current[tabId];
      if (!editorDiv) return;
      
      // Create the editor
      const editor = monaco.editor.create(editorDiv, {
        value: file.content,
        language: tab.language,
        theme: theme === 'dark' ? 'vs-dark' : 'vs',
        automaticLayout: true,
        minimap: {
          enabled: true
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, monospace',
      });
      
      // Update content when editor changes
      editor.onDidChangeModelContent(() => {
        setEditorContent(prev => ({
          ...prev,
          [tabId]: editor.getValue()
        }));
      });
      
      return editor;
    };
    
    // Initialize editor for active tab
    if (activeTab) {
      initializeEditor(activeTab);
    }
    
    // Update theme when it changes
    if (monaco && monaco.editor) {
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
    
    return () => {
      // Clean up editors on unmount
      if (monaco && monaco.editor) {
        monaco.editor.getModels().forEach((model: any) => model.dispose());
      }
    };
  }, [activeTab, theme]);

  return (
    <div className="editor-area">
      {tabs.length > 0 ? (
        <>
          <div className="editor-tabs">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                className={`editor-tab ${activeTab === tab.id ? 'active' : ''}`}
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
            {tabs.map(tab => (
              <div
                key={tab.id}
                ref={el => editorRefs.current[tab.id] = el}
                className="h-full w-full"
                style={{ display: activeTab === tab.id ? 'block' : 'none' }}
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

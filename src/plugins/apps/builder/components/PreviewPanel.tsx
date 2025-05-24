
import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Square } from 'lucide-react';
import useIdeStore from '../store/ide-store';
import { buildCode, initializeEsbuild, parseEsbuildCommand } from '../utils/esbuild-service';

const PreviewPanel: React.FC = () => {
  const { previewPanelVisible, togglePreviewPanel, getFileById, getTabById, activeTab } = useIdeStore();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string>('');
  const [buildError, setBuildError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Initialize esbuild when component mounts
  useEffect(() => {
    initializeEsbuild().catch(err => {
      console.error('Failed to initialize ESBuild:', err);
      setBuildError(`Failed to initialize ESBuild: ${err}`);
    });
  }, []);
  
  const getActiveFileContent = (): { fileId: string, content: string, filePath: string } | null => {
    const activeTabItem = activeTab ? getTabById(activeTab) : null;
    
    if (!activeTabItem) return null;
    
    const file = getFileById(activeTabItem.fileId);
    if (!file) return null;
    
    // Get the editor content
    const editorContent = document.querySelector(`div[data-tab-id="${activeTabItem.id}"]`);
    const content = editorContent ? (file.content || '') : '';
    
    return {
      fileId: file.id,
      content,
      filePath: file.name,
    };
  };

  const runBuild = async (command?: string) => {
    setIsBuilding(true);
    setBuildError(null);
    
    try {
      const activeFile = getActiveFileContent();
      
      if (!activeFile) {
        setBuildError('No active file to build');
        setIsBuilding(false);
        return;
      }
      
      let buildOptions;
      
      if (command) {
        buildOptions = parseEsbuildCommand(command);
        if (!buildOptions) {
          setBuildError('Invalid esbuild command');
          setIsBuilding(false);
          return;
        }
        buildOptions.content = activeFile.content;
      } else {
        buildOptions = {
          entryPoint: activeFile.filePath,
          content: activeFile.content,
          options: {
            bundle: true,
            minify: false,
          },
        };
      }
      
      const result = await buildCode(buildOptions);
      
      if (result.error) {
        setBuildError(result.error);
        setBuildOutput('');
      } else {
        setBuildOutput(result.code);
        setBuildError(null);
        
        // Auto-run the preview if successful
        if (result.code) {
          runPreview(result.code);
        }
      }
    } catch (error) {
      console.error('Build failed:', error);
      setBuildError(`Build failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsBuilding(false);
    }
  };
  
  const runPreview = (code: string) => {
    if (!iframeRef.current) return;
    
    setIsRunning(true);
    
    // Get iframe document
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;
    
    // Clear iframe
    iframeDoc.open();
    
    // Write HTML with the bundled script
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 16px; }
        </style>
      </head>
      <body>
        <div id="app"></div>
        <script type="text/javascript">
          ${code}
        </script>
      </body>
      </html>
    `);
    
    iframeDoc.close();
  };
  
  const stopPreview = () => {
    if (!iframeRef.current) return;
    
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;
    
    // Clear iframe
    iframeDoc.open();
    iframeDoc.write('<html><body><p>Preview stopped</p></body></html>');
    iframeDoc.close();
    
    setIsRunning(false);
  };
  
  const runCommand = (command: string) => {
    if (command.startsWith('esbuild ')) {
      runBuild(command);
    }
  };
  
  return (
    <div className="panel-area">
      <div className="flex items-center border-b border-sidebar-border p-1">
        <div className="font-medium text-sm px-2">Preview</div>
        
        <div className="flex items-center ml-4">
          <button
            className={`p-1 rounded ${isRunning ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'}`}
            onClick={() => isRunning ? stopPreview() : runBuild()}
            title={isRunning ? "Stop Preview" : "Run Preview"}
          >
            {isRunning ? <Square size={16} /> : <Play size={16} />}
          </button>
        </div>
        
        <button 
          className="ml-auto text-sidebar-foreground hover:text-foreground p-1"
          onClick={togglePreviewPanel}
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 h-[calc(100%-30px)]">
        <div className="border-r border-sidebar-border p-2">
          <div className="mb-2">
            <input
              type="text"
              placeholder="esbuild app.jsx --bundle"
              className="w-full bg-input text-foreground px-2 py-1 rounded text-sm font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  runCommand(e.currentTarget.value);
                }
              }}
            />
          </div>
          
          {buildError && (
            <div className="bg-destructive/10 text-destructive p-2 rounded text-sm font-mono whitespace-pre-wrap overflow-auto max-h-[calc(100%-60px)]">
              {buildError}
            </div>
          )}
          
          {!buildError && buildOutput && (
            <div className="text-xs font-mono bg-sidebar-accent p-2 rounded overflow-auto max-h-[calc(100%-60px)]">
              <pre className="whitespace-pre-wrap">{buildOutput.slice(0, 1000)}{buildOutput.length > 1000 ? '...' : ''}</pre>
            </div>
          )}
        </div>
        
        <div className="h-full">
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;

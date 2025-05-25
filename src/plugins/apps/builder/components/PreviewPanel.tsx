import { Play, Square, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import useIdeStore from '../store/ide-store';
import { FileSystemItem } from '../types';
import { getAllEditors } from '../utils/editor-registry';
import {
    addToVirtualFs, buildCode, initializeEsbuild, parseEsbuildCommand
} from '../utils/esbuild-service';

// Props for preview targeting a specific tab
interface PreviewPanelProps {
  previewTabId?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewTabId }) => {
  const {
    previewPanelVisible,
    togglePreviewPanel,
    togglePanel,
    getFileById,
    getTabById,
    activeTab,
    fileSystem,
  } = useIdeStore();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<string>("");
  const [buildError, setBuildError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Flatten the entire fileSystem into the ESBuild virtual FS
  const addAllFilesToVirtualFs = (items: FileSystemItem[], parentPath = "") => {
    items.forEach((item) => {
      const filePath = item.id; // shadow FS id is full path
      if (item.type === "file" && item.content !== undefined) {
        addToVirtualFs(filePath, item.content);
      }
      if (item.type === "folder" && item.children) {
        addAllFilesToVirtualFs(item.children, filePath);
      }
    });
  };

  // Initialize esbuild when component mounts
  useEffect(() => {
    initializeEsbuild().catch((err) => {
      console.error("Failed to initialize ESBuild:", err);
      setBuildError(`Failed to initialize ESBuild: ${err}`);
    });
  }, []);

  // Auto-run build when preview panel opens
  useEffect(() => {
    if (previewPanelVisible) {
      runBuild();
    }
  }, [previewPanelVisible]);

  const getActiveFileContent = (): {
    fileId: string;
    content: string;
    filePath: string;
  } | null => {
    // Use previewTabId if provided, otherwise fallback to activeTab
    const targetTabId = previewTabId ?? activeTab;
    const activeTabItem = targetTabId ? getTabById(targetTabId) : null;

    if (!activeTabItem) return null;

    const file = getFileById(activeTabItem.fileId);
    if (!file) return null;

    // Get the current content from the Monaco editor if available
    const editors = getAllEditors();
    const editor = editors[activeTabItem.id];
    const content = editor ? editor.getValue() : file.content || "";

    return {
      fileId: file.id,
      content,
      filePath: file.id, // use full path for correct resolution
    };
  };

  const runBuild = async (command?: string) => {
    setIsBuilding(true);
    setBuildError(null);

    try {
      const activeFile = getActiveFileContent();

      if (!activeFile) {
        setBuildError("No active file to build");
        setIsBuilding(false);
        return;
      }

      // Load all shadow FS files into virtual FS
      addAllFilesToVirtualFs(fileSystem);

      let buildOptions;

      if (command) {
        buildOptions = parseEsbuildCommand(command);
        if (!buildOptions) {
          setBuildError("Invalid esbuild command");
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
            minify: true,
            format: "esm",
          },
        };
      }

      const result = await buildCode(buildOptions);

      if (result.error) {
        setBuildError(result.error);
        setBuildOutput("");
      } else {
        setBuildOutput(result.code);
        setBuildError(null);

        // Auto-run the preview if successful
        if (result.code) {
          runPreview(result.code);
        }
      }
    } catch (error) {
      console.error("Build failed:", error);
      setBuildError(
        `Build failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
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
    iframeDoc.write("<html><body><p>Preview stopped</p></body></html>");
    iframeDoc.close();

    setIsRunning(false);
  };

  const runCommand = (command: string) => {
    if (command.startsWith("esbuild ")) {
      runBuild(command);
    }
  };

  return (
    <div
      className="panel-area flex flex-col"
      style={{ height: "100%", minHeight: 0, maxHeight: "none" }}
    >
      <div className="flex flex-col flex-1 relative">
        <div className="relative" style={{ height: "70%" }}>
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-none bg-white"
          />
          <button
            className={`absolute top-2 right-2 p-1 rounded ${
              isRunning
                ? "text-red-500 hover:bg-red-500/10"
                : "text-green-500 hover:bg-green-500/10"
            }`}
            onClick={() => (isRunning ? stopPreview() : runBuild())}
            title={isRunning ? "Stop Preview" : "Run Preview"}
          >
            {isRunning ? <Square size={16} /> : <Play size={16} />}
          </button>
        </div>
        <div
          className="border-t border-sidebar-border p-2"
          style={{ height: "30%", overflow: "auto" }}
        >
          <div className="mb-2">
            <input
              type="text"
              placeholder={`esbuild ${
                getActiveFileContent()?.filePath
              } --bundle --minify --format=esm`}
              defaultValue={`esbuild ${
                getActiveFileContent()?.filePath
              } --bundle --minify --format=esm`}
              className="w-full bg-input text-foreground px-2 py-1 rounded text-sm font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  runCommand(e.currentTarget.value);
                }
              }}
            />
          </div>

          {buildError && (
            <div className="bg-destructive/10 text-destructive p-2 rounded text-sm font-mono whitespace-pre-wrap overflow-auto">
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
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;

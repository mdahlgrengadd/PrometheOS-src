import { Play, Save, Settings, Square, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import useIdeStore from "../store/ide-store";
import { FileSystemItem } from "../types";
import { getAllEditors } from "../utils/editor-registry";
import {
  addToVirtualFs,
  buildCode,
  initializeEsbuild,
  parseEsbuildCommand,
} from "../utils/esbuild-service";

import type * as monacoType from "monaco-editor";

type ReactLoadingStrategy = "cdn" | "bundle" | "hybrid";

// Declare global interfaces for accessing methods
declare global {
  interface Window {
    runBuild: (command?: string) => Promise<void>;
  }
}

const PreviewPanel: React.FC = () => {
  const {
    previewPanelVisible,
    togglePreviewPanel,
    getFileById,
    getTabById,
    activeTab,
    setTabDirty,
    saveFile,
    setBuildOutput,
    setBuildError,
    setIsBuilding,
    buildOutput,
    buildError,
    isBuilding,
    panelVisible,
    togglePanel,
    fileSystem,
  } = useIdeStore();
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reactLoadingStrategy, setReactLoadingStrategy] =
    useState<ReactLoadingStrategy>("hybrid");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize esbuild when component mounts
  useEffect(() => {
    initializeEsbuild().catch((err) => {
      console.error("Failed to initialize ESBuild:", err);
      setBuildError(`Failed to initialize ESBuild: ${err}`);
    });
  }, [setBuildError]);

  const getActiveFileContent = (): {
    fileId: string;
    content: string;
    filePath: string;
  } | null => {
    const activeTabItem = activeTab ? getTabById(activeTab) : null;

    if (!activeTabItem) return null;

    const file = getFileById(activeTabItem.fileId);
    if (!file) return null; // Get the editor instance for this tab to extract the current content
    const editorInstances = getAllEditors();
    const editor = editorInstances[activeTabItem.id];

    // If we have an editor instance, get the current content from it
    // Otherwise fall back to the stored file content
    const content = editor ? editor.getValue() : file.content || "";

    return {
      fileId: file.id,
      content,
      filePath: file.name,
    };
  };
  const saveActiveFile = () => {
    const activeTabItem = activeTab ? getTabById(activeTab) : null;
    if (!activeTabItem) return;

    const editorInstances = getAllEditors();
    const editor = editorInstances[activeTabItem.id];
    if (!editor) return;

    // Get content directly from the editor
    const content = editor.getValue();

    // Save the file and mark it as not dirty
    saveFile(activeTabItem.fileId, content);
    setTabDirty(activeTabItem.id, false);
  };

  // Helper to find a file in the filesystem by filename
  const findFileByName = (
    filename: string,
    directory?: string
  ): FileSystemItem | null => {
    const searchInItems = (
      items: FileSystemItem[],
      dir?: string
    ): FileSystemItem | null => {
      for (const item of items) {
        // If directory is specified, only search in that directory
        if (dir && item.type === "folder" && item.name !== dir) {
          continue;
        }

        if (item.type === "file" && item.name === filename) {
          return item;
        }

        if (item.type === "folder" && item.children) {
          const found = searchInItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return searchInItems(fileSystem, directory);
  };

  // Find styles.css relative to entry file
  const findStylesRelativeToEntry = (
    entryFile: string
  ): FileSystemItem | null => {
    // Extract the directory of the entry file (e.g., "src" from "src/app.jsx")
    const entryDir = entryFile.includes("/")
      ? entryFile.substring(0, entryFile.lastIndexOf("/"))
      : "";

    // Find styles.css in the same directory
    return findFileByName("styles.css", entryDir);
  };

  // Prepare files for the virtual filesystem
  const prepareVirtualFilesystem = (
    entryFilePath: string,
    entryContent: string
  ) => {
    // Add the entry file to virtual filesystem
    addToVirtualFs(entryFilePath, entryContent);

    // Try to find styles.css relative to entry file
    const stylesFile = findStylesRelativeToEntry(entryFilePath);

    if (stylesFile && stylesFile.content) {
      // If the entry file is in a directory like "src/app.jsx",
      // add styles.css as "src/styles.css"
      const entryDir = entryFilePath.includes("/")
        ? entryFilePath.substring(0, entryFilePath.lastIndexOf("/"))
        : "";

      const stylesPath = entryDir ? `${entryDir}/styles.css` : "styles.css";

      console.log(`Adding ${stylesPath} to virtual filesystem`);
      addToVirtualFs(stylesPath, stylesFile.content);
    }
  };

  const runBuild = async (command?: string) => {
    setIsBuilding(true);
    setBuildError(null);

    // Make sure the panel is visible to show output
    if (!panelVisible) {
      togglePanel();
    }

    try {
      // Make sure we have the latest content from the editor
      const activeFile = getActiveFileContent();

      if (!activeFile) {
        setBuildError("No active file to build");
        setIsBuilding(false);
        return;
      }

      // Prepare virtual filesystem with all necessary files
      prepareVirtualFilesystem(activeFile.filePath, activeFile.content);

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
            minify: false,
            external:
              reactLoadingStrategy === "cdn"
                ? ["react", "react-dom"]
                : undefined,
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

        // Find the public folder
        const publicFolder = fileSystem.find(
          (item) => item.type === "folder" && item.name === "public"
        ) as FileSystemItem | undefined;

        if (!publicFolder) {
          setBuildError("Public folder not found in the file system");
          setIsBuilding(false);
          return;
        }

        // Find or create bundle.js in public folder
        let bundleFile = publicFolder.children?.find(
          (item) => item.type === "file" && item.name === "bundle.js"
        );

        if (!bundleFile) {
          // Create new bundle.js file
          bundleFile = {
            id: `bundle-${Date.now()}`,
            name: "bundle.js",
            type: "file",
            language: "javascript",
            content: "",
          };

          // Update public folder with new bundle.js
          if (!publicFolder.children) {
            publicFolder.children = [];
          }
          publicFolder.children.push(bundleFile);
        }

        // Save the bundled code to bundle.js
        saveFile(bundleFile.id, result.code);

        // Always run the preview after build
        runPreview();
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

  // Run preview whenever buildOutput changes and is non-empty
  useEffect(() => {
    if (buildOutput && !isBuilding && !buildError) {
      runPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildOutput]);

  const runPreview = () => {
    if (!iframeRef.current) return;

    setIsRunning(true);

    // Find index.html in the file system
    const indexHtmlFile = findFileByName("index.html");

    if (!indexHtmlFile) {
      setBuildError("index.html not found in the file system");
      return;
    }

    const indexHtmlContent = indexHtmlFile.content || "";

    // Get iframe document
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Clear iframe
    iframeDoc.open();

    // Determine if we should include React from CDN
    const includeCdnReact =
      reactLoadingStrategy === "cdn" || reactLoadingStrategy === "hybrid";

    // Create a virtual CDN for React if needed
    const reactCdn = includeCdnReact
      ? `
        <script>
          // Virtual React CDN
          window.React = {
            createElement: (type, props, ...children) => ({ type, props, children }),
            Fragment: Symbol('Fragment'),
            useState: () => [null, () => {}],
            useEffect: () => {},
            createContext: () => ({}),
          };
          window.ReactDOM = {
            render: (element, container) => {
              container.innerHTML = '<div>React Component (CDN version)</div>';
            },
            createRoot: (container) => ({
              render: (element) => {
                container.innerHTML = '<div>React Component (CDN version)</div>';
              }
            })
          };
        </script>
      `
      : "";

    // First, write a modified version of index.html without the bundle.js script
    // We'll add our script separately so we have better control over it
    let processedHtml = indexHtmlContent.replace(
      /<script src="(.*bundle\.js.*)"><\/script>/,
      ""
    );

    // Add React CDN if needed
    if (includeCdnReact) {
      processedHtml = processedHtml.replace("</head>", `${reactCdn}</head>`);
    }

    // Write the HTML to the iframe
    iframeDoc.write(processedHtml);

    // Create a new script element to properly execute the bundled code
    const scriptElement = iframeDoc.createElement("script");
    scriptElement.text = buildOutput;
    iframeDoc.body.appendChild(scriptElement);

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
  // Expose runBuild to the global window object for other components to use
  useEffect(() => {
    window.runBuild = runBuild;
    return () => {
      // Clean up the global reference on unmount
      delete window.runBuild;
    };
  }, [runBuild]);

  return (
    <div className="panel-area flex flex-col h-full">
      <div className="flex items-center border-b border-sidebar-border p-1">
        <button
          className={`p-1 mr-1 ${
            isRunning ? "text-red-500" : "text-green-500"
          }`}
          onClick={() => (isRunning ? stopPreview() : runBuild())}
          disabled={isBuilding}
          title={isRunning ? "Stop Preview" : "Run Preview"}
        >
          {isRunning ? <Square size={16} /> : <Play size={16} />}
        </button>

        <button
          className="p-1 mr-1"
          onClick={saveActiveFile}
          title="Save Active File"
        >
          <Save size={16} />
        </button>

        <button
          className="p-1 mr-1"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={16} />
        </button>

        <button
          className="ml-auto text-sidebar-foreground hover:text-foreground p-1"
          onClick={togglePreviewPanel}
        >
          <X size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="border-b border-sidebar-border p-2 bg-sidebar-bg">
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              React Loading Strategy:
            </label>
            <select
              value={reactLoadingStrategy}
              onChange={(e) =>
                setReactLoadingStrategy(e.target.value as ReactLoadingStrategy)
              }
              className="w-full p-1 border border-sidebar-border rounded bg-sidebar-bg"
            >
              <option value="cdn">CDN (External React)</option>
              <option value="bundle">Bundle (Include React)</option>
              <option value="hybrid">Hybrid (CDN + compatibility layer)</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 h-[calc(100%-30px)]">
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-top-navigation allow-modals allow-downloads allow-popups-to-escape-sandbox"
          allow="accelerometer; camera; encrypted-media; display-capture; fullscreen; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; sync-xhr; usb; web-share; xr-spatial-tracking"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;

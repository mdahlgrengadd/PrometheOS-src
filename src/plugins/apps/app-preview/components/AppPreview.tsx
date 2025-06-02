import React, { useEffect, useRef, useState } from "react";

import { getFileContent, useFileSystemStore } from "@/store/fileSystem";

import { PluginInitData } from "../../../types";

interface AppPreviewProps {
  // Accept PluginInitData directly from the plugin
  initFromUrl?: PluginInitData;
}

const AppPreview: React.FC<AppPreviewProps> = ({ initFromUrl: initData }) => {
  const [appContent, setAppContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract app content from VFS when initData is provided
  useEffect(() => {
    const loadAppContent = async () => {
      if (!initData) {
        setError("No app data provided");
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        // If we already have processed content from URL processing, use it
        if (initData.content && !initData.error) {
          setAppContent(initData.content);
          setIsLoading(false);
          return;
        }

        // If there was an error in URL processing, throw it
        if (initData.error) {
          throw new Error(initData.error);
        }

        // Extract the URL string for fallback processing
        const urlString = initData.initFromUrl;
        if (!urlString) {
          throw new Error("No URL provided in init data");
        }

        // For app:// URLs, we should rely on the processInitUrl function
        // which has already processed the URL and extracted content
        // If we reach here, it means processInitUrl failed, so we should
        // try alternative methods

        if (urlString.startsWith("app://PublishedApps/")) {
          const appName = urlString.substring("app://PublishedApps/".length);

          // Import the file system store
          const fileSystem = useFileSystemStore.getState().fs;

          // Find the published apps folder
          const publishedAppsFolder = fileSystem.children?.find(
            (child) => child.id === "published-apps" && child.type === "folder"
          );

          if (!publishedAppsFolder) {
            throw new Error(`Published Apps folder not found`);
          }

          // Find the specific app folder by name
          const appFolder = publishedAppsFolder.children?.find(
            (child) => child.name === appName && child.type === "folder"
          );

          if (!appFolder) {
            throw new Error(`Published app not found: ${appName}`);
          }

          // Find the index.html file within the app folder
          const indexFile = appFolder.children?.find(
            (child) => child.name === "index.html" && child.type === "file"
          );

          if (!indexFile || !indexFile.content) {
            throw new Error(
              `index.html not found in published app: ${appName}`
            );
          }

          setAppContent(indexFile.content);
        } else if (urlString.startsWith("vfs://")) {
          // Handle VFS URLs
          const vfsPath = urlString.substring("vfs://".length);
          const content = getFileContent(vfsPath);
          if (content == null) {
            throw new Error(`Published app not found: ${vfsPath}`);
          }
          setAppContent(content);
        } else {
          throw new Error(`Unsupported URL scheme: ${urlString}`);
        }
      } catch (err) {
        console.error("Failed to load app:", err);
        setError(err instanceof Error ? err.message : "Failed to load app");
      } finally {
        setIsLoading(false);
      }
    };

    loadAppContent();
  }, [initData]);

  // Update iframe when app content changes - similar to PreviewPanel
  useEffect(() => {
    if (!appContent || !iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Store blob URLs for cleanup
    const blobUrls: string[] = [];

    // Clear iframe
    iframeDoc.open();

    // If content is complete HTML, check if it needs script inlining
    let htmlContent = appContent;

    if (
      appContent.trim().toLowerCase().startsWith("<!doctype") ||
      appContent.trim().toLowerCase().startsWith("<html")
    ) {
      console.log(
        "[AppPreview] Processing HTML content:",
        appContent.substring(0, 200)
      );

      // Check if this is a published app HTML that references external scripts
      if (
        appContent.includes('src="./app.js"') ||
        appContent.includes("src='./app.js'")
      ) {
        console.log(
          "[AppPreview] Found external app.js reference, attempting to inline..."
        );

        try {
          // This is a published app - we need to inline the JavaScript
          // Extract the app name from initData to find the app.js file
          let appName = "";
          if (initData?.initFromUrl?.startsWith("app://PublishedApps/")) {
            appName = initData.initFromUrl.substring(
              "app://PublishedApps/".length
            );
            console.log("[AppPreview] Extracted app name:", appName);
          }

          if (appName) {
            // Find the app.js content in the VFS
            const findAppJsContent = () => {
              try {
                const fileSystem = useFileSystemStore.getState().fs;

                const publishedAppsFolder = fileSystem.children?.find(
                  (child) =>
                    child.id === "published-apps" && child.type === "folder"
                );

                if (publishedAppsFolder) {
                  const appFolder = publishedAppsFolder.children?.find(
                    (child) => child.name === appName && child.type === "folder"
                  );

                  if (appFolder) {
                    const appJsFile = appFolder.children?.find(
                      (child) =>
                        child.name === "app.js" && child.type === "file"
                    );

                    console.log(
                      "[AppPreview] Found app.js file:",
                      !!appJsFile,
                      "content length:",
                      appJsFile?.content?.length
                    );
                    return appJsFile?.content || "";
                  } else {
                    console.log("[AppPreview] App folder not found:", appName);
                  }
                } else {
                  console.log("[AppPreview] Published apps folder not found");
                }
              } catch (error) {
                console.error("[AppPreview] Error finding app.js:", error);
              }
              return "";
            };

            const appJsContent = findAppJsContent();

            if (appJsContent) {
              console.log(
                "[AppPreview] Creating blob URL for app.js content, length:",
                appJsContent.length
              );

              // Instead of inlining the JavaScript (which can cause module loading issues),
              // create a blob URL for the JavaScript file so it loads properly as a module
              const jsBlob = new Blob([appJsContent], {
                type: "application/javascript",
              });
              const jsBlobUrl = URL.createObjectURL(jsBlob);
              blobUrls.push(jsBlobUrl); // Store for cleanup

              // Replace the external script reference with the blob URL
              htmlContent = appContent.replace(
                /<script([^>]*)src=["']\.\/app\.js["']([^>]*)>\s*<\/script>/gi,
                `<script$1src="${jsBlobUrl}"$2></script>`
              );

              console.log("[AppPreview] Script URL replacement complete");
            } else {
              console.warn(
                "[AppPreview] app.js content not found, using original HTML"
              );
            }
          }
        } catch (error) {
          console.warn(
            "[AppPreview] Failed to create blob URL, using original HTML:",
            error
          );
        }
      } else {
        console.log("[AppPreview] No external app.js reference found");
      }
    } else {
      console.log("[AppPreview] Content is not complete HTML, wrapping...");
      // Content is not complete HTML, wrap it like PreviewPanel does
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>App Preview</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 16px; }
          </style>
        </head>
        <body>
          <div id="app"></div>
          <script type="text/javascript">
            try {
              ${appContent}
            } catch (err) {
              document.body.innerHTML = '<div style="color: red; padding: 20px;"><h3>Runtime Error:</h3><pre>' + err.message + '</pre></div>';
            }
          </script>
        </body>
        </html>
      `;
    }

    console.log("[AppPreview] Final HTML length:", htmlContent.length);
    console.log(
      "[AppPreview] Final HTML preview:",
      htmlContent.substring(0, 300)
    );

    // Use srcdoc instead of data URL to allow blob URLs to work properly
    // srcdoc allows the iframe to access blob URLs from the parent window
    iframeRef.current.srcdoc = htmlContent;

    // Cleanup function - runs when effect dependencies change or component unmounts
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [appContent, initData]);

  return (
    <div
      className="panel-area flex flex-col"
      style={{ height: "100%", minHeight: 0, maxHeight: "none" }}
    >
      <div className="flex flex-col flex-1 relative">
        {/* Full height iframe - similar to PreviewPanel */}
        <div className="relative h-full">
          <iframe
            ref={iframeRef}
            title="App Preview"
            className="w-full h-full border-none bg-white"
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          />

          {/* Error overlay - similar to PreviewPanel */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-red-600 p-4 text-center">
                <h3>Load Error</h3>
                <pre className="text-sm mt-2 whitespace-pre-wrap">{error}</pre>
                {initData && (
                  <div className="text-sm mt-2">
                    URL:{" "}
                    <code className="bg-red-100 px-2 py-1 rounded">
                      {initData.initFromUrl}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-gray-500 text-center">
                <div className="animate-spin text-4xl mb-4">⚙️</div>
                <h3 className="text-lg mb-2">Loading App...</h3>
                <p>
                  {initData?.initFromUrl && (
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {initData.initFromUrl}
                    </code>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Empty state - similar to PreviewPanel */}
          {!appContent && !error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-gray-500 text-center">
                <h3 className="text-lg mb-2">App Preview</h3>
                <p>Open a published app (.exe file) to preview it here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppPreview;

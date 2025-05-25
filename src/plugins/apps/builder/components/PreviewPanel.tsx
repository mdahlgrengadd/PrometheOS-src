import React, { useEffect, useRef } from 'react';

import useIdeStore from '../store/ide-store';

// Props for preview targeting a specific tab
interface PreviewPanelProps {
  previewTabId?: string;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewTabId }) => {
  const { buildCode, buildError } = useIdeStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update preview when build code changes
  useEffect(() => {
    if (!buildCode || buildError) return;

    const code = buildCode || "console.log('No build output available');";

    if (!iframeRef.current) return;

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
          try {
            ${code}
          } catch (err) {
            document.body.innerHTML = '<div style="color: red; padding: 20px;"><h3>Runtime Error:</h3><pre>' + err.message + '</pre></div>';
          }        </script>
      </body>
      </html>
    `);

    iframeDoc.close();
  }, [buildCode, buildError]);

  return (
    <div
      className="panel-area flex flex-col"
      style={{ height: "100%", minHeight: 0, maxHeight: "none" }}
    >
      <div className="flex flex-col flex-1 relative">
        {/* Full height iframe - no more build UI or run button */}
        <div className="relative h-full">
          <iframe
            ref={iframeRef}
            title="Preview"
            className="w-full h-full border-none bg-white"
          />
          {buildError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="text-red-600 p-4 text-center">
                <h3>Build Error</h3>
                <pre className="text-sm mt-2 whitespace-pre-wrap">
                  {buildError}
                </pre>
              </div>
            </div>
          )}{" "}
          {!buildCode && !buildError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-gray-500 text-center">
                <h3 className="text-lg mb-2">Preview Panel</h3>
                <p>Click "Run Preview" to see your code in action</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;

import "./index.css";

import React, { useEffect, useRef } from "react";

import { ControlBar } from "@/components/ControlBar";

declare global {
  interface Window {
    reactControlBarComponent: any;
    reactAppComponent: any;
    jsPassCtrlBar: (component: any) => void;
    btnUploadFunc: () => void;
    btnReloadFunc: () => void;
  }
}

const App: React.FC = () => {
  const controlBarRef = useRef<any>(null);
  useEffect(() => {
    // Store reference to this component globally so pre_soffice.js can access it
    window.reactControlBarComponent = controlBarRef.current;

    // Store reference to the App component
    window.reactAppComponent = {};

    // Only load scripts once
    if (!document.querySelector('script[src="./config.js"]')) {
      // Load config.js (optional)
      const configScript = document.createElement("script");
      configScript.src = "./config.js";
      document.body.appendChild(configScript);
    }

    if (!document.querySelector('script[src="./pre_soffice.js"]')) {
      // Load pre_soffice.js
      const preSofficeScript = document.createElement("script");
      preSofficeScript.type = "module";
      preSofficeScript.src = "./pre_soffice.js";
      preSofficeScript.onload = () => {
        console.log("pre_soffice.js loaded");
        // Try to connect the React component if it's available
        if (window.reactControlBarComponent && window.jsPassCtrlBar) {
          console.log("Connecting React component to pre_soffice.js");
          window.jsPassCtrlBar(window.reactControlBarComponent);
        }
      };
      document.body.appendChild(preSofficeScript);
    }

    return () => {
      // Cleanup on unmount - but don't remove scripts as they're shared
    };
  }, []); // Empty dependency array to run only once
  return (
    <div id="app" className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl p-0">
        <div className="mt-6 mb-4">
          <h1 className="text-3xl font-bold">ZetaJS: Word Editor React</h1>
        </div>{" "}
        <div className="mt-4 space-y-4 border border-border rounded-lg p-4">
          <ControlBar ref={controlBarRef} id="controlbar" />

          <div id="canvasCell" className="w-full">
            <div className="canvas-container relative">
              <div id="loadingInfo" className="loading-info">
                <div className="spinner"></div>
                <h2 className="text-2xl font-semibold">
                  ZetaOffice is loading...
                </h2>
              </div>{" "}
              <canvas
                id="qtcanvas"
                contentEditable="true"
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={(e) => e.preventDefault()}
                style={{
                  width: "100%",
                  visibility: "hidden",
                }}
                className="qt-canvas"
              />
            </div>
          </div>

          {/* Hidden elements for pre_soffice.js compatibility */}
          <div style={{ display: "none" }}>
            <div id="controlCell"></div>
            <label id="lblUpload">
              <input
                accept=".odt"
                className="file-input"
                type="file"
                id="btnUpload"
                onChange={() => window.btnUploadFunc?.()}
                disabled
              />
            </label>
            <button
              id="btnReload"
              onClick={() => window.btnReloadFunc?.()}
              disabled
            >
              Reload file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

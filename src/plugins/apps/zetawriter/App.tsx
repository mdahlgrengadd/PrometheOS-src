import "./index.css";

import React, { useEffect, useRef } from "react";

import { ControlBar } from "./components/ControlBar";

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
    <div
      id="app"
      className="h-screen w-full bg-background flex flex-col overflow-hidden"
    >
      <ControlBar ref={controlBarRef} id="controlbar" />

      <div id="canvasCell" className="flex-1 w-full overflow-hidden">
        <div className="canvas-container relative h-full w-full">
          <div
            id="loadingInfo"
            className="loading-info absolute inset-0 flex flex-col items-center justify-center z-10"
          >
            <div className="spinner"></div>
            <h2 className="text-2xl font-semibold">ZetaOffice is loading...</h2>
          </div>
          <canvas
            id="qtcanvas"
            contentEditable="true"
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => e.preventDefault()}
            style={{
              width: "100%",
              height: "100%",
              visibility: "hidden",
            }}
            className="qt-canvas absolute inset-0"
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
  );
};

export default App;

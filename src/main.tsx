import "./index.css";
import "./styles/animations.css";

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { processWindowUrlParams } from "./store/windowStore";

// Clear localStorage on launch (development only)
if (import.meta.env.DEV) {
  console.warn(
    "🧹 Clearing localStorage on application launch - all stored data will be reset"
  );
  localStorage.clear();
}

// Process any URL parameters for opening windows
processWindowUrlParams();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Suspense
    fallback={
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    }
  >
    <App />
  </Suspense>
);

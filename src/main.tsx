import './index.css';
import './styles/animations.css';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { processWindowUrlParams } from './store/windowStore';

// Process any URL parameters for opening windows
processWindowUrlParams();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode> // Commented out to prevent double-mounting in development
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
  </React.StrictMode>
);

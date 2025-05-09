import React from "https://esm.sh/react@18.2.0";

// Windows 7 Controls component using React.createElement
function Win7Controls({ onMinimize, onMaximize, onClose }) {
  return React.createElement(
    "div",
    { className: "window-controls" },
    React.createElement(
      "button",
      {
        className: "window-control",
        onClick: onMinimize,
        "aria-label": "Minimize",
        style: { backgroundColor: "var(--wm-btn-minimize-bg)" },
      },
      React.createElement("div", {
        className: "h-1 w-2.5 bg-black/60 rounded-none",
      })
    ),
    React.createElement(
      "button",
      {
        className: "window-control",
        onClick: onMaximize,
        "aria-label": "Maximize",
        style: { backgroundColor: "var(--wm-btn-maximize-bg)" },
      },
      React.createElement("div", {
        className: "h-2.5 w-2.5 border border-black/60",
      })
    ),
    React.createElement(
      "button",
      {
        className: "window-control",
        onClick: onClose,
        "aria-label": "Close",
        style: { backgroundColor: "var(--wm-btn-close-bg)" },
      },
      React.createElement(
        "div",
        { className: "h-2.5 w-2.5 relative" },
        React.createElement("div", {
          className:
            "absolute w-3 h-0.5 bg-black/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45",
        }),
        React.createElement("div", {
          className:
            "absolute w-3 h-0.5 bg-black/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45",
        })
      )
    )
  );
}

// Windows 7 Header component
function Win7Header({ title, onMinimize, onMaximize, onClose, headerRef }) {
  return React.createElement(
    "div",
    { 
      ref: headerRef, 
      className: "window-header win7-header", 
      style: { 
        cursor: "move",
        pointerEvents: "auto" // Ensure pointer events work
      }
    },
    React.createElement("div", { className: "window-title" }, title),
    React.createElement(Win7Controls, { onMinimize, onMaximize, onClose })
  );
}

// Decorator object
const Win7Decorator = {
  Header: Win7Header,
  Controls: Win7Controls,
  borderRadius: 0,
};

// Windows 7 theme decorator

// Preload function - called before setting the theme
export async function preload(previousTheme) {
  // Remove existing Windows theme CSS elements if present
  document.getElementById("win-theme-css")?.remove(); 
  document.getElementById("win-custom-css")?.remove();

  // The base 7.css will be loaded by the theme system based on the cssUrl in manifest.json
  
  // Create link for our custom CSS overrides
  const customLink = document.createElement("link");
  customLink.id = "win-custom-css"; 
  customLink.rel = "stylesheet";
  customLink.href = "/themes/win7/win7.css";

  return new Promise((resolve) => {
    // We're loading our custom CSS here rather than relying on the manifest
    // This allows us to keep the manifest validator happy (which expects a string),
    // while still loading our custom styles
    customLink.onload = () => {
      console.log("Windows 7 custom CSS loaded by decorator");
      resolve(true);
    };
    customLink.onerror = () => {
      console.error("Failed to load Windows 7 custom CSS");
      resolve(true); // Still resolve so theme can be applied
    };
    document.head.appendChild(customLink);
  });
}

// Postload function - called after setting the theme
export function postload() {
  // Add scrollbar fixes for Windows 7
  document.getElementById("scrollbar-fixes")?.remove();

  // Ensure our custom CSS is loaded - sometimes the theme loader can reset things
  if (!document.getElementById("win-custom-css")) {
    const customLink = document.createElement("link");
    customLink.id = "win-custom-css";
    customLink.rel = "stylesheet";
    customLink.href = "/themes/win7/win7.css";
    document.head.appendChild(customLink);
    console.log("Re-applying Windows 7 custom CSS in postload");
  }

  const style = document.createElement("style");
  style.id = "scrollbar-fixes";
  const gutter = "8px";

  style.textContent = `
    /* — existing scrollbar‐button & track fixes — */
    .has-scrollbar::-webkit-scrollbar-button:vertical:start:increment,
    .has-scrollbar::-webkit-scrollbar-button:vertical:end:decrement {
      display: none !important;
    }
    .has-scrollbar::-webkit-scrollbar-button:vertical:start:decrement,
    .has-scrollbar::-webkit-scrollbar-button:vertical:end:increment {
      width: 16px !important;
      height: 16px !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
    }
    .has-scrollbar::-webkit-scrollbar {
      width: 16px !important;
      height: 16px !important;
    }
    .has-scrollbar::-webkit-scrollbar-corner {
      background-color: transparent !important;
    }
    .has-scrollbar::-webkit-scrollbar-track {
      margin: 0 !important;
      background-clip: padding-box !important;
    }

    /* — adjust content‐window margins (no top gap, gutter on sides, keep bottom for win7) — */
    .window-body.has-scrollbar {
      margin-top: 0 !important;
      margin-left: ${gutter} !important;
      margin-right: ${gutter} !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  `;

  document.head.appendChild(style);
}

// Cleanup function - called when switching away from the theme
export function cleanup() {
  // The win-theme-css will be removed by the theme system
  // We need to clean up our custom CSS and scrollbar fixes
  document.getElementById("win-custom-css")?.remove();
  document.getElementById("scrollbar-fixes")?.remove();
  console.log("Windows 7 custom CSS and fixes removed");
}

// For module-style loading
export default {
  preload,
  postload,
  cleanup,
};

// For global export style loading (backward compatibility)
window.Win7Decorator = {
  preload,
  postload,
  cleanup,
};

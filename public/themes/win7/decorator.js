// Win7 Decorator Full Example
// ===========================
// This file demonstrates a complete, advanced theme decorator for Windows 7 style themes.
// It combines CSS injection, cleanup logic, and React-based window decorations in one place.
// Use this as a reference for building your own advanced decorators!

// --- 1. CSS & Theme Loader Functions ---

/**
 * Preload the Windows 7 theme CSS and local overrides.
 * Removes any previous theme CSS before loading new ones.
 * @param {string} previousTheme - The previous theme's name (optional)
 * @returns {Promise<boolean>} Resolves true if loaded, false if error
 */
export async function preload(previousTheme) {
  // Remove any existing theme CSS - target by both ID and data-theme attribute
  document.getElementById("win7-theme-css")?.remove();
  document.getElementById("win7-override-css")?.remove();
  document
    .querySelectorAll('link[data-theme="win7"]')
    .forEach((el) => el.remove());

  // Create and append the main Windows 7 CSS
  const link = document.createElement("link");
  link.id = "win7-theme-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/7.css@0.13.0/dist/7.css";
  link.setAttribute("data-theme", "win7");

  return new Promise((resolve) => {
    link.onload = () => {
      console.log("Windows 7 theme CSS loaded");
      // Load local override CSS after main CSS loads
      const overrideLink = document.createElement("link");
      overrideLink.id = "win7-override-css";
      overrideLink.rel = "stylesheet";
      // Resolve win7.css relative to this decorator module
      overrideLink.href = new URL("win7.css", import.meta.url).href;
      overrideLink.setAttribute("data-theme", "win7");
      document.head.appendChild(overrideLink);
      resolve(true);
    };
    link.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

/**
 * Post-load adjustments for Windows 7 theme.
 * Adds custom scrollbar, calculator button, and workflow node fixes.
 */
export function postload() {
  // Remove any previous fixes
  document.getElementById("scrollbar-fixes")?.remove();
  document.getElementById("win7-react-flow-fixes")?.remove();

  // Inject scrollbar fixes
  const style = document.createElement("style");
  style.id = "scrollbar-fixes";
  const gutter = "8px";
  style.textContent = `
    /* Scrollbar and track fixes */
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
    /* Adjust content window margins for Win7 */
    .window-body.has-scrollbar {
      margin-top: 0 !important;
      margin-left: ${gutter} !important;
      margin-right: ${gutter} !important;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  `;
  document.head.appendChild(style);

  // Inject React Flow node fixes for Win7
  const reactFlowFixes = document.createElement("style");
  reactFlowFixes.id = "win7-react-flow-fixes";
  reactFlowFixes.textContent = `
    /* Fix React Flow node interaction in Win7 theme */
    .theme-win7 .react-flow__node {
      pointer-events: all !important;
    }
    
    .theme-win7 .react-flow__node .workflow-node-base,
    .theme-win7 .react-flow__node .node-header,
    .theme-win7 .react-flow__node .node-content,
    .theme-win7 .react-flow__node .node-center-content,
    .theme-win7 .react-flow__node .node-footer {
      pointer-events: all !important;
    }
    
    /* Fix dragging for nodes */
    .theme-win7 .react-flow__node-apiNode,
    .theme-win7 .react-flow__node-apiAppNode,
    .theme-win7 .react-flow__node-beginWorkflow,
    .theme-win7 .react-flow__node-stringPrimitive,
    .theme-win7 .react-flow__node-numberPrimitive,
    .theme-win7 .react-flow__node-dataTypeConversion {
      pointer-events: all !important;
      z-index: 5 !important;
    }
    
    /* Make sure form elements and interactive components work */
    .theme-win7 .react-flow__node input,
    .theme-win7 .react-flow__node select,
    .theme-win7 .react-flow__node button {
      pointer-events: all !important;
    }
    
    /* Ensure pins and handles are interactive */
    .theme-win7 .react-flow__handle {
      pointer-events: all !important;
      cursor: crosshair !important;
      z-index: 10 !important;
    }
  `;
  document.head.appendChild(reactFlowFixes);
}

/**
 * Cleanup function - called when switching away from the theme.
 * Removes all injected CSS and style elements.
 */
export function cleanup() {
  console.log("Win7 cleanup called");

  // Remove CSS elements by ID
  document.getElementById("win7-theme-css")?.remove();
  document.getElementById("win7-override-css")?.remove();
  document.getElementById("scrollbar-fixes")?.remove();
  document.getElementById("win7-react-flow-fixes")?.remove();

  // Also remove any Win7 theme CSS links by attribute selector
  // This is a more robust approach that will catch any links even if IDs were changed
  document
    .querySelectorAll('link[data-theme="win7"]')
    .forEach((el) => el.remove());

  // Catch the specific 7.css URL as a fallback
  document.querySelectorAll('link[href*="7.css"]').forEach((el) => el.remove());
}

// --- 2. React Window Decorations ---

// Import React from CDN for use in decorator modules
import React from "https://esm.sh/react@18.2.0";

/**
 * Win7Controls - Renders Windows 7 style window control buttons (minimize, maximize, close)
 * @param {Object} props - Button handlers
 */
function Win7Controls({ onMinimize, onMaximize, onClose }) {
  return React.createElement(
    "div",
    { className: "window-controls" },
    // Minimize button
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
    // Maximize button
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
    // Close button
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

/**
 * Win7Header - Renders the Windows 7 style window title bar and controls
 * @param {Object} props - Title, handlers, and headerRef for drag
 */
function Win7Header({ title, onMinimize, onMaximize, onClose, headerRef }) {
  return React.createElement(
    "div",
    {
      ref: headerRef,
      className: "window-header win7-header",
      style: {
        cursor: "move",
        pointerEvents: "auto", // Ensure pointer events work
      },
    },
    React.createElement("div", { className: "window-title" }, title),
    React.createElement(Win7Controls, { onMinimize, onMaximize, onClose })
  );
}

// --- 3. Decorator Object ---

/**
 * Win7Decorator - The main decorator object exported for use by the theme system.
 * Includes all hooks and React components for window decorations.
 */
const Win7Decorator = {
  preload, // Called before theme is applied
  postload, // Called after theme is applied
  cleanup, // Called when theme is removed
  Header: Win7Header, // React component for window title bar
  Controls: Win7Controls, // React component for window controls
  borderRadius: 0, // Window border radius (px)
};

// --- 4. Exports ---

// For module-style loading (ESM)
export default Win7Decorator;

/*
====================
How to Use This File
====================

- Place this file in your theme folder (e.g. /themes/win7/decorator.js)
- Reference it in your theme manifest as the "decoratorPath"
- The theme system will automatically call preload/postload/cleanup and use the Header/Controls components for your windows.
- You can customize the Header/Controls or add more logic as needed!

Key Exports:
- preload(previousTheme): Load CSS and prepare the theme
- postload(): Inject extra styles after theme is loaded
- cleanup(): Remove all theme styles
- Header: React component for window title bar
- Controls: React component for window controls
- borderRadius: Window border radius (number)
*/

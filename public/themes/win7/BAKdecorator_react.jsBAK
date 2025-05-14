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
        pointerEvents: "auto", // Ensure pointer events work
      },
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
  // Remove existing Windows theme CSS if present
  document.getElementById("win-theme-css")?.remove();
  // Remove existing override CSS if present
  document.getElementById("win7-override-css")?.remove();

  const link = document.createElement("link");
  link.id = "win-theme-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/7.css@0.13.0/dist/7.css";

  return new Promise((resolve) => {
    link.onload = () => {
      console.log("Windows 7 theme CSS loaded");
      // Load local override CSS
      const overrideLink = document.createElement("link");
      overrideLink.id = "win7-override-css";
      overrideLink.rel = "stylesheet";
      overrideLink.href = "/themes/win7/win7.css";
      document.head.appendChild(overrideLink);
      resolve(true);
    };
    link.onerror = () => {
      console.error("Failed to load Windows 7 theme CSS");
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

// Postload function - called after setting the theme
export function postload() {
  // Add scrollbar fixes for Windows 7
  document.getElementById("scrollbar-fixes")?.remove();

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
  // Add calculator-specific button overrides
  const calcOverrideStyle = document.createElement("style");
  calcOverrideStyle.id = "win7-calc-overrides";
  calcOverrideStyle.textContent = `
    .theme-win7 .calculator-root button {
      box-sizing: border-box !important;
      display: block !important;
      width: 100% !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      padding: 0.5rem !important;
    }
  `;
  document.head.appendChild(calcOverrideStyle);
}

// Cleanup function - called when switching away from the theme
export function cleanup() {
  console.log("Win7 cleanup called");
  document.getElementById("win-theme-css")?.remove();
  // Remove override CSS
  document.getElementById("win7-override-css")?.remove();
  // Remove calculator override style
  document.getElementById("win7-calc-overrides")?.remove();
  document.getElementById("scrollbar-fixes")?.remove();
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

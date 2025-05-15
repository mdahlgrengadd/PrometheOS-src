/**
 * Windows 95 Theme Window Decorator
 * This decorator adds Windows 95 specific styling and behavior to windows
 */

// Import React from CDN for use in decorator modules
import React from "https://esm.sh/react@18.2.0";

/**
 * Preload the Win95 theme CSS
 * @param {string} previousTheme - The previous theme's name (optional)
 * @returns {Promise<boolean>} Resolves true if loaded, false if error
 */
export async function preload(previousTheme) {
  // Remove any existing theme CSS
  document.getElementById("win95-theme-css")?.remove();

  // Create and append the Win95 CSS
  const link = document.createElement("link");
  link.id = "win95-theme-css";
  link.rel = "stylesheet";
  link.href = "/themes/win95/win95.css";

  return new Promise((resolve) => {
    link.onload = () => {
      console.log("Win95 theme CSS loaded");
      resolve(true);
    };
    link.onerror = () => {
      console.error("Failed to load Win95 theme CSS");
      resolve(false);
    };
    document.head.appendChild(link);
  });
}

/**
 * Post-load adjustments for Win95 theme
 * Applies additional styling after the theme is loaded
 */
export function postload() {
  console.log("Win95 theme post-load");
  // Add any post-load adjustments if needed
}

/**
 * Cleanup function - called when switching away from the theme
 * Removes all injected CSS and style elements
 */
export function cleanup() {
  console.log("Win95 cleanup called");
  document.getElementById("win95-theme-css")?.remove();
}

/**
 * Win95Controls - Renders Windows 95 style window control buttons
 * @param {Object} props - Button handlers
 */
function Win95Controls({ onMinimize, onMaximize, onClose }) {
  return React.createElement(
    "div",
    { className: "window-controls" },
    // Minimize button
    React.createElement(
      "button",
      {
        className: "window-control window-minimize",
        onClick: onMinimize,
        "aria-label": "Minimize",
        style: {
          backgroundColor: "var(--wm-btn-minimize-bg)",
          width: "16px",
          height: "14px",
          margin: "0 1px",
          border: "1px solid #000",
          fontFamily: "Arial",
          fontSize: "9px",
          fontWeight: "bold",
          lineHeight: "14px",
          textAlign: "center",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
          cursor: "pointer",
        },
      },
      "_"
    ),
    // Maximize button
    React.createElement(
      "button",
      {
        className: "window-control window-maximize",
        onClick: onMaximize,
        "aria-label": "Maximize",
        style: {
          backgroundColor: "var(--wm-btn-maximize-bg)",
          width: "16px",
          height: "14px",
          margin: "0 1px",
          border: "1px solid #000",
          fontFamily: "Arial",
          fontSize: "9px",
          fontWeight: "bold",
          lineHeight: "14px",
          textAlign: "center",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
          cursor: "pointer",
        },
      },
      "□"
    ),
    // Close button
    React.createElement(
      "button",
      {
        className: "window-control window-close",
        onClick: onClose,
        "aria-label": "Close",
        style: {
          backgroundColor: "var(--wm-btn-close-bg)",
          width: "16px",
          height: "14px",
          margin: "0 1px",
          border: "1px solid #000",
          fontFamily: "Arial",
          fontSize: "9px",
          fontWeight: "bold",
          lineHeight: "14px",
          textAlign: "center",
          boxShadow:
            "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px grey, inset 2px 2px #dfdfdf",
          cursor: "pointer",
        },
      },
      "X"
    )
  );
}

/**
 * Win95Header - Renders the Windows 95 style window title bar with controls
 * @param {Object} props - Title, handlers, and headerRef for drag
 */
function Win95Header({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
  icon,
}) {
  return React.createElement(
    "div",
    {
      ref: headerRef,
      className: "window-header win95-header",
      style: {
        cursor: "move",
        backgroundColor: "var(--window-header-background)",
        color: "var(--window-header-text)",
        height: "var(--wm-header-height)",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        fontWeight: "bold",
      },
    },
    // Window icon if provided
    icon &&
      React.createElement("div", {
        className: "window-icon",
        style: {
          backgroundImage: `url(${icon})`,
          width: "16px",
          height: "16px",
          marginRight: "4px",
        },
      }),
    React.createElement("div", { className: "window-title" }, title),
    React.createElement(Win95Controls, { onMinimize, onMaximize, onClose })
  );
}

// Create the main decorator object
const Win95Decorator = {
  preload, // Called before theme is applied
  postload, // Called after theme is applied
  cleanup, // Called when theme is removed
  Header: Win95Header, // React component for window title bar
  Controls: Win95Controls, // React component for window controls
  borderRadius: 0, // Window border radius (px)
};

// Export as ESM only
export default Win95Decorator;

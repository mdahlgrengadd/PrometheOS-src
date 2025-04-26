// My Cool Theme Decorator
// This file defines custom window decorations

class CoolThemeDecorator {
  // Window header component
  static Header = ({ title, onMinimize, onMaximize, onClose, headerRef }) => {
    return React.createElement(
      "div",
      {
        ref: headerRef,
        className: "cool-theme-header window-header",
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 8px",
        },
      },
      [
        // Title area
        React.createElement(
          "div",
          {
            className: "cool-theme-title",
            key: "title",
            style: {
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },
          },
          title
        ),

        // Controls
        React.createElement(
          "div",
          {
            className: "cool-theme-controls",
            key: "controls",
            style: { display: "flex", gap: "8px" },
          },
          [
            React.createElement(
              "button",
              {
                onClick: onMinimize,
                key: "minimize",
                title: "Minimize",
                style: { cursor: "pointer" },
              },
              "1"
            ),
            React.createElement(
              "button",
              {
                onClick: onMaximize,
                key: "maximize",
                title: "Maximize",
                style: { cursor: "pointer" },
              },
              "2"
            ),
            React.createElement(
              "button",
              {
                onClick: onClose,
                key: "close",
                title: "Close",
                style: { cursor: "pointer" },
              },
              "3"
            ),
          ]
        ),
      ]
    );
  };

  // Window controls component (used in other contexts)
  static Controls = ({ onMinimize, onMaximize, onClose }) => {
    return React.createElement(
      "div",
      {
        className: "cool-theme-controls",
        style: { display: "flex", gap: "8px" },
      },
      [
        React.createElement(
          "button",
          {
            onClick: onMinimize,
            key: "minimize",
            title: "Minimize",
            style: { cursor: "pointer" },
          },
          "—"
        ),
        React.createElement(
          "button",
          {
            onClick: onMaximize,
            key: "maximize",
            title: "Maximize",
            style: { cursor: "pointer" },
          },
          "□"
        ),
        React.createElement(
          "button",
          {
            onClick: onClose,
            key: "close",
            title: "Close",
            style: { cursor: "pointer" },
          },
          "×"
        ),
      ]
    );
  };

  // Border radius for windows
  static borderRadius = 8;
}

// Export to window object
window.CoolThemeDecorator = CoolThemeDecorator;

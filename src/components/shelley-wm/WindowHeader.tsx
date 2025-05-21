import { Grip } from "lucide-react";
import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { getDecorator, getDecoratorFromConfig } from "@/lib/window-decorators";

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  controls?: Array<"minimize" | "maximize" | "close">;
  showButtonLabels?: boolean;
  showButtonIcons?: boolean;
}

// Refactored window controls into a functional component
const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
  controls = ["minimize", "maximize", "close"],
  showButtonLabels = false,
  showButtonIcons = false,
}) => {
  const { theme } = useTheme();
  const isBeOSTheme = theme === "beos";

  const renderControl = (control: "minimize" | "maximize" | "close") => {
    const handler =
      control === "minimize"
        ? onMinimize
        : control === "maximize"
        ? onMaximize
        : onClose;

    let bgColor: string;
    switch (control) {
      case "minimize":
        bgColor = "var(--wm-btn-minimize-bg, #f1c40f)";
        break;
      case "maximize":
        bgColor = "var(--wm-btn-maximize-bg, #2ecc71)";
        break;
      case "close":
        bgColor = "var(--wm-btn-close-bg, #e74c3c)";
        break;
    }
    return (
      <button
        key={control}
        className="window-control"
        onClick={handler}
        aria-label={control.charAt(0).toUpperCase() + control.slice(1)}
        style={{ backgroundColor: bgColor }}
      />
    );
  };

  return <div className="window-controls">{controls.map(renderControl)}</div>;
};

interface WindowHeaderProps {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
  isMaximized?: boolean;
  controls?: Array<"minimize" | "maximize" | "close">;
  controlsPosition?: "left" | "right";
  showButtonLabels?: boolean;
  showButtonImages?: boolean;
}

export const WindowHeader: React.FC<WindowHeaderProps> = (props) => {
  const { theme, themes } = useTheme();
  const {
    title,
    onMinimize,
    onMaximize,
    onClose,
    headerRef,
    isMaximized,
    controls = ["minimize", "maximize", "close"],
    controlsPosition = "right",
    showButtonLabels = false,
  } = props;

  // Get the current theme's config
  const themeConfig = themes[theme];

  // Use getDecoratorFromConfig if we have external themes
  const decorator = getDecoratorFromConfig(theme, themeConfig);

  // For BeOS theme, hide the in-window header when maximized
  // The global tab bar will serve as the header
  if (theme === "beos" && isMaximized) {
    return null;
  }

  // If the theme has a custom header component, use it
  if (decorator.Header) {
    // Forward the ref and other props to the custom header
    const CustomHeader = decorator.Header;
    return (
      <div data-draggable="true" ref={headerRef} style={{ width: "100%" }}>
        <CustomHeader {...props} />
      </div>
    );
  }

  // Otherwise, provide a default header implementation
  return (
    <div
      className="window-header flex items-center justify-between p-2 w-full"
      data-draggable="true"
      ref={headerRef}
      style={{
        cursor: "move",
        userSelect: "none", // Prevent text selection during drag
        touchAction: "none", // Prevent default touch actions
        pointerEvents: "auto", // Ensure pointer events work properly
        width: "100%",
        boxSizing: "border-box",
        borderTopLeftRadius: "inherit",
        borderTopRightRadius: "inherit",
        background: "var(--wm-header-bg, var(--background, #f8f9fa))",
      }}
    >
      {controlsPosition === "left" && (
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          controls={controls}
        />
      )}

      <div className="window-title flex-1 text-center">{title}</div>

      {controlsPosition === "right" && (
        <WindowControls
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onClose={onClose}
          controls={controls}
        />
      )}
    </div>
  );
};

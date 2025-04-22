import { Grip } from "lucide-react";
import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { getDecorator } from "@/lib/window-decorators";

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

// Refactored window controls into a functional component
const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="window-controls">
      <button
        className="window-control"
        onClick={onMinimize}
        aria-label="Minimize"
        style={{ backgroundColor: "var(--wm-btn-minimize-bg, #f1c40f)" }}
      >
        <div className="h-1 w-2.5 bg-black/60 rounded-none"></div>
      </button>

      <button
        className="window-control"
        onClick={onMaximize}
        aria-label="Maximize"
        style={{ backgroundColor: "var(--wm-btn-maximize-bg, #2ecc71)" }}
      >
        <div className="h-2.5 w-2.5 border border-black/60"></div>
      </button>

      <button
        className="window-control"
        onClick={onClose}
        aria-label="Close"
        style={{ backgroundColor: "var(--wm-btn-close-bg, #e74c3c)" }}
      >
        <div className="h-2.5 w-2.5 relative">
          <div className="absolute w-3 h-0.5 bg-black/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          <div className="absolute w-3 h-0.5 bg-black/60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
        </div>
      </button>
    </div>
  );
};

interface WindowHeaderProps {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
}

export const WindowHeader: React.FC<WindowHeaderProps> = (props) => {
  const { theme } = useTheme();
  const decorator = getDecorator(theme);

  // Use the theme-specific Header component from our decorator
  return <decorator.Header {...props} />;
};

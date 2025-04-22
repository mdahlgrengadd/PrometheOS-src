import { Grip } from "lucide-react";
import React from "react";

// Types for the window decorator components
export interface HeaderProps {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
}

export interface ControlProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export interface WindowDecorator {
  Header: React.FC<HeaderProps>;
  Controls: React.FC<ControlProps>;
  borderRadius: number;
}

// Standard Window Controls shared across themes
const StandardControls: React.FC<ControlProps> = ({
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

// BeOS Theme
const BeOSHeader: React.FC<HeaderProps> = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
}) => {
  return (
    <div ref={headerRef} className="window-header beos-header">
      <div className="window-title">{title}</div>
      <StandardControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

// Modern Header (Light/Dark)
const ModernHeader: React.FC<HeaderProps> = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
}) => {
  return (
    <div ref={headerRef} className="window-header modern-header">
      <div className="flex items-center gap-2">
        <Grip className="h-4 w-4 text-muted-foreground/50" />
        <div className="window-title">{title}</div>
      </div>
      <StandardControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

// Windows Theme Controls
const WindowsControls: React.FC<ControlProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="window-controls windows-controls">
      <button
        className="window-control"
        onClick={onMinimize}
        aria-label="Minimize"
      >
        <div className="h-0.5 w-2.5 bg-white"></div>
      </button>

      <button
        className="window-control"
        onClick={onMaximize}
        aria-label="Maximize"
      >
        <div className="h-2.5 w-2.5 border border-white"></div>
      </button>

      <button className="window-control" onClick={onClose} aria-label="Close">
        <div className="h-2.5 w-2.5 relative">
          <div className="absolute w-3 h-0.5 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          <div className="absolute w-3 h-0.5 bg-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
        </div>
      </button>
    </div>
  );
};

// Windows Theme Header
const WindowsHeader: React.FC<HeaderProps> = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
}) => {
  return (
    <div ref={headerRef} className="window-header windows-header">
      <div className="window-title">{title}</div>
      <WindowsControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

// macOS Theme Controls (traffic light style)
const MacOSControls: React.FC<ControlProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div className="window-controls macos-controls">
      <button
        className="window-control"
        onClick={onClose}
        aria-label="Close"
        style={{ backgroundColor: "var(--wm-btn-close-bg, #ff5f56)" }}
      >
        <div className="h-2.5 w-2.5 relative">
          <div className="absolute w-2 h-0.5 bg-black/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          <div className="absolute w-2 h-0.5 bg-black/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
        </div>
      </button>

      <button
        className="window-control"
        onClick={onMinimize}
        aria-label="Minimize"
        style={{ backgroundColor: "var(--wm-btn-minimize-bg, #ffbd2e)" }}
      >
        <div className="h-0.5 w-2 bg-black/40"></div>
      </button>

      <button
        className="window-control"
        onClick={onMaximize}
        aria-label="Maximize"
        style={{ backgroundColor: "var(--wm-btn-maximize-bg, #28c941)" }}
      >
        <div className="h-2 w-2 border border-black/40"></div>
      </button>
    </div>
  );
};

// macOS Theme Header
const MacOSHeader: React.FC<HeaderProps> = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
}) => {
  return (
    <div ref={headerRef} className="window-header macos-header">
      <MacOSControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
      <div className="window-title text-center">{title}</div>
    </div>
  );
};

// Define the decorator objects for each theme
export const beosDecorator: WindowDecorator = {
  Header: BeOSHeader,
  Controls: StandardControls,
  borderRadius: 0,
};

export const lightDecorator: WindowDecorator = {
  Header: ModernHeader,
  Controls: StandardControls,
  borderRadius: 4,
};

export const darkDecorator: WindowDecorator = {
  Header: ModernHeader,
  Controls: StandardControls,
  borderRadius: 4,
};

export const windowsDecorator: WindowDecorator = {
  Header: WindowsHeader,
  Controls: WindowsControls,
  borderRadius: 0,
};

export const macosDecorator: WindowDecorator = {
  Header: MacOSHeader,
  Controls: MacOSControls,
  borderRadius: 8,
};

// Get the correct decorator based on theme
export const getDecorator = (theme: string): WindowDecorator => {
  switch (theme) {
    case "beos":
      return beosDecorator;
    case "windows":
      return windowsDecorator;
    case "macos":
      return macosDecorator;
    case "dark":
      return darkDecorator;
    case "light":
    default:
      return lightDecorator;
  }
};

import { Minus, Square, X } from 'lucide-react';
import React from 'react';

import { useTheme } from '@/lib/ThemeProvider';
import { cn } from '@/lib/utils';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
}) => {
  const { theme } = useTheme();
  const isBeOSTheme = theme === "beos";

  const handleClick = (e: React.MouseEvent, handler: () => void) => {
    e.stopPropagation();
    handler();
  };

  // BeOS style controls
  if (isBeOSTheme) {
    return (
      <div className="window-controls">
        <button
          className="window-control"
          onClick={(e) => handleClick(e, onMinimize)}
          aria-label="Minimize"
        >
          <div className="h-2 w-2 bg-black rounded-none"></div>
        </button>
        <button
          className="window-control"
          onClick={(e) => handleClick(e, onMaximize)}
          aria-label="Maximize"
        >
          <div className="h-2.5 w-2.5 border border-black"></div>
        </button>
        <button
          className="window-control"
          onClick={(e) => handleClick(e, onClose)}
          aria-label="Close"
        >
          <div className="h-2.5 w-2.5 relative">
            <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
          </div>
        </button>
      </div>
    );
  }

  // Modern light/dark theme controls
  return (
    <div className="window-controls">
      <button
        className={cn("window-control bg-yellow-500 hover:bg-yellow-400")}
        onClick={(e) => handleClick(e, onMinimize)}
        aria-label="Minimize"
      >
        <Minus className="h-3 w-3 text-yellow-950/70" />
      </button>
      <button
        className={cn("window-control bg-green-500 hover:bg-green-400")}
        onClick={(e) => handleClick(e, onMaximize)}
        aria-label="Maximize"
      >
        <Square className="h-3 w-3 text-green-950/70" />
      </button>
      <button
        className={cn("window-control bg-red-500 hover:bg-red-400")}
        onClick={(e) => handleClick(e, onClose)}
        aria-label="Close"
      >
        <X className="h-3 w-3 text-red-950/70" />
      </button>
    </div>
  );
};

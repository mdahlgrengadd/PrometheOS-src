
import React from 'react';
import { Minus, Square, X } from 'lucide-react';

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
  const handleClick = (e: React.MouseEvent, handler: () => void) => {
    e.stopPropagation();
    handler();
  };

  return (
    <div className="window-controls">
      <button
        className="window-control"
        onClick={(e) => handleClick(e, onMinimize)}
        aria-label="Minimize"
      >
        <Minus className="h-2.5 w-2.5 text-black" />
      </button>
      <button
        className="window-control"
        onClick={(e) => handleClick(e, onMaximize)}
        aria-label="Maximize"
      >
        <Square className="h-2.5 w-2.5 text-black" />
      </button>
      <button
        className="window-control"
        onClick={(e) => handleClick(e, onClose)}
        aria-label="Close"
      >
        <X className="h-2.5 w-2.5 text-black" />
      </button>
    </div>
  );
};

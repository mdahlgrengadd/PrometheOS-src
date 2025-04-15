import React from 'react';

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
        {/* BeOS-style minimize icon */}
        <div className="h-2 w-2 bg-black rounded-none"></div>
      </button>
      <button
        className="window-control"
        onClick={(e) => handleClick(e, onMaximize)}
        aria-label="Maximize"
      >
        {/* BeOS-style maximize icon */}
        <div className="h-2.5 w-2.5 border border-black"></div>
      </button>
      <button
        className="window-control"
        onClick={(e) => handleClick(e, onClose)}
        aria-label="Close"
      >
        {/* BeOS-style close (X) icon */}
        <div className="h-2.5 w-2.5 relative">
          <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
          <div className="absolute w-3 h-0.5 bg-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
        </div>
      </button>
    </div>
  );
};


import React, { useEffect } from 'react';
import { WindowProps } from '../types/Window';

interface ExtendedWindowProps extends WindowProps {
  onUpdateInScene: (window: any) => void;
  hideReactWindow?: boolean;
}

const Window3D: React.FC<ExtendedWindowProps> = ({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdateInScene,
  hideReactWindow = true,
}) => {
  useEffect(() => {
    if (!window.isMinimized) {
      // Update the 3D scene representation
      onUpdateInScene(window);
    }
  }, [window, onUpdateInScene]);

  // Always return null since we only use CSS3D windows now
  if (window.isMinimized || hideReactWindow) {
    return null;
  }

  return null; // Never render React windows anymore
};

export default Window3D;

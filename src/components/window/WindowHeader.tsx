
import React from 'react';
import { WindowControls } from './WindowControls';

interface WindowHeaderProps {
  title: string;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  title,
  onMinimize,
  onMaximize,
  onClose,
  headerRef,
}) => {
  return (
    <div ref={headerRef} className="window-header">
      <div className="window-title">{title}</div>
      <WindowControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

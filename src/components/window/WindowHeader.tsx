import React from 'react';
import { Grip } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
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
  const { theme } = useTheme();
  const isBeOSTheme = theme === 'beos';

  return (
    <div ref={headerRef} className="window-header">
      {!isBeOSTheme && (
        <div className="flex items-center gap-2">
          <Grip className="h-4 w-4 text-muted-foreground/50" />
          <div className="window-title">{title}</div>
        </div>
      )}
      {isBeOSTheme && (
        <div className="window-title">{title}</div>
      )}
      <WindowControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
      />
    </div>
  );
};

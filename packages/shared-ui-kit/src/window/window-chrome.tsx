// Simplified Window Chrome Component for Module Federation
import React from 'react';
import { Button } from '../ui/button';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '../lib/utils';

interface WindowChromeProps {
  title: string;
  isMaximized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const WindowChrome: React.FC<WindowChromeProps> = ({
  title,
  isMaximized = false,
  onClose,
  onMinimize,
  onMaximize,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Window Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-background border-b select-none">
        <h3 className="text-sm font-medium truncate">{title}</h3>
        <div className="flex items-center gap-1">
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
          {onMaximize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMaximize}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              <Square className={cn('h-3 w-3', isMaximized && 'fill-current')} />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
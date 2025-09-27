// Simplified Window Container for Module Federation
import React from 'react';
import { cn } from '../lib/utils';

interface WindowContainerProps {
  children: React.ReactNode;
  className?: string;
  isMaximized?: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export const WindowContainer: React.FC<WindowContainerProps> = ({
  children,
  className,
  isMaximized = false,
  position = { x: 0, y: 0 },
  size = { width: 800, height: 600 },
}) => {
  const style: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
      }
    : {
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: 100,
      };

  return (
    <div
      className={cn(
        'bg-background border rounded-lg shadow-lg overflow-hidden',
        'resize-none select-none',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};
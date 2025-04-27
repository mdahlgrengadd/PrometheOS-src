import React from 'react';

import { useTheme } from '@/lib/ThemeProvider';
import { cn } from '@/lib/utils';

interface TaskbarProps {
  children?: React.ReactNode;
  className?: string;
}

export function WindowsTaskbar({ children, className }: TaskbarProps) {
  const { theme } = useTheme();

  // Fix status-bar class based on theme
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 animate-taskbar-slide hardware-accelerated",
        className
      )}
    >
      <div className="w-full flex items-center justify-between px-2 py-1">
        {children}
      </div>
    </div>
  );
}

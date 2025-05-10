import React from 'react';
import { useTheme } from '@/lib/ThemeProvider';
import { cn } from '@/lib/utils';

interface WindowContentProps {
  children: React.ReactNode;
  className?: string;
}

export const WindowContent: React.FC<WindowContentProps> = ({ children, className }) => {
  const { theme } = useTheme();
  const isWindowsTheme = ['win98', 'winxp', 'win7'].includes(theme);
  
  return (
    <div 
      className={cn(
        "window-content",
        isWindowsTheme ? "has-scrollbar" : "",
        "window-body", // Add window-body for Windows themes
        className
      )}
    >
      {children}
    </div>
  );
};

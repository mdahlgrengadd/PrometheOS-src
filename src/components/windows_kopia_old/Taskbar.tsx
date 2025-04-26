import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

export interface TaskbarProps extends React.HTMLAttributes<HTMLDivElement> {
  startButton?: React.ReactNode;
  children?: React.ReactNode;
  onWindowClick?: (id: string) => void;
}

export function WindowsTaskbar({
  startButton,
  children,
  className,
  onWindowClick,
  ...props
}: TaskbarProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn("status-bar", "animate-taskbar-slide", className)}
      {...props}
    >
      {startButton && <div className="status-bar-field">{startButton}</div>}
      {children}
    </div>
  );
}

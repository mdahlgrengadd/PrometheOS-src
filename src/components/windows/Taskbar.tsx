import React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";

interface TaskbarProps {
  children?: React.ReactNode;
  className?: string;
}

export function WindowsTaskbar({ children, className }: TaskbarProps) {
  const { theme } = useWindowsTheme();

  // Fix status-bar class based on theme
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 animate-taskbar-slide hardware-accelerated",
        theme === "win98"
          ? "status-bar"
          : theme === "winxp"
          ? "status-bar"
          : "status-bar",
        className
      )}
    >
      <div className="w-full flex items-center justify-between px-2 py-1">
        {children}
      </div>
    </div>
  );
}

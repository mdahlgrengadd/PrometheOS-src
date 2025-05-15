import * as React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getWindowsClasses } from "@/lib/windows-theme-utils";

export interface WindowsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Any additional Windows-specific props can be added here
}

/**
 * Windows-themed Input component that adapts to the current theme
 */
export const WindowsInput = React.forwardRef<HTMLInputElement, WindowsInputProps>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme();
    const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

    return (
      <Input
        ref={ref}
        className={cn(
          isWindowsTheme ? getWindowsClasses("windows-input", theme, className) : className
        )}
        {...props}
      />
    );
  }
);

WindowsInput.displayName = "WindowsInput";

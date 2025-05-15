import * as React from "react";

import { Button as ShadcnButton, ButtonProps } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import { getWindowsClasses } from "@/lib/windows-theme-utils";

export interface WindowsButtonProps extends ButtonProps {
  // Any additional Windows-specific props can be added here
}

/**
 * Windows-themed Button component that adapts to the current theme
 */
export const Button = React.forwardRef<HTMLButtonElement, WindowsButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const { theme } = useTheme();
    const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

    return (
      <ShadcnButton
        ref={ref}
        variant={isWindowsTheme ? "outline" : variant}
        size={size}
        className={cn(
          isWindowsTheme
            ? getWindowsClasses("windows-btn", theme, className)
            : className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "WindowsButton";

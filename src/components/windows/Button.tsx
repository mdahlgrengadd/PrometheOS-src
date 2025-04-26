import React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function WindowsButton({
  className,
  asChild = false,
  ...props
}: ButtonProps) {
  const { theme } = useWindowsTheme();
  const Comp = asChild ? Slot : "button";

  // Fix theme class mapping
  const themeClass =
    theme === "win98"
      ? "button" // Changed from "window-button" to "button"
      : theme === "winxp"
      ? "window-button"
      : "button";

  return <Comp className={cn(themeClass, className)} {...props} />;
}

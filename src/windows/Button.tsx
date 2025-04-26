import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
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
  const { theme } = useTheme();
  const Comp = asChild ? Slot : "button";

  // Fix theme class mapping
  const themeClass =
    theme === "win98"
      ? "button"
      : theme === "winxp"
      ? "window-button"
      : "button";

  return <Comp className={cn(themeClass, className)} {...props} />;
}

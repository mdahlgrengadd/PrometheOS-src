import React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function WindowsCheckbox({
  label,
  className,
  id,
  ...props
}: CheckboxProps) {
  const { theme } = useWindowsTheme();
  const checkboxId =
    id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={cn("flex items-center", className)}>
      <input type="checkbox" id={checkboxId} {...props} />
      {label && (
        <label
          htmlFor={checkboxId}
          className={
            theme === "win98" ? "ml-1" : theme === "winxp" ? "ml-1" : "ml-1"
          }
        >
          {label}
        </label>
      )}
    </div>
  );
}

import * as React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function WindowsCheckbox({
  className,
  label,
  id,
  ...props
}: CheckboxProps) {
  const { theme } = useTheme();
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className={cn("flex items-center", className)}>
      <input
        type="checkbox"
        id={checkboxId}
        className={cn(theme === "win98" ? "checkbox" : "")}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className="ml-2 text-sm">
          {label}
        </label>
      )}
    </div>
  );
}

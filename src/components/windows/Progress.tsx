import * as React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";
import * as ProgressPrimitive from "@radix-ui/react-progress";

export interface WinProgressProps
  extends React.ComponentPropsWithoutRef<"div"> {
  value: number;
  error?: boolean;
  paused?: boolean;
  animate?: boolean;
  indeterminate?: boolean;
}
export function WinProgress({
  value,
  error,
  paused,
  animate,
  indeterminate,
  className,
  ...rest
}: WinProgressProps) {
  const { theme } = useWindowsTheme();

  if (theme === "win98") {
    // 98.css → .progress-indicator + <span>
    return (
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ height: "16px" }}
        className={cn(
          "progress-indicator",
          paused && "paused",
          error && "error",
          (animate || indeterminate) && "marquee",
          className
        )}
        {...rest}
      >
        {!indeterminate && (
          <span
            className="progress-indicator-bar"
            style={{ width: `${value}%`, height: "100%" }}
          />
        )}
      </div>
    );
  }

  if (theme === "winxp") {
    // HTML progress without value is indeterminate
    return (
      <progress
        max={100}
        {...(indeterminate ? {} : { value })}
        style={{ display: "block", width: "100%" }}
        className={cn(paused && "paused", error && "error", className)}
        {...rest}
      />
    );
  }

  // Win 7 → div + Radix primitive / div nesting
  return (
    <ProgressPrimitive.Root
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "progress",
        paused && "paused",
        error && "error",
        (animate || indeterminate) && "marquee",
        className
      )}
      {...rest}
    >
      {!indeterminate && (
        <ProgressPrimitive.Indicator style={{ width: `${value}%` }} />
      )}
    </ProgressPrimitive.Root>
  );
}

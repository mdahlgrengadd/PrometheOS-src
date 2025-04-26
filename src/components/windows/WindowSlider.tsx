import * as React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";

export interface WindowSliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * "horizontal" (default) or "vertical" orientation
   */
  orientation?: "horizontal" | "vertical";
}

export const WindowSlider = React.forwardRef<
  HTMLInputElement,
  WindowSliderProps
>(({ className, orientation = "horizontal", style, ...props }, ref) => {
  const { theme } = useWindowsTheme();
  const isVertical = orientation === "vertical";

  // wrapper uses theme's vertical class if needed
  const wrapperCls = cn(
    isVertical
      ? "is-vertical inline-block px-[16px]" // padding instead of overflow-hidden to keep thumb visible
      : "inline-block",
    className
  );

  // input sizing: full width for horizontal, full height (slider length) for vertical
  const inputCls = cn(
    "appearance-none",
    isVertical ? "h-full w-5" : "w-full h-5"
  );

  // Firefox orient attr for vertical slider
  const orientAttr = isVertical ? { orient: "vertical" as const } : {};

  return (
    <div className={wrapperCls} style={style}>
      <input
        ref={ref}
        type="range"
        className={inputCls}
        {...orientAttr}
        {...props}
      />
    </div>
  );
});
WindowSlider.displayName = "WindowSlider";

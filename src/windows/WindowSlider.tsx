import * as React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

export interface WindowSliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  orientation?: "horizontal" | "vertical";
  onValueChange?: (value: number) => void;
}

export function WindowsSlider({
  className,
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  orientation = "horizontal",
  onValueChange,
  id,
  ...props
}: WindowSliderProps) {
  const { theme } = useTheme();
  const generatedId = React.useId();
  const sliderId = id || generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col h-32" : "items-center",
        className
      )}
    >
      {label && (
        <label
          htmlFor={sliderId}
          className={cn(
            "text-sm",
            orientation === "vertical" ? "mb-2" : "mr-2"
          )}
        >
          {label}
        </label>
      )}
      <input
        type="range"
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          "range",
          orientation === "vertical" &&
            theme === "win7" &&
            "-rotate-90 origin-left mt-16"
        )}
        style={
          orientation === "vertical" && theme !== "win7"
            ? {
                WebkitAppearance: "slider-vertical",
                height: "100%",
              }
            : undefined
        }
        {...props}
      />
    </div>
  );
}

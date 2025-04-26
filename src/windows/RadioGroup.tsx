import * as React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import * as RadioGroupPrimitive from "@radix-ui/react-slot";

export interface RadioGroupProps {
  options: Array<{
    id?: string;
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function WindowsRadioGroup({
  options,
  name,
  value,
  defaultValue,
  onChange,
  className,
  orientation = "vertical",
}: RadioGroupProps) {
  const { theme } = useTheme();
  const generatedId = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <fieldset
      className={cn(
        "radio-group",
        orientation === "horizontal" && "flex gap-4",
        className
      )}
    >
      {options.map((option, index) => {
        const radioId = option.id || `${name}-${generatedId}-${index}`;

        return (
          <div
            key={radioId}
            className={cn(
              "flex items-center",
              orientation === "vertical" && "mb-2"
            )}
          >
            <input
              type="radio"
              id={radioId}
              name={name}
              value={option.value}
              checked={value === option.value}
              defaultChecked={defaultValue === option.value}
              disabled={option.disabled}
              onChange={handleChange}
              className={theme === "win98" ? "radio-input" : ""}
            />
            <label htmlFor={radioId} className="ml-2 text-sm">
              {option.label}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

import * as React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import * as SwitchPrimitives from "@radix-ui/react-switch";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  label?: string;
}

export function WindowsSwitch({ className, label, id, ...props }: SwitchProps) {
  const { theme } = useTheme();
  const generatedId = React.useId();
  const switchId = id || generatedId;

  if (theme === "win98") {
    return (
      <div className={cn("flex items-center", className)}>
        <input
          type="checkbox"
          id={switchId}
          className="checkbox"
          checked={props.checked}
          defaultChecked={props.defaultChecked}
          onChange={(e) => props.onCheckedChange?.(e.target.checked)}
          disabled={props.disabled}
        />
        {label && (
          <label htmlFor={switchId} className="ml-2 text-sm">
            {label}
          </label>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <SwitchPrimitives.Root
        id={switchId}
        className={cn(
          theme === "winxp"
            ? "rounded border border-gray-400 bg-gray-200 w-10 h-5 relative"
            : "inline-flex h-[24px] w-[44px] shrink-0 cursor-default items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          className
        )}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            theme === "winxp"
              ? "block w-4 h-4 rounded bg-white border border-gray-400 shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
              : "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitives.Root>
      {label && (
        <label htmlFor={switchId} className="ml-2 text-sm">
          {label}
        </label>
      )}
    </div>
  );
}

WindowsSwitch.displayName = "WindowsSwitch";

// src/components/windows/Tabs.tsx
import * as React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";

const WindowsTabs = TabsPrimitive.Root;

const WindowsTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        theme === "win98" ? "tabs" : theme === "winxp" ? "tabs" : "tabs",
        className
      )}
      {...props}
    />
  );
});
WindowsTabsList.displayName = TabsPrimitive.List.displayName;

const WindowsTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        theme === "win98" ? "tab" : theme === "winxp" ? "tab" : "tab",
        "data-[state=active]:active",
        className
      )}
      {...props}
    />
  );
});
WindowsTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const WindowsTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn("window-body has-scrollbar", className)}
      {...props}
    />
  );
});
WindowsTabsContent.displayName = TabsPrimitive.Content.displayName;

export { WindowsTabs, WindowsTabsList, WindowsTabsTrigger, WindowsTabsContent };

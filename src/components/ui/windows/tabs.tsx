import * as React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getWindowsClasses } from "@/lib/windows-theme-utils";

// Windows-themed TabsList component
export const WindowsTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <TabsList
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-tabs-list", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsTabsList.displayName = "WindowsTabsList";

// Windows-themed TabsTrigger component
export const WindowsTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <TabsTrigger
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-tabs-trigger", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsTabsTrigger.displayName = "WindowsTabsTrigger";

// Windows-themed TabsContent component
export const WindowsTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsContent>,
  React.ComponentPropsWithoutRef<typeof TabsContent>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <TabsContent
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-tabs-content", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsTabsContent.displayName = "WindowsTabsContent";

// Export regular Tabs since it's just a context provider
export { Tabs };

import * as React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getWindowsClasses } from "@/lib/windows-theme-utils";

// Window-themed Select trigger component
export const WindowsSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <SelectTrigger
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-select-trigger", theme, className) : className
      )}
      {...props}
    >
      {children}
    </SelectTrigger>
  );
});
WindowsSelectTrigger.displayName = "WindowsSelectTrigger";

// Window-themed Select content component
export const WindowsSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ className, children, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <SelectContent
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-select-content", theme, className) : className
      )}
      {...props}
    >
      {children}
    </SelectContent>
  );
});
WindowsSelectContent.displayName = "WindowsSelectContent";

// Export pre-composed WindowsSelect with appropriate styling
export function WindowsSelect({
  children,
  triggerClassName,
  contentClassName,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Select>, "className"> & {
  triggerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <Select {...props}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        
        // Replace SelectTrigger with WindowsSelectTrigger
        if (child.type === SelectTrigger) {
          return <WindowsSelectTrigger className={triggerClassName} {...child.props} />;
        }
        
        // Replace SelectContent with WindowsSelectContent
        if (child.type === SelectContent) {
          return <WindowsSelectContent className={contentClassName} {...child.props} />;
        }
        
        return child;
      })}
    </Select>
  );
}

// Export other components as is
export {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue
};

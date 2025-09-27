import * as React from "react";
import { useTheme } from "@/lib/ThemeProvider";
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getWindowsClasses } from "@/lib/windows-theme-utils";

// Windows-themed Card component
export const WindowsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <Card
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCard.displayName = "WindowsCard";

// Windows-themed CardHeader component
export const WindowsCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <CardHeader
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card-header", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCardHeader.displayName = "WindowsCardHeader";

// Windows-themed CardTitle component
export const WindowsCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <CardTitle
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card-title", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCardTitle.displayName = "WindowsCardTitle";

// Windows-themed CardDescription component
export const WindowsCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <CardDescription
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card-description", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCardDescription.displayName = "WindowsCardDescription";

// Windows-themed CardContent component
export const WindowsCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <CardContent
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card-content", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCardContent.displayName = "WindowsCardContent";

// Windows-themed CardFooter component
export const WindowsCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <CardFooter
      ref={ref}
      className={cn(
        isWindowsTheme ? getWindowsClasses("windows-card-footer", theme, className) : className
      )}
      {...props}
    />
  );
});
WindowsCardFooter.displayName = "WindowsCardFooter";

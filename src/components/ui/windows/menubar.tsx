import { cva, VariantProps } from 'class-variance-authority';
import * as React from 'react';

import {
    Menubar as BaseMenubar, MenubarContent as BaseMenubarContent, MenubarTrigger as BaseTrigger
} from '@/components/ui/menubar';
import { useTheme } from '@/lib/ThemeProvider';
import { cn } from '@/lib/utils';
import { getWindowsClasses } from '@/lib/windows-theme-utils';

const triggerStyles = cva(
  "flex cursor-default appearance-none select-none items-center text-sm outline-none [all:unset] [button-style:none]",
  {
    variants: {
      variant: {
        default:
          "rounded-sm px-3 py-1.5 font-medium hover:bg-accent data-[state=open]:bg-accent",
        ghost:
          "rounded-none px-2 py-0.5 hover:bg-muted/40 data-[state=open]:bg-muted/40 focus-visible:ring-0",
        plain:
          "rounded-none border-0 shadow-none px-2 py-0.5 bg-transparent hover:text-foreground/80 data-[state=open]:underline focus-visible:ring-0 focus:shadow-none focus-visible:outline-none",
        win98:
          "appearance-none rounded-none border-0 shadow-none px-1.5 py-0.5 bg-transparent font-normal hover:text-foreground/80 focus-visible:ring-0 focus:shadow-none focus-visible:outline-none",
        winxp:
          "appearance-none rounded-none border-0 shadow-none px-1.5 py-0.5 bg-transparent font-normal text-neutral-900 hover:text-blue-800 data-[state=open]:text-blue-800 focus-visible:ring-0 focus:shadow-none focus-visible:outline-none",
        win7: "appearance-none rounded-none border-0 shadow-none px-1.5 py-0.5 bg-transparent font-normal text-neutral-800 hover:text-blue-700 data-[state=open]:text-blue-700 focus-visible:ring-0 focus:shadow-none focus-visible:outline-none",
      },
    },
    defaultVariants: { variant: "plain" },
  }
);

export interface WindowsMenubarTriggerProps
  extends React.ComponentPropsWithoutRef<typeof BaseTrigger>,
    VariantProps<typeof triggerStyles> {}

export const WindowsMenubarTrigger = React.forwardRef<
  React.ElementRef<typeof BaseTrigger>,
  WindowsMenubarTriggerProps
>(({ className, variant, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  // Choose the appropriate variant based on the theme
  let themeVariant = variant;
  if (!variant && isWindowsTheme) {
    if (theme === "win98") themeVariant = "win98";
    else if (theme === "winxp") themeVariant = "winxp";
    else if (theme === "win7") themeVariant = "win7";
  }

  return (
    <BaseTrigger
      ref={ref}
      className={cn(
        "reset-menu-style reset-all-styles appearance-none inline-flex border-0 border-none bg-transparent shadow-none",
        triggerStyles({ variant: themeVariant }),
        "!bg-transparent !border-0 !shadow-none !rounded-none !m-0 !p-1 !px-2",
        "[&[data-state=open]]:!bg-transparent hover:!bg-transparent focus:!bg-transparent active:!bg-transparent",
        "focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none",
        "after:!shadow-none before:!shadow-none",
        "!outline-none outline-0 outline-offset-0",
        isWindowsTheme
          ? getWindowsClasses("windows-menubar-trigger", theme, className)
          : className
      )}
      style={{
        background: "transparent",
        border: "none",
        boxShadow: "none",
        appearance: "none",
        padding: "2px 8px",
        margin: 0,
        borderRadius: 0,
        all: "unset",
        display: "inline-flex",
        alignItems: "center",
      }}
      {...props}
    />
  );
});
WindowsMenubarTrigger.displayName = "WindowsMenubarTrigger";

// Windows-themed Menubar
export const WindowsMenubar = React.forwardRef<
  React.ElementRef<typeof BaseMenubar>,
  React.ComponentPropsWithoutRef<typeof BaseMenubar>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <BaseMenubar
      ref={ref}
      className={cn(
        "appearance-none flex items-center space-x-1 rounded-none border-0 border-b border-border bg-transparent px-2 py-0.5 shadow-none",
        isWindowsTheme
          ? getWindowsClasses("windows-menubar", theme, className)
          : className
      )}
      style={{
        background: "transparent",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        boxShadow: "none",
      }}
      {...props}
    />
  );
});
WindowsMenubar.displayName = "WindowsMenubar";

// Windows-themed MenubarContent
export const WindowsMenubarContent = React.forwardRef<
  React.ElementRef<typeof BaseMenubarContent>,
  React.ComponentPropsWithoutRef<typeof BaseMenubarContent>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();
  const isWindowsTheme = ["win98", "winxp", "win7"].includes(theme);

  return (
    <BaseMenubarContent
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-sm border shadow-md p-1 text-foreground bg-popover",
        isWindowsTheme
          ? getWindowsClasses("windows-menubar-content", theme, className)
          : className
      )}
      style={{
        backdropFilter: "none",
      }}
      {...props}
    />
  );
});
WindowsMenubarContent.displayName = "WindowsMenubarContent";

export * from "@/components/ui/menubar";

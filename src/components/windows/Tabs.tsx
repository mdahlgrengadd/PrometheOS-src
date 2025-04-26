// src/components/windows/Tabs.tsx
import * as React from "react";

import { cn } from "@/lib/utils";
import { useWindowsTheme } from "@/providers/WindowsThemeProvider";
import {
  Content as RadixTabsContent,
  List as RadixTabsList,
  Root as RadixTabsRoot,
  Trigger as RadixTabsTrigger,
} from "@radix-ui/react-tabs";

export const WinTabs = RadixTabsRoot;

export const WinTabsList = React.forwardRef<
  React.ElementRef<typeof RadixTabsList>,
  React.ComponentPropsWithoutRef<typeof RadixTabsList>
>(({ className, children, ...props }, ref) => {
  const { theme } = useWindowsTheme();
  return (
    <RadixTabsList ref={ref} asChild {...props}>
      <menu
        role="tablist"
        className={cn(
          theme === "winxp" && "xp-tabs",
          theme === "win7" && "tabs",
          className
        )}
      >
        {children}
      </menu>
    </RadixTabsList>
  );
});
WinTabsList.displayName = "WinTabsList";

export const WinTabsTrigger = React.forwardRef<
  React.ElementRef<typeof RadixTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof RadixTabsTrigger> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  const { theme } = useWindowsTheme();

  return (
    <RadixTabsTrigger ref={ref} asChild {...props}>
      {theme === "win98" ? (
        <li role="tab">
          <a>{children}</a>
        </li>
      ) : (
        <button
          className={cn(
            theme === "winxp" && "xp-tab",
            theme === "win7" && "tab",
            className
          )}
        >
          {children}
        </button>
      )}
    </RadixTabsTrigger>
  );
});
WinTabsTrigger.displayName = "WinTabsTrigger";

export const WinTabsContent = React.forwardRef<
  React.ElementRef<typeof RadixTabsContent>,
  React.ComponentPropsWithoutRef<typeof RadixTabsContent> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  const { theme } = useWindowsTheme();

  if (theme === "win98") {
    return (
      <RadixTabsContent ref={ref} asChild {...props}>
        <div className="window" role="tabpanel">
          <div className="window-body">{children}</div>
        </div>
      </RadixTabsContent>
    );
  }

  return (
    <RadixTabsContent ref={ref} className={className} {...props}>
      {children}
    </RadixTabsContent>
  );
});
WinTabsContent.displayName = "WinTabsContent";

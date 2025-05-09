import { cva, type, VariantProps } from "class-variance-authority";
import React from "react";

import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

// Import the CSS module
import styles from "./styles/Button.module.css";

const windowsButtonVariants = cva("", {
  variants: {
    variant: {
      default: "", // We'll handle theme-specific default styles
      secondary: "", // We'll handle theme-specific secondary styles
      destructive: "", // We'll handle theme-specific destructive styles
      outline: "", // We'll handle theme-specific outline styles
      ghost: "", // We'll handle theme-specific ghost styles
      link: "", // We'll handle theme-specific link styles
    },
    size: {
      default: "",
      sm: styles["size-sm"],
      lg: styles["size-lg"],
      icon: styles["size-icon"],
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface WindowsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof windowsButtonVariants> {
  asChild?: boolean;
}

export function WindowsButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: WindowsButtonProps): JSX.Element {
  const { theme } = useTheme();
  const Comp = asChild ? Slot : "button"; // Get base theme class
  let themeClass = "";
  let variantClass = "";
  // Map theme to specific theme style
  const windowsTheme =
    theme === "win98"
      ? "win98"
      : theme === "winxp"
      ? "winxp"
      : theme === "win7"
      ? "win7"
      : "win7"; // Default to win7 for other themes

  // Determine theme base class
  if (windowsTheme === "win98") {
    themeClass = "button";
  } else if (windowsTheme === "winxp") {
    themeClass = "window-button";
  } else {
    themeClass = "button";
  } // Add variant-specific classes based on theme
  if (windowsTheme === "win98") {
    if (variant === "default" || variant === undefined) variantClass = ""; // Use default Win98 styling
    if (variant === "destructive") variantClass = styles["win98-destructive"];
    if (variant === "outline") variantClass = styles["win98-outline"];
    if (variant === "ghost") variantClass = styles["win98-ghost"];
    if (variant === "link") variantClass = styles["win98-link"];
    if (variant === "secondary") variantClass = styles["win98-outline"]; // Fallback to outline for secondary
  } else if (windowsTheme === "winxp") {
    if (variant === "default" || variant === undefined) variantClass = ""; // Use default WinXP styling
    if (variant === "destructive") variantClass = styles["winxp-destructive"];
    if (variant === "outline") variantClass = styles["winxp-outline"];
    if (variant === "ghost") variantClass = styles["winxp-ghost"];
    if (variant === "link") variantClass = styles["winxp-link"];
    if (variant === "secondary") variantClass = styles["winxp-outline"]; // Fallback to outline for secondary
  } else {
    // Win7 and other themes
    if (variant === "default" || variant === undefined)
      variantClass = styles["win-default"];
    if (variant === "secondary") variantClass = styles["win-secondary"];
    if (variant === "destructive") variantClass = styles["win-destructive"];
    if (variant === "outline") variantClass = styles["win-outline"];
    if (variant === "ghost") variantClass = styles["win-ghost"];
    if (variant === "link") variantClass = styles["win-link"];
  }
  let dataAttributes = {};
  // Check if this button has the "removeButton" class or contains "Remove" text
  if (
    className?.includes("removeButton") ||
    (typeof props.children === "string" && props.children === "Remove")
  ) {
    // Add a data attribute to target with CSS
    dataAttributes = { "data-remove-button": true };
  }
  return (
    <Comp
      className={cn(
        themeClass,
        variantClass,
        windowsButtonVariants({ variant, size, className }),
        windowsTheme === "win7" && variant === "ghost"
          ? "win7-ghost-button"
          : ""
      )}
      {...props}
      {...dataAttributes}
    />
  );
}

# Windows-themed UI Components

This directory contains Windows-themed UI components that adapt to the current theme settings. These components are designed to automatically style themselves according to Windows 98, Windows XP, or Windows 7 themes when appropriate, and fallback to standard shadcn/ui styles for non-Windows themes.

## Usage

Import components from this directory instead of directly from shadcn/ui when you want your application to respect Windows theming:

```tsx
// Instead of importing from standard shadcn/ui
// import { Button } from "@/components/ui/button";

// Import Windows-aware version
import { WindowsButton } from "@/components/ui/windows";

function MyComponent() {
  return (
    <WindowsButton>
      Click Me
    </WindowsButton>
  );
}
```

## Available Components

- `WindowsButton` - Windows-themed button
- `WindowsInput` - Windows-themed input field
- `WindowsCard` - Windows-themed card with header, content, and footer
- `WindowsSelect` - Windows-themed select dropdown
- `Tabs` components - Windows-themed tabbed interface

## How It Works

These components use the `useTheme()` hook to detect if a Windows theme is active (win98, winxp, or win7) and apply appropriate styling. If a non-Windows theme is active, they fall back to the standard shadcn/ui styling.

## Adding New Components

To add a new Windows-themed component:

1. Create a new file in this directory
2. Import the base component from shadcn/ui
3. Create a new component that wraps the base component with Windows theme awareness
4. Add appropriate CSS for each theme in `/src/styles/windows98-ui.css`, `/src/styles/windowsxp-ui.css`, and `/src/styles/windows7-ui.css`
5. Export the new component from `/src/components/ui/windows/index.ts`

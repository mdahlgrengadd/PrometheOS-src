# Using Windows-Themed UI Components in Your Apps

This guide shows you how to update your apps to use the Windows-themed UI components that automatically adapt to the current OS theme.

## Quick Start

1. Replace your current shadcn/ui imports with the Windows-themed versions:

```diff
- import { Button } from "@/components/ui/button";
- import { Input } from "@/components/ui/input";
+ import { WindowsButton, WindowsInput } from "@/components/ui/windows";
```

2. Use the components in your app just like you would use the original components:

```tsx
function MyApp() {
  return (
    <div>
      <WindowsInput placeholder="Enter your name" />
      <WindowsButton>Submit</WindowsButton>
    </div>
  );
}
```

## Available Components

- `WindowsButton` - Automatically adapts to Windows themes
- `WindowsInput` - Styled input fields for Windows themes
- `WindowsCard`, `WindowsCardHeader`, `WindowsCardContent`, etc. - Card components
- `WindowsSelect`, `WindowsSelectTrigger`, etc. - Select dropdowns
- `Tabs`, `WindowsTabsList`, `WindowsTabsTrigger`, `WindowsTabsContent` - Tabbed interfaces

## Best Practices

- Use Windows UI components for all user inputs and interactive elements
- Keep the semantic structure of your app the same
- Test your app with different themes to ensure it looks good
- For components not yet adapted, you can create your own by following the pattern in the existing components

## Example: Updating a Form

Before:
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Username" />
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```

After:
```tsx
import { 
  WindowsButton, 
  WindowsInput,
  WindowsCard, 
  WindowsCardHeader, 
  WindowsCardTitle, 
  WindowsCardContent 
} from "@/components/ui/windows";

function SettingsForm() {
  return (
    <WindowsCard>
      <WindowsCardHeader>
        <WindowsCardTitle>Settings</WindowsCardTitle>
      </WindowsCardHeader>
      <WindowsCardContent>
        <WindowsInput placeholder="Username" />
        <WindowsButton>Save</WindowsButton>
      </WindowsCardContent>
    </WindowsCard>
  );
}
```

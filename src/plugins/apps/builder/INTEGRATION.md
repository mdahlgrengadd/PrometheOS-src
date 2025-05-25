# Integration Guide

## Quick Start

1. **Copy the builder folder** to your project's `src` directory

2. **Install dependencies**:
```bash
npm install monaco-editor esbuild-wasm lucide-react zustand clsx tailwind-merge
```

3. **Add CSS variables** to your main CSS file or tailwind config:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --sidebar-background: 210 40% 98%;
  --sidebar-foreground: 215.4 16.3% 46.9%;
  --sidebar-border: 214.3 31.8% 91.4%;
  --sidebar-accent: 210 40% 96%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --accent: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --sidebar-background: 222.2 84% 4.9%;
  --sidebar-foreground: 215 20.2% 65.1%;
  --sidebar-border: 217.2 32.6% 17.5%;
  --sidebar-accent: 217.2 32.6% 17.5%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
}
```

4. **Import and use**:
```tsx
import { IdeLayout } from '@src/builder';
import '@src/builder/styles.css';

function App() {
  return <IdeLayout />;
}
```

## Path Aliases

Make sure your build tool supports the `@src/` alias. For Vite:

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
});
```

For TypeScript:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@src/*": ["./src/*"]
    }
  }
}
```

## Required UI Components

The builder expects these UI components to be available via `@src/components/ui/`:
- `Tooltip`
- `TooltipContent`
- `TooltipProvider`
- `TooltipTrigger`

If you don't have these, you can either:
1. Install shadcn/ui components
2. Create minimal implementations
3. Remove tooltip functionality from ActivityBar.tsx

## Customization

You can customize the IDE by:
1. Modifying the CSS variables
2. Extending the file system structure
3. Adding custom commands
4. Implementing custom file loaders
5. Adding new panels or views

See `examples.tsx` for detailed usage examples.

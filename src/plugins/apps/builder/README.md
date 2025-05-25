# IDE Builder

A relocatable IDE builder component that can be integrated into any React project.

## Overview

The IDE Builder is a complete code editor interface built with React, TypeScript, and Monaco Editor. It includes:

- File explorer
- Code editor with syntax highlighting
- Terminal/output panel
- Build system integration
- Command palette
- Multiple themes

## Installation

1. Copy the `builder` folder to your project
2. Configure path aliases in your build system
3. Import and use the components

## Usage

### Basic Setup

```tsx
import { IdeLayout } from './path/to/builder';

function App() {
  return <div className="ide-builder-app"><IdeLayout /></div>;
}
```

### CSS Isolation

To prevent CSS conflicts with the rest of your application, all IDE Builder styles are scoped to the `.ide-builder-app` class. Always wrap the IDE components with this class:

```tsx
// Correct usage
<div className="ide-builder-app">
  <IdeLayout />
</div>

// This ensures that:
// 1. The IDE styles don't leak into your application
// 2. The theme switching works correctly
// 3. Components render as expected
```

### Path Aliases

Configure your build system to support `@src/*` imports:

#### Vite (vite.config.ts)
```ts
export default defineConfig({
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@src/*": ["./src/*"]
    }
  }
}
```

## Components

### Core Components
- `IdeLayout` - Main IDE container
- `ActivityBar` - Left sidebar with view icons
- `SideBar` - File explorer and other views
- `EditorArea` - Code editor with tabs
- `StatusBar` - Bottom status information
- `CommandPalette` - Quick command access

### Store
- `useIdeStore` - Zustand store for IDE state management

### Utilities
- Virtual File System (`VirtualFS`)
- ESBuild service for code compilation
- Monaco editor configuration

## Features

- **File Management**: Virtual file system with CRUD operations
- **Code Editing**: Monaco editor with TypeScript support
- **Build System**: Integrated ESBuild for JavaScript/TypeScript compilation
- **Themes**: Dark and light theme support
- **Keyboard Shortcuts**: VS Code-style shortcuts
- **Extensible**: Easy to customize and extend

## Dependencies

The builder requires these peer dependencies in your project:

- React 18+
- TypeScript
- Monaco Editor
- Zustand (state management)
- Lucide React (icons)
- Tailwind CSS (styling)

## Keyboard Shortcuts

- `Ctrl+Shift+P` - Command Palette
- `Ctrl+B` - Toggle Sidebar
- `Ctrl+` ` - Toggle Terminal
- `Ctrl+Shift+V` - Toggle Preview Panel

## Customization

The builder uses Tailwind CSS classes and can be customized by:

1. Modifying the CSS classes in components
2. Updating the theme configuration
3. Adding new commands to the command palette
4. Extending the file system with new file types

## File Structure

```
builder/
├── components/          # UI components
├── layout/             # Main layout component
├── lib/               # Monaco editor configuration
├── store/             # State management
├── utils/             # Utilities and services
├── vfs/               # Virtual file system
├── types.ts           # TypeScript definitions
├── index.css          # Styles
└── index.ts           # Main exports
```

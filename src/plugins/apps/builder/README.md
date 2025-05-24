# IDE Builder Component

This is a relocatable IDE component that can be easily integrated into any React project that uses the same scaffold setup.

## Features

- 🗂️ File Explorer with tree view
- 📝 Monaco Editor integration
- 🎨 Theme support (dark/light)
- 🔍 Command Palette
- 🚀 ESBuild integration for live preview
- 📱 Responsive layout
- ⌨️ Keyboard shortcuts

## Installation

1. Copy the entire `builder` folder to your project's `src` directory
2. Ensure your project has the required dependencies installed:

```bash
npm install react monaco-editor esbuild-wasm lucide-react zustand
# or
yarn add react monaco-editor esbuild-wasm lucide-react zustand
```

## Usage

### Basic Integration

```tsx
import { IdeLayout } from '@src/builder';

function App() {
  return <IdeLayout />;
}
```

### Custom Integration

You can also import individual components:

```tsx
import { 
  ActivityBar, 
  SideBar, 
  EditorArea, 
  StatusBar, 
  useIdeStore 
} from '@src/builder';

function CustomIDE() {
  const { sidebarVisible } = useIdeStore();
  
  return (
    <div className="ide-container">
      <ActivityBar />
      {sidebarVisible && <SideBar />}
      <EditorArea />
      <StatusBar />
    </div>
  );
}
```

## Configuration

### File System

The IDE uses a mock file system by default. You can customize it by providing your own file structure:

```tsx
import { useIdeStore, FileSystemItem } from '@src/builder';

const customFileSystem: FileSystemItem[] = [
  {
    id: 'root',
    name: 'my-project',
    type: 'folder',
    children: [
      {
        id: 'file1',
        name: 'index.js',
        type: 'file',
        language: 'javascript',
        content: 'console.log("Hello World!");'
      }
    ]
  }
];

// In your component
const { setFileSystem } = useIdeStore();
useEffect(() => {
  setFileSystem(customFileSystem);
}, []);
```

### Commands

You can extend the command palette with custom commands:

```tsx
import { Command } from '@src/builder';

const customCommands: Command[] = [
  {
    id: 'custom.action',
    title: 'My Custom Action',
    category: 'Custom',
    handler: () => {
      // Your custom logic here
    }
  }
];
```

## Keyboard Shortcuts

- `Ctrl+Shift+P` - Open Command Palette
- `Ctrl+B` - Toggle Sidebar
- `Ctrl+\`` - Toggle Terminal Panel
- `Ctrl+Shift+V` - Toggle Preview Panel

## Dependencies

This component requires the following peer dependencies:

- `react` - React framework
- `monaco-editor` - Code editor
- `esbuild-wasm` - JavaScript bundler for live preview
- `lucide-react` - Icons
- `zustand` - State management
- UI components from your scaffold (Tooltip, etc.)

## File Structure

```
builder/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces
├── components/           # React components
│   ├── ActivityBar.tsx
│   ├── SideBar.tsx
│   ├── EditorArea.tsx
│   ├── StatusBar.tsx
│   ├── CommandPalette.tsx
│   └── PreviewPanel.tsx
├── layout/
│   └── IdeLayout.tsx     # Main layout component
├── store/
│   └── ide-store.tsx     # Zustand store
├── utils/
│   ├── esbuild-service.ts
│   └── mock-data.ts
└── lib/
    └── utils.ts          # Utility functions
```

## Customization

### Styling

The components use CSS classes that should be defined in your project's CSS files. Key classes include:

- `.ide-container` - Main container
- `.activity-bar` - Left activity bar
- `.side-bar` - Sidebar panel
- `.editor-area` - Main editor area
- `.status-bar` - Bottom status bar

### Themes

The IDE supports theme switching through the store:

```tsx
const { theme, toggleTheme } = useIdeStore();
```

## License

This component is part of your project and follows the same license.

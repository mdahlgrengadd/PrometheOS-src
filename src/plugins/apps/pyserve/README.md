# PyServe - Portable Module

This is a self-contained, portable module for Python code editing, execution, and TypeScript generation using Pyodide. It can be easily integrated into any Vite/Tailwind/shadcn project.

## Features

- **Python Code Editor**: Monaco-based editor with syntax highlighting
- **Real-time Python Execution**: Uses Pyodide to run Python in the browser
- **TypeScript Generation**: Automatically generates TypeScript interfaces and API clients
- **Package Installation**: Automatically installs required Python packages
- **Function Testing**: Interactive testing interface for Python functions
- **File Operation Detection**: Detects and handles file dependencies
- **OpenAPI/Swagger Support**: Generates OpenAPI specs and Swagger UI

## Installation

1. Copy the entire `pyserve` folder to your project's `src` directory
2. Ensure your project has the required dependencies (see below)
3. Import and use the components as needed

## Required Dependencies

Make sure your project has these dependencies in `package.json`:

```json
{
  "dependencies": {
    "@codemirror/lang-javascript": "^6.2.2",
    "@codemirror/lang-python": "^6.1.6",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@uiw/react-codemirror": "^4.21.25",
    "lucide-react": "^0.400.0",
    "swagger-ui-react": "^5.17.14"
  }
}
```

## Usage

### Basic Integration

```tsx
// In your main page component
import { PythonCodeEditor } from "@/pyserve";

const MyPage = () => {
  return (
    <div className="h-screen overflow-hidden">
      <PythonCodeEditor />
    </div>
  );
};
```

### Using Individual Components

```tsx
import { 
  CodeEditor, 
  usePyodide, 
  useScriptProcessor,
  generateTypeScript 
} from "@/pyserve";

const CustomEditor = () => {
  const { pyodide, isLoading } = usePyodide();
  // ... your custom implementation
};
```

## Project Structure

```
src/pyserve/
├── index.ts                    # Main exports
├── components/
│   ├── PythonCodeEditor.tsx    # Main editor component
│   └── editor/                 # Sub-components
│       ├── CodeEditor.tsx
│       ├── CodePanels.tsx
│       ├── DropZone.tsx
│       ├── FunctionTester.tsx
│       ├── Header.tsx
│       ├── LoadingScreen.tsx
│       ├── MissingFilesDialog.tsx
│       ├── PythonEditorLayout.tsx
│       └── SwaggerUI.tsx
├── hooks/
│   ├── useFileProcessor.ts     # File handling logic
│   ├── usePyodide.ts          # Pyodide initialization
│   └── useScriptProcessor.ts  # Python script processing
├── types/
│   └── pyodide.d.ts           # TypeScript definitions
└── utils/
    ├── fileOperationDetector.ts
    ├── packageInstaller.ts
    ├── pyodideExecutor.ts
    ├── pythonAstProcessor.ts
    └── typeScriptGenerator.ts
```

## Key Dependencies

This module assumes your project uses:
- **Vite** as the build tool
- **Tailwind CSS** for styling
- **shadcn/ui** components (uses `@/components/ui/*` imports)
- **React Router** for navigation
- **React Query** for state management

## External Dependencies

The module relies on these external imports from your project:
- `@/hooks/use-toast` - Toast notification system
- `@/components/ui/*` - shadcn/ui components (Button, ScrollArea, etc.)

## Customization

All internal paths use relative imports, making the module self-contained. You can:
1. Modify styles by updating the Tailwind classes
2. Replace UI components by updating the imports in individual files
3. Extend functionality by adding new components to the module
4. Customize the Python execution environment in `usePyodide.ts`

## Integration Steps

1. **Copy the module**: Place the `pyserve` folder in your `src` directory
2. **Install dependencies**: Add the required packages to your project
3. **Import components**: Use the exports from `@/pyserve`
4. **Style integration**: The module uses Tailwind classes that should work with your existing setup
5. **Toast system**: Ensure you have a compatible toast system at `@/hooks/use-toast`

The module is designed to be framework-agnostic within the React ecosystem and should work with any Vite-based project structure.

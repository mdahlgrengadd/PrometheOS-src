
import { Command, FileSystemItem } from '../types';
import useIdeStore from '../store/ide-store';

// Sample file system
export const mockFileSystem: FileSystemItem[] = [
  {
    id: 'f1',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'f2',
        name: 'app.jsx',
        type: 'file',
        language: 'javascript',
        content: `import React from 'react';
import ReactDOM from 'react-dom';

const App = () => {
  return (
    <div className="app">
      <h1>Hello from ESBuild!</h1>
      <p>This is a sample React application.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{ 
          padding: '8px 16px', 
          background: '#4f46e5', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click me
      </button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));`,
      },
      {
        id: 'f3',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f9fafb;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #111827;
}

p {
  color: #4b5563;
  line-height: 1.6;
}`,
      },
      {
        id: 'f4',
        name: 'utils.js',
        type: 'file',
        language: 'javascript',
        content: `/**
 * Utility functions
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};`,
      }
    ]
  },
  {
    id: 'f5',
    name: 'public',
    type: 'folder',
    children: [
      {
        id: 'f6',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESBuild Demo</title>
</head>
<body>
  <div id="app"></div>
  <script src="bundle.js"></script>
</body>
</html>`,
      }
    ]
  },
  {
    id: 'f7',
    name: 'package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "esbuild-demo",
  "version": "1.0.0",
  "description": "Demo project for ESBuild",
  "main": "src/app.jsx",
  "scripts": {
    "build": "esbuild src/app.jsx --bundle --outfile=public/bundle.js"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
  }
];

// Commands
export const commands: Command[] = [
  {
    id: 'toggle-sidebar',
    title: 'View: Toggle Side Bar',
    category: 'View',
    shortcut: 'Ctrl+B',
    handler: () => useIdeStore.getState().toggleSidebar(),
  },
  {
    id: 'toggle-terminal',
    title: 'View: Toggle Terminal',
    category: 'View',
    shortcut: 'Ctrl+`',
    handler: () => useIdeStore.getState().togglePanel(),
  },
  {
    id: 'toggle-preview',
    title: 'View: Toggle Preview',
    category: 'View',
    shortcut: 'Ctrl+Shift+V',
    handler: () => useIdeStore.getState().togglePreviewPanel(),
  },
  {
    id: 'toggle-theme',
    title: 'Preferences: Toggle Theme',
    category: 'Preferences',
    handler: () => useIdeStore.getState().toggleTheme(),
  },
  {
    id: 'build-active-file',
    title: 'Build: Bundle Active File',
    category: 'Build',
    handler: () => {
      useIdeStore.getState().togglePreviewPanel();
      // The actual build happens in PreviewPanel component
    },
  },
  {
    id: 'build-bundle-app',
    title: 'Build: Bundle App (app.jsx)',
    category: 'Build',
    handler: () => {
      useIdeStore.getState().togglePreviewPanel();
      // The actual build happens in PreviewPanel component
    },
  }
];

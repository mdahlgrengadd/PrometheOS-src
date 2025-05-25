// Example: How to integrate the IDE Builder in another project

// Import styles locally for the example
import './styles.css';

import React from 'react';

// This is for demonstration purposes only - in real usage you would import from your project path
// In a real implementation, use the correct path to your builder components
import {
    ActivityBar, CommandPalette, EditorArea, IdeLayout, SideBar, StatusBar, useIdeStore
} from './index';

// Simple integration - just use the complete IDE
function SimpleIDE() {
  return (
    <div className="ide-builder-app">
      <IdeLayout />
    </div>
  );
}

// Import types separately
import type { FileSystemItem } from "./types";

function CustomIDE() {
  const { sidebarVisible, panelVisible } = useIdeStore();

  return (
    <div className="custom-ide-layout">
      <header className="app-header">
        <h1>My Custom IDE</h1>
      </header>

      <main className="ide-builder-app ide-container">
        <ActivityBar />
        {sidebarVisible && <SideBar />}
        <EditorArea />
        <StatusBar />
        <CommandPalette />
      </main>
    </div>
  );
}

// Integration with custom file system
function IDEWithCustomFiles() {
  const { setFileSystem } = useIdeStore();

  React.useEffect(() => {
    const customFiles: FileSystemItem[] = [
      {
        id: "project-root",
        name: "my-app",
        type: "folder",
        children: [
          {
            id: "package-json",
            name: "package.json",
            type: "file",
            language: "json",
            content: JSON.stringify(
              {
                name: "my-app",
                version: "1.0.0",
                scripts: {
                  start: "react-scripts start",
                },
              },
              null,
              2
            ),
          },
          {
            id: "src-folder",
            name: "src",
            type: "folder",
            children: [
              {
                id: "app-js",
                name: "App.js",
                type: "file",
                language: "javascript",
                content: `function App() {
  return <div>Hello World!</div>;
}

export default App;`,
              },
            ],
          },
        ],
      },
    ];

    setFileSystem(customFiles);
  }, [setFileSystem]);

  return (
    <div className="ide-builder-app">
      <IdeLayout />
    </div>
  );
}

export { SimpleIDE, CustomIDE, IDEWithCustomFiles };

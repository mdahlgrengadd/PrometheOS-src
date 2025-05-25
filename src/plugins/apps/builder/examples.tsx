// Example: How to integrate the IDE Builder in another project

import React from 'react';
import { IdeLayout } from '@src/builder';
import '@src/builder/styles.css'; // You'll need to create this CSS file

// Simple integration - just use the complete IDE
function SimpleIDE() {
  return <IdeLayout />;
}

// Advanced integration - custom layout with individual components
import { 
  ActivityBar, 
  SideBar, 
  EditorArea, 
  StatusBar, 
  CommandPalette,
  useIdeStore,
  type FileSystemItem 
} from '@src/builder';

function CustomIDE() {
  const { sidebarVisible, panelVisible } = useIdeStore();
  
  return (
    <div className="custom-ide-layout">
      <header className="app-header">
        <h1>My Custom IDE</h1>
      </header>
      
      <main className="ide-container">
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
        id: 'project-root',
        name: 'my-app',
        type: 'folder',
        children: [
          {
            id: 'package-json',
            name: 'package.json',
            type: 'file',
            language: 'json',
            content: JSON.stringify({
              name: 'my-app',
              version: '1.0.0',
              scripts: {
                start: 'react-scripts start'
              }
            }, null, 2)
          },
          {
            id: 'src-folder',
            name: 'src',
            type: 'folder',
            children: [
              {
                id: 'app-js',
                name: 'App.js',
                type: 'file',
                language: 'javascript',
                content: `function App() {
  return <div>Hello World!</div>;
}

export default App;`
              }
            ]
          }
        ]
      }
    ];
    
    setFileSystem(customFiles);
  }, [setFileSystem]);
  
  return <IdeLayout />;
}

export { SimpleIDE, CustomIDE, IDEWithCustomFiles };


import React, { useState } from 'react';
import { Plugin, PluginManifest } from '../../types';
import { eventBus } from '../../EventBus';

// Content component for the notepad plugin
const NotepadContent: React.FC = () => {
  const [text, setText] = useState('');
  
  return (
    <div className="h-full flex flex-col">
      <textarea
        className="flex-1 p-4 outline-none resize-none"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your notes here..."
      />
      <div className="p-2 text-xs text-gray-500 border-t">
        {text.length} characters
      </div>
    </div>
  );
};

// Plugin manifest
export const manifest: PluginManifest = {
  id: "notepad",
  name: "Notepad",
  version: "1.0.0",
  description: "A simple notepad application",
  author: "Desktop System",
  icon: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  entry: "apps/notepad"
};

// Create and export the plugin
const notepadPlugin: Plugin = {
  id: manifest.id,
  manifest,
  
  init: () => {
    console.log("Notepad plugin initialized");
    // Subscribe to events if needed
    eventBus.subscribe('desktop:themeChanged', (theme) => {
      console.log(`Theme changed to ${theme}`);
    });
  },
  
  render: () => <NotepadContent />,
  
  onOpen: () => {
    console.log("Notepad opened");
  },
  
  onClose: () => {
    console.log("Notepad closed");
  },
  
  onDestroy: () => {
    console.log("Notepad plugin destroyed");
    // Clean up any resources, event listeners, etc.
  }
};

export default notepadPlugin;

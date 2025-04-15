
import React, { useState } from 'react';
import { Plugin, PluginManifest } from '../../types';
import { eventBus } from '../../EventBus';

// Content component for the browser plugin
const BrowserContent: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  
  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUrl(url);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b">
        <form onSubmit={handleNavigate} className="flex">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-2 py-1 border rounded-l"
            placeholder="Enter URL..."
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-2 py-1 rounded-r"
          >
            Go
          </button>
        </form>
      </div>
      
      <div className="flex-1 bg-white p-4 overflow-auto">
        <iframe 
          src={currentUrl} 
          className="w-full h-full border" 
          title="Browser Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

// Plugin manifest
export const manifest: PluginManifest = {
  id: "browser",
  name: "Browser",
  version: "1.0.0",
  description: "A simple web browser",
  author: "Desktop System",
  icon: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  entry: "apps/browser"
};

// Create and export the plugin
const browserPlugin: Plugin = {
  id: manifest.id,
  manifest,
  
  init: () => {
    console.log("Browser plugin initialized");
  },
  
  render: () => <BrowserContent />,
  
  onOpen: () => {
    console.log("Browser opened");
  },
  
  onClose: () => {
    console.log("Browser closed");
  },
  
  onDestroy: () => {
    console.log("Browser plugin destroyed");
  }
};

export default browserPlugin;

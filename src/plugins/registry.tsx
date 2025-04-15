import React from 'react';
import { PluginManifest } from './types';
import { Circle, Settings, FileText, Calculator, Globe, FileEdit, Music } from 'lucide-react'; 

// Import all plugin manifests
import { manifest as notepadManifest } from './apps/notepad';
import { manifest as calculatorManifest } from './apps/calculator';
import { manifest as audioPlayerManifest } from './apps/audioplayer';

// Export all available plugins manifests
export const availablePlugins: PluginManifest[] = [
  notepadManifest,
  calculatorManifest,
  audioPlayerManifest,
  {
    id: "browser",
    name: "Browser",
    version: "1.0.0",
    description: "A simple web browser",
    author: "Desktop System",
    icon: <Globe className="h-8 w-8" />,
    entry: "apps/browser"
  },
  {
    id: "settings",
    name: "Settings",
    version: "1.0.0",
    description: "System settings application",
    author: "Desktop System",
    icon: <Settings className="h-8 w-8" />,
    entry: "apps/settings"
  },
  {
    id: "wordeditor",
    name: "Word Editor",
    version: "1.0.0",
    description: "A word processing application",
    author: "Desktop System",
    icon: <FileEdit className="h-8 w-8" />,
    entry: "apps/wordeditor"
  }
];

// Helper function to get plugin manifest by ID
export function getPluginManifestById(id: string): PluginManifest | undefined {
  return availablePlugins.find(plugin => plugin.id === id);
}

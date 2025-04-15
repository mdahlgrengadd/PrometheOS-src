import { Calculator, Circle, FileEdit, FileText, Globe, Music, Settings } from 'lucide-react';
import React from 'react';

import AudioPlayerPlugin, { manifest as audioPlayerManifest } from './apps/audioplayer';
import BrowserPlugin from './apps/browser';
import CalculatorPlugin, { manifest as calculatorManifest } from './apps/calculator';
import NotepadPlugin, { manifest as notepadManifest } from './apps/notepad';
import SettingsPlugin from './apps/settings';
import WordEditorPlugin from './apps/wordeditor';
import { PluginManifest } from './types';

// Register your plugins here
const plugins = [
  BrowserPlugin,
  CalculatorPlugin,
  NotepadPlugin,
  SettingsPlugin,
  WordEditorPlugin,
  AudioPlayerPlugin,
];

export default plugins;

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
    entry: "apps/browser",
  },
  {
    id: "settings",
    name: "Settings",
    version: "1.0.0",
    description: "System settings application",
    author: "Desktop System",
    icon: <Settings className="h-8 w-8" />,
    entry: "apps/settings",
  },
  {
    id: "wordeditor",
    name: "Word Editor",
    version: "1.0.0",
    description: "A word processing application",
    author: "Desktop System",
    icon: <FileEdit className="h-8 w-8" />,
    entry: "apps/wordeditor",
  },
];

// Helper function to get plugin manifest by ID
export function getPluginManifestById(id: string): PluginManifest | undefined {
  return availablePlugins.find((plugin) => plugin.id === id);
}

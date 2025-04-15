
import { manifest as audioPlayerManifest } from './apps/audioplayer';
import { manifest as browserManifest } from './apps/browser';
import { manifest as calculatorManifest } from './apps/calculator';
import { manifest as fileBrowserManifest } from './apps/filebrowser';
// Import all plugin manifests
import { manifest as notepadManifest } from './apps/notepad';
import { manifest as settingsManifest } from './apps/settings';
import { manifest as wordEditorManifest } from './apps/wordeditor';
import { PluginManifest } from './types';

// Export all available plugins manifests
export const availablePlugins: PluginManifest[] = [
  notepadManifest,
  calculatorManifest,
  audioPlayerManifest,
  browserManifest,
  settingsManifest,
  wordEditorManifest,
  fileBrowserManifest, // Added the File Browser plugin
];

// Helper function to get plugin manifest by ID
export function getPluginManifestById(id: string): PluginManifest | undefined {
  return availablePlugins.find((plugin) => plugin.id === id);
}

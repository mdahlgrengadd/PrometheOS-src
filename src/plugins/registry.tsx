import { manifest as apiExplorerManifest } from "./apps/api-explorer";
import { manifest as apiFlowEditorManifest } from "./apps/api-flow-editor";
import { manifest as audioPlayerManifest } from "./apps/audioplayer";
import { manifest as browserManifest } from "./apps/browser";
import { manifest as calculatorManifest } from "./apps/calculator";
import { manifest as fileBrowserManifest } from "./apps/filebrowser";
// Import all plugin manifests
import { manifest as notepadManifest } from "./apps/notepad";
import { manifest as settingsManifest } from "./apps/settings";
import { manifest as webllmChatManifest } from "./apps/webllm-chat";
import { manifest as wordEditorManifest } from "./apps/WordEditor";
import {
  addDynamicManifest,
  loadDynamicManifests,
  removeDynamicManifest,
} from "./dynamicRegistry";
import { PluginManifest } from "./types";

// Static plugins list - keep this unchanged
export const staticPlugins: PluginManifest[] = [
  notepadManifest,
  calculatorManifest,
  audioPlayerManifest,
  browserManifest,
  settingsManifest,
  wordEditorManifest,
  webllmChatManifest,
  apiExplorerManifest,
  apiFlowEditorManifest,
  fileBrowserManifest,
];

// For backward compatibility
export const availablePlugins = staticPlugins;

// Unified factory for "all" plugins (static + dynamic)
export function getAllManifests(): PluginManifest[] {
  return [...staticPlugins, ...loadDynamicManifests()];
}

// Helper function to get plugin manifest by ID (updated to include dynamic plugins)
export function getPluginManifestById(id: string): PluginManifest | undefined {
  return getAllManifests().find((plugin) => plugin.id === id);
}

// Installer API
export async function installPlugin(
  manifestUrl: string
): Promise<PluginManifest> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch plugin manifest: ${response.statusText}`);
  }

  const manifest: PluginManifest = await response.json();

  // Validate the manifest has required fields
  if (!manifest.id || !manifest.name || !manifest.entrypoint) {
    throw new Error("Invalid plugin manifest: missing required fields");
  }

  addDynamicManifest(manifest);
  return manifest;
}

// Uninstaller API
export function uninstallPlugin(id: string): void {
  removeDynamicManifest(id);
}

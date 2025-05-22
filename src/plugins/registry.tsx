import { manifest as apiExplorerManifest } from './apps/api-explorer/manifest';
import { manifest as apiFlowEditorManifest } from './apps/api-flow-editor/manifest';
import { manifest as audioPlayerManifest } from './apps/audioplayer/manifest';
import { manifest as browserManifest } from './apps/browser/manifest';
import { manifest as calculatorManifest } from './apps/calculator/manifest';
import { manifest as chatManifest } from './apps/chat/manifest';
import { manifest as fileBrowserManifest } from './apps/filebrowser/manifest';
// Import all plugin manifests
import { manifest as notepadManifest } from './apps/notepad/manifest';
import { manifest as sessionManifest } from './apps/session/manifest';
import { manifest as settingsManifest } from './apps/settings/manifest';
import { manifest as webampManifest } from './apps/webamp/manifest';
import { manifest as webllmChatManifest } from './apps/webllm-chat/manifest';
import { manifest as wordEditorManifest } from './apps/wordeditor/manifest';
import { addDynamicManifest, loadDynamicManifests, removeDynamicManifest } from './dynamicRegistry';
import { PluginManifest } from './types';

// Static plugins list - keep this unchanged
export const staticPlugins: PluginManifest[] = [
  notepadManifest,
  calculatorManifest,
  audioPlayerManifest,
  browserManifest,
  settingsManifest,
  wordEditorManifest,
  webampManifest,
  webllmChatManifest,
  apiExplorerManifest,
  apiFlowEditorManifest,
  fileBrowserManifest,
  sessionManifest,
  chatManifest,
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

  // Check for ID collisions with static plugins
  const staticIds = staticPlugins.map((p) => p.id);
  if (staticIds.includes(manifest.id)) {
    throw new Error(
      `Plugin ID '${manifest.id}' conflicts with a built-in plugin. Please use a different ID.`
    );
  }

  // Ensure we have an iconUrl for remote plugins if icon is not provided
  if (!manifest.iconUrl && typeof manifest.icon !== "object") {
    // Set a default icon URL from an existing icon
    manifest.iconUrl =
      import.meta.env.BASE_URL + "/icons/34794_pictures_pictures.png";
  }

  addDynamicManifest(manifest);
  return manifest;
}

// Uninstaller API
export function uninstallPlugin(id: string): void {
  removeDynamicManifest(id);
}

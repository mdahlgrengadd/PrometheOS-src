import { PluginManifest } from "./types";

const STORAGE_KEY = "dynamicPluginManifests";

export function loadDynamicManifests(): PluginManifest[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDynamicManifests(list: PluginManifest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addDynamicManifest(manifest: PluginManifest): void {
  const all = loadDynamicManifests();
  if (!all.find((m) => m.id === manifest.id)) {
    saveDynamicManifests([...all, manifest]);
  }
}

export function removeDynamicManifest(id: string): void {
  saveDynamicManifests(loadDynamicManifests().filter((m) => m.id !== id));
}

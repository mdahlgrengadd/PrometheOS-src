// This file ensures TypeScript can import the manifest and plugin for file-explorer
/// <reference types="react" />
declare module './manifest' {
  import { PluginManifest } from '../../types';
  export const manifest: PluginManifest;
}

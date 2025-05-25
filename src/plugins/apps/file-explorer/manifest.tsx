import React from 'react';
import { PluginManifest } from '../../../plugins/types';

export const manifest: PluginManifest = {
  id: "file-explorer",
  name: "File Explorer",
  version: "1.0.0",
  description: "Browse and manage your files and folders.",
  author: "Desktop System",
  icon: (
    <img
      src={import.meta.env.BASE_URL + "/icons/34704_desktop_beos_desktop_beos.png"}
      className="h-8 w-8"
      alt="File Explorer"
    />
  ),
  entry: "apps/file-explorer",
  preferredSize: {
    width: 1024,
    height: 768,
  },
};

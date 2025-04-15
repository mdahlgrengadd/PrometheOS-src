import React from 'react';

import { Plugin, PluginManifest } from '../../types';
import SettingsContent from './SettingsContent';

export const manifest: PluginManifest = {
  id: "settings",
  name: "Settings",
  version: "1.0.0",
  description: "System settings application",
  author: "Desktop System",
  icon: (
    <img
      src="/icons/34685_display_beos_apple_17_beos_studio_display_apple_17_studio.png"
      className="h-8 w-8"
      alt="Settings"
    />
  ),
  entry: "apps/settings",
  preferredSize: {
    width: 700,
    height: 500,
  },
};

const SettingsPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Settings plugin initialized");
  },
  render: () => {
    return <SettingsContent />;
  },
};

export default SettingsPlugin;

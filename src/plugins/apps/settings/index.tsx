
import React from 'react';
import { Plugin, PluginManifest } from '../../types';
import { Settings } from 'lucide-react';
import SettingsContent from './SettingsContent';

export const manifest: PluginManifest = {
  id: "settings",
  name: "Settings",
  version: "1.0.0",
  description: "System settings application",
  author: "Desktop System",
  icon: <Settings className="h-8 w-8" />,
  entry: "apps/settings"
};

const SettingsPlugin: Plugin = {
  id: manifest.id,
  manifest,
  init: async () => {
    console.log("Settings plugin initialized");
  },
  render: () => {
    return <SettingsContent />;
  }
};

export default SettingsPlugin;

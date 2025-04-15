
import React from 'react';
import { Plugin, PluginManifest } from '../../types';
import { Settings } from 'lucide-react';

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
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">System Settings</h2>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Appearance</h3>
          <div className="flex items-center mb-2">
            <input type="checkbox" id="darkMode" className="mr-2" />
            <label htmlFor="darkMode">Dark Mode</label>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Notifications</h3>
          <div className="flex items-center mb-2">
            <input type="checkbox" id="enableNotifications" className="mr-2" defaultChecked />
            <label htmlFor="enableNotifications">Enable Notifications</label>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Desktop Background</h3>
          <select className="border border-gray-300 rounded p-1 w-full">
            <option>Default Blue</option>
            <option>Mountain Landscape</option>
            <option>Abstract Pattern</option>
            <option>Solid Color</option>
          </select>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">About</h3>
          <p className="text-sm text-gray-600">
            3D Desktop Environment v1.0.0
            <br />
            Powered by React
          </p>
        </div>
      </div>
    );
  }
};

export default SettingsPlugin;

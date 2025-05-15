import React from "react";

import { usePlugins } from "../plugins/PluginContext";

interface DesktopIconProps {
  pluginId: string;
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

/**
 * A standalone component that renders an icon on the desktop
 * for a specific plugin and launches it when double-clicked.
 */
const DesktopIcon: React.FC<DesktopIconProps> = ({ pluginId, position }) => {
  const { openWindow, pluginManager } = usePlugins();
  const plugin = pluginManager.getPlugin(pluginId);

  if (!plugin) {
    console.error(`Plugin ${pluginId} not found`);
    return null;
  }

  const handleOpen = () => {
    openWindow(pluginId);
  };

  return (
    <div
      className="desktop-icon"
      style={{
        position: "absolute",
        ...position,
      }}
      onDoubleClick={handleOpen}
    >
      {plugin.manifest.icon || (
        <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white">
          {plugin.manifest.name.charAt(0)}
        </div>
      )}
      <div className="desktop-icon-label">{plugin.manifest.name}</div>
    </div>
  );
};

export default DesktopIcon;

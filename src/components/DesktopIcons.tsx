import React, { useEffect } from 'react';

import { usePlugins } from '../plugins/PluginContext';
import { WindowState } from './Desktop';

interface DesktopIconsProps {
  windows: WindowState[];
  openWindow: (id: string) => void;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({ windows, openWindow }) => {
  const { pluginManager } = usePlugins();

  // Debug: Log windows and plugins when component mounts or windows change
  useEffect(() => {
    console.log("DesktopIcons - Available windows:", windows);
    console.log(
      "DesktopIcons - Loaded plugins:",
      pluginManager.getAllPlugins()
    );
  }, [windows, pluginManager]);

  return (
    <div className="desktop-icons">
      {windows.map((window) => {
        const plugin = pluginManager.getPlugin(window.id);
        console.log(`Rendering icon for ${window.id}:`, plugin?.manifest.icon);

        return (
          <div
            key={window.id}
            className="desktop-icon"
            onDoubleClick={() => openWindow(window.id)}
            onClick={(e) => e.stopPropagation()}
          >
            {plugin?.manifest.icon || (
              <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white">
                {window.title.charAt(0)}
              </div>
            )}
            <div className="desktop-icon-label">{window.title}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DesktopIcons;

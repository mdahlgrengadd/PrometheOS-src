
import React from "react";
import { WindowState } from "./Desktop";
import { usePlugins } from "../plugins/PluginContext";

interface DesktopIconsProps {
  windows: WindowState[];
  openWindow: (id: string) => void;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({ windows, openWindow }) => {
  const { pluginManager } = usePlugins();
  
  return (
    <div className="desktop-icons">
      {windows.map((window) => {
        const plugin = pluginManager.getPlugin(window.id);
        
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

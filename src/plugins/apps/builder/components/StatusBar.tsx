import { Bell, GitBranch, Upload, Zap } from "lucide-react";
import React from "react";

import useIdeStore from "../store/ide-store";

const StatusBar: React.FC = () => {
  const { theme, toggleTheme, toggleCommandPalette, publishApp, isBuilding } =
    useIdeStore();

  return (
    <div className="status-bar flex items-center px-2 text-xs">
      {" "}
      <div className="flex items-center">
        <button
          className="flex items-center px-2 py-1 hover:bg-sidebar-accent rounded"
          onClick={toggleCommandPalette}
        >
          <Zap size={14} className="mr-1" />
          <span>Command Palette</span>
        </button>

        <button
          className="flex items-center px-2 py-1 hover:bg-sidebar-accent rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={publishApp}
          disabled={isBuilding}
          title="Publish current app to Published Apps folder"
        >
          <Upload size={14} className="mr-1" />
          <span>{isBuilding ? "Publishing..." : "Publish App"}</span>
        </button>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <GitBranch size={14} className="mr-1" />
          <span>main</span>
        </div>

        <div className="flex items-center">
          <span>Ln 1, Col 1</span>
        </div>

        <div className="flex items-center">
          <span>Spaces: 2</span>
        </div>

        <div className="flex items-center">
          <span>UTF-8</span>
        </div>

        <button
          className="flex items-center hover:bg-sidebar-accent px-2 py-0.5 rounded"
          onClick={toggleTheme}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button className="flex items-center hover:bg-sidebar-accent px-2 py-0.5 rounded">
          <Bell size={14} />
        </button>
      </div>
    </div>
  );
};

export default StatusBar;

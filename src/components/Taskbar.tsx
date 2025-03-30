
import React from "react";
import { WindowState } from "./Desktop";
import { Terminal, Rocket, Database, Zap } from "lucide-react";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  return (
    <div className="taskbar">
      <div className="taskbar-item mr-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-neon-blue" />
        <span className="hidden sm:inline text-neon-blue">StarOS</span>
      </div>
      
      <div className="flex-1 flex">
        {windows.map((window, index) => {
          // Cycle through different neon colors
          const colorClasses = [
            "text-neon-blue",
            "text-neon-purple",
            "text-neon-pink",
            "text-neon-orange",
            "text-neon-green",
            "text-neon-yellow",
            "text-neon-cyan"
          ];
          const colorClass = colorClasses[index % colorClasses.length];
          
          return (
            <button
              key={window.id}
              className={`taskbar-item ${window.isOpen && !window.isMinimized ? "active" : ""}`}
              onClick={() => onWindowClick(window.id)}
            >
              <span className={colorClass}>{window.title}</span>
            </button>
          );
        })}
      </div>
      
      <div className="taskbar-item ml-4">
        <Terminal className="w-5 h-5 text-neon-green" />
      </div>
      
      <div className="taskbar-item">
        <Database className="w-5 h-5 text-neon-purple" />
      </div>
      
      <div className="taskbar-item">
        <Zap className="w-5 h-5 text-neon-yellow" />
      </div>
    </div>
  );
};

export default Taskbar;

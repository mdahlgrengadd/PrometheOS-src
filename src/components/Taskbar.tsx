
import React from "react";
import { WindowState } from "./Desktop";
import { Terminal, Rocket, Database } from "lucide-react";

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
        {windows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-item ${window.isOpen && !window.isMinimized ? "active" : ""}`}
            onClick={() => onWindowClick(window.id)}
          >
            {window.title}
          </button>
        ))}
      </div>
      
      <div className="taskbar-item ml-4">
        <Terminal className="w-5 h-5 text-neon-blue" />
      </div>
      
      <div className="taskbar-item">
        <Database className="w-5 h-5 text-neon-purple" />
      </div>
    </div>
  );
};

export default Taskbar;

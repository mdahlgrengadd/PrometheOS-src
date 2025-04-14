
import React from "react";
import { WindowState } from "./Desktop";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  return (
    <div className="taskbar">
      <div className="taskbar-item mr-4">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </div>
      
      <div className="flex-1 flex">
        {windows.map((window) => (
          <button
            key={window.id}
            className={`taskbar-item ${window.isOpen && !window.isMinimized ? "bg-white/20" : ""}`}
            onClick={() => onWindowClick(window.id)}
          >
            {window.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Taskbar;


import React from "react";
import { WindowState } from "./Desktop";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  return (
    <div className="taskbar">
      <div className="taskbar-item flex items-center">
        <img 
          src="/lovable-uploads/17f83ee5-f1d1-4822-95a8-7dee1bf43896.png" 
          alt="BeOS" 
          className="h-5 mr-1"
        />
        <span className="font-bold text-black">BeOS</span>
      </div>
      
      <div className="flex-1 flex">
        {windows.map((window) => (
          window.isOpen && (
            <button
              key={window.id}
              className={`taskbar-item ${window.isOpen && !window.isMinimized ? "bg-white/20" : ""}`}
              onClick={() => onWindowClick(window.id)}
            >
              {window.title}
            </button>
          )
        ))}
      </div>
      
      <div className="px-2 text-xs text-black">4:16 AM</div>
    </div>
  );
};

export default Taskbar;

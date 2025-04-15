import React, { useState, useEffect } from "react";
import { WindowState } from "./Desktop";
import { Home, Monitor, Clock, Maximize2, Minimize2 } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme } = useTheme();
  const isBeOSTheme = theme === 'beos';
  
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time as hours:minutes AM/PM
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // BeOS style taskbar
  if (isBeOSTheme) {
    return (
      <div className="taskbar">
        <div className="taskbar-start">
          <span>BeOS</span>
        </div>
        
        <div className="taskbar-separator"></div>
        
        <div className="flex-1 flex">
          {windows.map((window) => (
            window.isOpen && (
              <button
                key={window.id}
                className={`taskbar-item ${window.isOpen && !window.isMinimized ? "active" : ""}`}
                onClick={() => onWindowClick(window.id)}
              >
                {window.title}
              </button>
            )
          ))}
        </div>
        
        <div className="taskbar-separator"></div>
        
        <div className="px-2 text-xs font-bold">
          {formattedTime}
        </div>
      </div>
    );
  }

  // Modern style taskbar
  return (
    <div className="taskbar">
      <button className="taskbar-start">
        <Home className="w-4 h-4 mr-2" />
        <span>Start</span>
      </button>

      <div className="taskbar-separator"></div>
      
      <div className="flex-1 flex">
        {windows.map((window) => (
          window.isOpen && (
            <button
              key={window.id}
              className={`taskbar-item ${window.isOpen && !window.isMinimized ? "active" : ""}`}
              onClick={() => onWindowClick(window.id)}
            >
              <Monitor className="taskbar-item-icon" />
              <span className="truncate">{window.title}</span>
              {window.isOpen && !window.isMinimized ? (
                <Minimize2 className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              )}
            </button>
          )
        ))}
      </div>
      
      <div className="taskbar-separator"></div>
      
      <div className="flex items-center px-3 font-medium">
        <Clock className="w-4 h-4 mr-2 text-primary" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
};

export default Taskbar;

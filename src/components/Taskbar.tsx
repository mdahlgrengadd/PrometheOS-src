
import React from "react";
import { WindowState } from "./Desktop";
import { Terminal, Rocket, Database, Zap, Sparkles, Heart, Star, Moon, Sun } from "lucide-react";

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onWindowClick }) => {
  return (
    <div className="taskbar">
      <div className="taskbar-item mr-4 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-neon-blue animate-bounce" />
        <span className="hidden sm:inline text-neon-blue">✨ StarOS ✨</span>
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
          
          // Add fun emoji based on window type
          const getEmoji = (id: string) => {
            switch (id) {
              case "notepad": return "📝 ";
              case "calculator": return "🔢 ";
              case "browser": return "🌐 ";
              case "settings": return "⚙️ ";
              default: return "✨ ";
            }
          };
          
          return (
            <button
              key={window.id}
              className={`taskbar-item ${window.isOpen && !window.isMinimized ? "active" : ""}`}
              onClick={() => onWindowClick(window.id)}
            >
              <span className={colorClass}>{getEmoji(window.id)}{window.title}</span>
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
        <Zap className="w-5 h-5 text-neon-yellow animate-pulse" />
      </div>
      
      <div className="taskbar-item">
        <Heart className="w-5 h-5 text-neon-pink animate-pulse" />
      </div>
      
      <div className="taskbar-item">
        <Star className="w-5 h-5 text-neon-yellow animate-spin-slow" />
      </div>
      
      <div className="taskbar-item">
        <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse" />
      </div>
      
      <div className="taskbar-item">
        {new Date().getHours() >= 18 || new Date().getHours() < 6 ? 
          <Moon className="w-5 h-5 text-neon-purple" /> : 
          <Sun className="w-5 h-5 text-neon-orange" />
        }
      </div>
    </div>
  );
};

export default Taskbar;

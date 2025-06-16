// Import component-scoped styles
import "./Taskbar.css";

import { Maximize2, Minimize2, Monitor, Wifi } from "lucide-react";
import React, { FC, useEffect, useMemo, useState } from "react";
import { FcDocument, FcGlobe, FcSpeaker } from "react-icons/fc";

import { useTheme } from "@/lib/ThemeProvider";
import { useWindowStore } from "@/store/windowStore";
import { WindowState } from "@/types/window";

import { useWebRTCStatus } from "../../hooks/useWebRTCStatus";
import StartButton from "./StartButton";
import StartMenu from "./StartMenu";

interface TaskbarProps {
  onWindowClick: (id: string) => void;
}

const Taskbar: FC<TaskbarProps> = ({ onWindowClick }) => {
  // Theme and WebRTC status
  const { theme } = useTheme();
  const isConnected = useWebRTCStatus().isConnected;
  const isBeOS = theme === "beos";

  // Windows state
  const windowsDict = useWindowStore((state) => state.windows);
  const windows: WindowState[] = useMemo(
    () => Object.values(windowsDict).filter((w) => w.isOpen),
    [windowsDict]
  );

  // Start menu state
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Close StartMenu when clicking outside
  const startMenuRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isStartMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(e.target as Node)
      ) {
        setIsStartMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isStartMenuOpen]);
  const [autoHide, setAutoHide] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("taskbar-autohide") === "true";
    setAutoHide(stored);
    setIsVisible(!stored);
  }, []);

  // Handlers
  const toggleStartMenu = () => setIsStartMenuOpen((s) => !s);
  const handleMouseEnter = () => autoHide && setIsVisible(true);
  const handleMouseLeave = () => autoHide && setIsVisible(false);

  // Formatters
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (date: Date) =>
    date.toLocaleDateString([], {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

  // Styles
  const containerStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "3rem",
    display: "flex",
    background:
      "var(--taskbar-bg-gradient, linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%))",
    boxShadow:
      "var(--taskbar-shadow, inset 0 1px 0 0 #d0d0d0, 0 -1px 0 0 #b0b0b0)",
    transition: autoHide ? "transform 0.3s ease" : undefined,
    transform: autoHide && !isVisible ? "translateY(100%)" : "translateY(0)",
    zIndex: 2,
  };

  return (
    <div
      className="taskbar-scope"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Start button & menu */}
      <div className="relative flex items-center pl-2" ref={startMenuRef}>
        <StartButton isActive={isStartMenuOpen} onClick={toggleStartMenu} />
        <StartMenu isOpen={isStartMenuOpen} />
      </div>
      {/* Quick launch */}
      <div className="flex items-center ml-2 space-x-1 border-r border-[#3976b8] pr-2">
        <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-[#4096e3]/40 cursor-pointer">
          <FcGlobe className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-[#4096e3]/40 cursor-pointer">
          <FcDocument className="w-5 h-5" />
        </div>
      </div>
      {/* Running apps */}
      <div className="flex items-center ml-2 space-x-1 flex-1">
        {windows.map((win) => {
          const btnClass = [
            "taskbar-app-btn",
            "h-8",
            win.isMinimized ? "minimized" : "",
            win.isOpen && !win.isMinimized ? "taskbar-app-btn-active" : "",
            "cursor-pointer",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={win.id}
              className={btnClass}
              onClick={() => onWindowClick(win.id)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onWindowClick(win.id);
              }}
            >
              <Monitor
                className={`w-5 h-5 mr-1 ${
                  isBeOS ? "text-black" : "text-white"
                }`}
              />
              <span className="truncate">{win.title}</span>
              {win.isOpen && !win.isMinimized ? (
                <Minimize2
                  className={`w-3 h-3 ml-1 ${
                    isBeOS ? "text-black" : "text-white"
                  }`}
                />
              ) : (
                <Maximize2
                  className={`w-3 h-3 ml-1 ${
                    isBeOS ? "text-black" : "text-white"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>{" "}
      {/* System tray */}
      <div className="flex items-center pr-3 space-x-2">
        {" "}
        {isConnected && (
          <Wifi className={`w-4 h-4 ${isBeOS ? "text-black" : "text-white"}`} />
        )}
        <FcSpeaker className="w-4 h-4" />
        <div
          className={`flex flex-col items-end text-xs ${
            isBeOS ? "text-black" : "text-white"
          }`}
        >
          <div className="font-bold">{formatTime(currentTime)}</div>
          <div className="text-[10px]">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;

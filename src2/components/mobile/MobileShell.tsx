
import React, { useEffect } from "react";
import { useShell } from "@/contexts/ShellContext";
import HomeScreen from "./HomeScreen";
import AppScreen from "./AppScreen";
import DockBar from "./DockBar";

const MobileShell: React.FC = () => {
  const { activeApp } = useShell();
  
  useEffect(() => {
    // Request fullscreen on mobile devices
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          // Safari and older WebKit browsers
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen request failed:", error);
      }
    };

    // Only attempt fullscreen on mobile
    if (window.innerWidth < 768) {
      requestFullscreen();
    }
  }, []); // Empty dependency array means this runs once on mount
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600">
      {/* Home screen (visible when no app is active) */}
      {!activeApp && <HomeScreen />}
      
      {/* App screen (visible when an app is active) */}
      <AppScreen />
      
      {/* Bottom dock bar (always visible) */}
      <DockBar />
    </div>
  );
};

export default MobileShell;


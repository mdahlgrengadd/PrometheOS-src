
import React, { useState } from "react";
import { useShell } from "@/contexts/ShellContext";
import AppIcon from "../shared/AppIcon";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HomeScreen: React.FC = () => {
  const { apps, openApp, currentHomeScreen, setCurrentHomeScreen } = useShell();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Split apps into pages of 8 apps each
  const appsPerPage = 8;
  const appPages = [];
  for (let i = 0; i < apps.length; i += appsPerPage) {
    appPages.push(apps.slice(i, i + appsPerPage));
  }
  
  // Handle swiping between pages
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;
    
    if (isSwipeLeft && currentHomeScreen < appPages.length - 1) {
      setCurrentHomeScreen(currentHomeScreen + 1);
    }
    
    if (isSwipeRight && currentHomeScreen > 0) {
      setCurrentHomeScreen(currentHomeScreen - 1);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // For mouse/desktop, add click handlers for pagination
  const goToNextPage = () => {
    if (currentHomeScreen < appPages.length - 1) {
      setCurrentHomeScreen(currentHomeScreen + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentHomeScreen > 0) {
      setCurrentHomeScreen(currentHomeScreen - 1);
    }
  };
  
  return (
    <div 
      className="relative h-full w-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status bar */}
      <div className="p-4 flex justify-between items-center">
        <div className="text-sm font-medium text-white">9:41</div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
        </div>
      </div>
      
      {/* App grid */}
      <div className="flex-grow flex items-center justify-center pb-16">
        <div className="grid grid-cols-4 gap-6 p-6">
          {appPages[currentHomeScreen]?.map(app => (
            <AppIcon
              key={app.id}
              name={app.name}
              icon={app.icon}
              color={app.color}
              size="md"
              onClick={() => openApp(app.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Page indicator */}
      <div className="flex justify-center pb-20">
        <div className="flex space-x-2">
          {appPages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentHomeScreen ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation arrows - visible on larger screens for testing */}
      <div className="absolute inset-y-0 left-2 flex items-center lg:hidden">
        {currentHomeScreen > 0 && (
          <button
            onClick={goToPrevPage}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ChevronLeft className="text-white" />
          </button>
        )}
      </div>
      
      <div className="absolute inset-y-0 right-2 flex items-center lg:hidden">
        {currentHomeScreen < appPages.length - 1 && (
          <button
            onClick={goToNextPage}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <ChevronRight className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;

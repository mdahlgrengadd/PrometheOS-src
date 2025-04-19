import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Plugin } from "@/plugins/types";

interface MobileHomeScreenProps {
  plugins: Plugin[];
  pluginPages: Plugin[][];
  currentHomeScreen: number;
  setCurrentHomeScreen: (index: number) => void;
  openApp: (appId: string) => void;
}

const MobileHomeScreen: React.FC<MobileHomeScreenProps> = ({
  plugins,
  pluginPages,
  currentHomeScreen,
  setCurrentHomeScreen,
  openApp,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

    if (isSwipeLeft && currentHomeScreen < pluginPages.length - 1) {
      setCurrentHomeScreen(currentHomeScreen + 1);
    }

    if (isSwipeRight && currentHomeScreen > 0) {
      setCurrentHomeScreen(currentHomeScreen - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // For desktop/mouse, add click handlers for pagination
  const goToNextPage = () => {
    if (currentHomeScreen < pluginPages.length - 1) {
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
        <div className="text-sm font-medium text-white">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="w-4 h-4 bg-white/20 rounded-full"></div>
        </div>
      </div>

      {/* App grid */}
      <div className="flex-grow flex items-center justify-center pb-16">
        <div className="grid grid-cols-4 gap-6 p-6">
          {pluginPages[currentHomeScreen]?.map((plugin) => (
            <div
              key={plugin.id}
              className="flex flex-col items-center"
              onClick={() => openApp(plugin.id)}
            >
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  {plugin.manifest.icon ? (
                    <div className="text-white">{plugin.manifest.icon}</div>
                  ) : (
                    <span className="text-white font-bold">
                      {plugin.manifest.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
              <span className="mt-2 text-xs text-white font-medium">
                {plugin.manifest.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Page indicator */}
      <div className="flex justify-center pb-24">
        <div className="flex space-x-2">
          {pluginPages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentHomeScreen ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation arrows - only visible on larger screens for testing */}
      {pluginPages.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-2 flex items-center sm:hidden">
            {currentHomeScreen > 0 && (
              <button
                onClick={goToPrevPage}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ChevronLeft className="text-white" />
              </button>
            )}
          </div>

          <div className="absolute inset-y-0 right-2 flex items-center sm:hidden">
            {currentHomeScreen < pluginPages.length - 1 && (
              <button
                onClick={goToNextPage}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ChevronRight className="text-white" />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileHomeScreen;

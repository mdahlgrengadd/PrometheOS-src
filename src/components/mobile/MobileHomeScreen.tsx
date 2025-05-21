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
        {(() => {
          // Change from 8 to 9 apps per page (3x3 grid)
          const pluginsPerPage = 9;
          const start = currentHomeScreen * pluginsPerPage;
          const end = start + pluginsPerPage;
          const pagePlugins = plugins.slice(start, end);
          // Always show 9 slots (fill with null if not enough)
          const slots =
            pagePlugins.length < pluginsPerPage
              ? [
                  ...pagePlugins,
                  ...Array(pluginsPerPage - pagePlugins.length).fill(null),
                ]
              : pagePlugins;
          return (
            <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
              {slots.map((plugin, idx) => (
                <div
                  key={plugin?.id ?? idx}
                  className="flex flex-col items-center"
                  onClick={() => plugin && plugin.id && openApp(plugin.id)}
                  style={{
                    cursor: plugin && plugin.id ? "pointer" : "default",
                    opacity: plugin && plugin.id ? 1 : 0.5,
                  }}
                >
                  <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
                      {plugin?.manifest?.icon ? (
                        // If icon is a valid React element
                        plugin.manifest.icon
                      ) : plugin?.manifest?.iconUrl ? (
                        // If iconUrl is present
                        <img
                          src={plugin.manifest.iconUrl}
                          alt={plugin.manifest.name || "App"}
                          className="w-8 h-8 object-contain"
                          draggable={false}
                        />
                      ) : plugin?.manifest?.name ? (
                        // Fallback to first letter of name
                        <span className="text-white font-bold">
                          {plugin.manifest.name.charAt(0)}
                        </span>
                      ) : plugin?.id ? (
                        // Last resort: first letter of ID
                        <span className="text-white font-bold">
                          {plugin.id.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        // Absolute last resort: question mark
                        <span className="text-white font-bold opacity-50">
                          ?
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="mt-2 text-xs text-white font-medium text-center max-w-[4.5rem] truncate">
                    {plugin?.manifest?.name || plugin?.id || ""}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
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

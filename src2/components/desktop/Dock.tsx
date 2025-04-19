import React from 'react';

import { useShell } from '@/contexts/ShellContext';
import { cn } from '@/lib/utils';

import AppIcon from '../shared/AppIcon';

const Dock: React.FC = () => {
  const { apps, openApp, windows } = useShell();

  // We'll display the first 6 apps in the dock
  const dockApps = apps.slice(0, 6);

  const handleAppClick = (e: React.MouseEvent, appId: string) => {
    // Stop event propagation and prevent default to avoid interference with other handlers
    e.stopPropagation();
    e.preventDefault();
    console.log(`[DOCK DEBUG] Opening app: ${appId}`);
    openApp(appId);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 pointer-events-auto z-50">
      <div className="flex space-x-4">
        {dockApps.map((app) => {
          const isOpen = windows.some(
            (w) => w.app.id === app.id && w.isOpen && !w.isMinimized
          );

          return (
            <div key={app.id} className="relative group pointer-events-auto">
              {/* Move the animation div behind the app icon so it doesn't capture clicks */}
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-200 pointer-events-none",
                  "group-hover:scale-110 group-hover:-translate-y-1"
                )}
              />

              {/* Wrap AppIcon in a div that properly captures clicks */}
              <div
                className="relative z-10"
                onClick={(e) => handleAppClick(e, app.id)}
              >
                <AppIcon
                  name={app.name}
                  icon={app.icon}
                  color={app.color}
                  size="md"
                  onClick={(e) => handleAppClick(e, app.id)}
                />
              </div>

              {/* Indicator dot for open apps */}
              {isOpen && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full z-20" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dock;

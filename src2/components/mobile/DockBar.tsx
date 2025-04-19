import { Home } from 'lucide-react';
import React from 'react';

import { useShell } from '@/contexts/ShellContext';

import AppIcon from '../shared/AppIcon';

const DockBar: React.FC = () => {
  const { closeApp, openApp, apps } = useShell();

  // Go to home screen
  const goHome = () => {
    closeApp(""); // Close all apps
  };

  // Quick access apps
  const quickApps = ["mail", "browser", "messages", "calendar"];

  // Function to directly open an app (prevent interference from react-draggable)
  const handleOpenApp = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Opening app: ${appId}`);
    openApp(appId);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-black/20 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="flex h-full items-center justify-center space-x-8 px-4">
        {/* Home button */}
        <button
          onClick={goHome}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50"
        >
          <Home size={20} />
        </button>

        {/* App shortcuts */}
        {quickApps.map((appId) => {
          const app = apps.find((a) => a.id === appId);
          if (!app) return null;

          return (
            <div
              key={appId}
              className="p-2 rounded-full hover:bg-white/10 z-50"
              onClick={(e) => handleOpenApp(appId, e)}
            >
              <AppIcon
                name=""
                icon={app?.icon || Home}
                color={app?.color || "bg-gray-500"}
                size="sm"
                onClick={(e) => handleOpenApp(appId, e)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DockBar;

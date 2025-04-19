import { Grid, Home } from "lucide-react";

import { Plugin } from "@/plugins/types";

interface MobileDockBarProps {
  plugins: Plugin[];
  activeApp: string | null;
  openApp: (appId: string) => void;
}

const MobileDockBar: React.FC<MobileDockBarProps> = ({
  plugins,
  activeApp,
  openApp,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 h-20 bg-black/10 backdrop-blur-md z-50 flex items-center justify-around px-6">
      {/* Home button */}
      <button
        className="flex flex-col items-center justify-center"
        onClick={() => activeApp && openApp(activeApp)}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            !activeApp ? "bg-white/20" : "bg-white/10"
          }`}
        >
          <Home
            size={24}
            className={`${!activeApp ? "text-white" : "text-white/70"}`}
          />
        </div>
      </button>

      {/* App shortcuts */}
      {plugins.map((plugin) => (
        <button
          key={plugin.id}
          className="flex flex-col items-center justify-center"
          onClick={() => openApp(plugin.id)}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              activeApp === plugin.id ? "bg-white/20" : "bg-white/10"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              {typeof plugin.manifest.icon === "string" ? (
                <span className="text-white font-medium text-xs">
                  {plugin.manifest.name.substring(0, 2)}
                </span>
              ) : (
                <div className="text-white scale-75">
                  {plugin.manifest.icon}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}

      {/* All apps button */}
      <button
        className="flex flex-col items-center justify-center"
        onClick={() => activeApp && openApp(activeApp)}
      >
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
          <Grid size={24} className="text-white/70" />
        </div>
      </button>
    </div>
  );
};

export default MobileDockBar;

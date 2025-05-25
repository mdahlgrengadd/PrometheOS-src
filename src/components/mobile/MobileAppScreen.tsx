import { ArrowLeft } from "lucide-react";

import { useTheme } from "@/lib/ThemeProvider";
import { Plugin } from "@/plugins/types";

interface MobileAppScreenProps {
  plugin: Plugin | undefined;
  closeApp: () => void;
}

const MobileAppScreen: React.FC<MobileAppScreenProps> = ({
  plugin,
  closeApp,
}) => {
  const { padding } = useTheme();

  if (!plugin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-fade-in flex flex-col">
      {/* App header - fixed */}
      <div className="mobile-app-header px-4 py-3 flex items-center bg-gradient-to-r from-purple-500 to-blue-600">
        <button
          onClick={closeApp}
          className="p-1 rounded-full bg-white/20 transition-transform active:scale-90"
          aria-label="Back to home screen"
        >
          <ArrowLeft className="text-white" size={20} />
        </button>
        <h1 className="ml-4 text-white font-semibold text-xl">
          {plugin.manifest.name}
        </h1>
      </div>

      {/* App content - scrollable with window-content styling */}
      <div className="flex-1 overflow-auto">
        <div
          className="window-content h-full"
          style={{
            minHeight: "100%",
            paddingTop: `${padding}px`,
            paddingRight: `${padding}px`,
            paddingBottom: `${padding}px`,
            paddingLeft: `${padding}px`,
          }}
        >
          {plugin.render()}
        </div>
      </div>
    </div>
  );
};

export default MobileAppScreen;

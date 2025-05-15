import { useState } from "react";
import { toast } from "sonner";

import { installTheme } from "@/lib/theme-loader";
import { useTheme } from "@/lib/ThemeProvider";

/**
 * Component for installing a local theme from the public directory.
 * This is useful for testing themes before publishing them.
 */
const InstallLocalTheme = () => {
  const [themeId, setThemeId] = useState("cool-theme");
  const [isLoading, setIsLoading] = useState(false);
  const { loadTheme } = useTheme();

  const handleInstall = async () => {
    if (!themeId.trim()) return;

    setIsLoading(true);
    try {
      // Construct the URL to the local manifest
      const manifestUrl = `/themes/${themeId}/manifest.json`;
      console.log(`Installing theme from: ${manifestUrl}`);

      const result = await installTheme(manifestUrl);

      if (result.success) {
        toast.success(`Theme '${themeId}' installed successfully`);

        // Automatically load the theme
        try {
          await loadTheme(themeId);
          toast.success(`Theme '${themeId}' activated`);
        } catch (err) {
          console.error("Error loading theme:", err);
          toast.error("Theme installed but failed to activate");
        }
      } else {
        toast.error(result.error || "Failed to install theme");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mb-4">
      <h3 className="text-lg font-medium mb-2">Install Local Theme</h3>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Theme ID (folder name)"
          />
        </div>
        <button
          onClick={handleInstall}
          disabled={isLoading || !themeId.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? "Installing..." : "Install"}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Enter the ID of a theme in the public/themes directory
      </p>
    </div>
  );
};

export default InstallLocalTheme;

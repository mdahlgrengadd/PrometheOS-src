import React, { useState } from "react";

import { useTheme } from "@/lib/ThemeProvider";

import ThemeInstaller from "./ThemeInstaller";

const ThemeManager: React.FC = () => {
  const {
    themes,
    theme: activeTheme,
    setTheme,
    installTheme,
    uninstallTheme,
  } = useTheme();
  const [isUninstallDialogOpen, setIsUninstallDialogOpen] = useState(false);
  const [themeToUninstall, setThemeToUninstall] = useState<string | null>(null);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);

  // One-click install for Windows 7 theme
  const handleInstallWin7 = async () => {
    setError(null);
    try {
      const result = await installTheme("/themes/win7/manifest.json");
      if (!result.success) {
        setError(result.error || "Failed to install Windows 7 theme");
        return;
      }
      // Activate it immediately
      setTheme("win7");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error installing Windows 7 theme"
      );
    }
  };

  // Split themes into built-in and external
  const builtInThemes = Object.entries(themes).filter(
    ([id]) =>
      id === "light" ||
      id === "dark" ||
      id === "beos" ||
      id === "macos" ||
      id === "windows" ||
      id === "fluxbox"
  );

  const externalThemes = Object.entries(themes).filter(
    ([id]) =>
      id !== "light" &&
      id !== "dark" &&
      id !== "beos" &&
      id !== "macos" &&
      id !== "windows" &&
      id !== "fluxbox"
  );

  const handleUninstallClick = (themeId: string) => {
    setThemeToUninstall(themeId);
    setIsUninstallDialogOpen(true);
    setError(null);
  };

  const confirmUninstall = async () => {
    if (!themeToUninstall) return;

    setIsUninstalling(true);
    try {
      // If we're uninstalling the active theme, switch to light theme
      if (activeTheme === themeToUninstall) {
        setTheme("light");
      }

      const success = await uninstallTheme(themeToUninstall);
      if (!success) {
        throw new Error(`Failed to uninstall theme: ${themeToUninstall}`);
      }
      setIsUninstallDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to uninstall theme"
      );
    } finally {
      setIsUninstalling(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Theme Manager</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleInstallWin7}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md"
          >
            Install Windows 7
          </button>
          <button
            onClick={() => setIsInstallerOpen(true)}
            className="px-3 py-1.5 border border-border text-sm rounded-md"
          >
            Install New Theme
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {builtInThemes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Built-in Themes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {builtInThemes.map(([themeId, themeConfig]) => (
              <div
                key={themeId}
                className={`border p-4 rounded-lg cursor-pointer transition-all ${
                  activeTheme === themeId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setTheme(themeId)}
              >
                <div className="flex items-center mb-2">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      activeTheme === themeId ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                  <h4 className="font-medium">{themeConfig.name}</h4>
                </div>
                <div className="text-xs text-gray-500">
                  {themeConfig.description || "Built-in theme"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {externalThemes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Installed Themes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {externalThemes.map(([themeId, themeConfig]) => (
              <div
                key={themeId}
                className={`border p-4 rounded-lg transition-all ${
                  activeTheme === themeId
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        activeTheme === themeId ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                    <h4 className="font-medium">{themeConfig.name}</h4>
                  </div>
                  <button
                    className="text-xs text-red-600 hover:text-red-800 hover:underline"
                    onClick={() => handleUninstallClick(themeId)}
                  >
                    Remove
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {themeConfig.description || "External theme"}
                </div>
                <div
                  className="text-xs px-2 py-1 bg-gray-100 inline-block rounded cursor-pointer"
                  onClick={() => setTheme(themeId)}
                >
                  {activeTheme === themeId ? "Active" : "Activate"}
                </div>
                {themeConfig.author && (
                  <div className="text-xs text-gray-500 mt-2">
                    By: {themeConfig.author}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {externalThemes.length === 0 && (
        <div className="border rounded-md p-4 mb-4">
          <p className="text-sm text-gray-500">
            No external themes are currently installed. Click "Install New
            Theme" to add a theme.
          </p>
        </div>
      )}

      {isUninstallDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Remove Theme</h3>
            <p className="mb-4">
              Are you sure you want to remove this theme? This action cannot be
              undone.
            </p>
            {error && (
              <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsUninstallDialogOpen(false)}
                disabled={isUninstalling}
                className="px-3 py-1.5 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmUninstall}
                disabled={isUninstalling}
                className={`px-3 py-1.5 bg-red-600 text-white rounded-md ${
                  isUninstalling ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUninstalling ? "Removing..." : "Remove Theme"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isInstallerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ThemeInstaller onCancel={() => setIsInstallerOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default ThemeManager;

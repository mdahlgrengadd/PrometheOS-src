import React, { useState } from "react";

import { ThemeType } from "@/lib/theme-types";
import { useTheme } from "@/lib/ThemeProvider";

import ThemeInstaller from "./ThemeInstaller";

interface InstalledThemeItemProps {
  themeId: string;
  themeName: string;
  preview?: string;
  currentTheme: string;
  onSelect: () => void;
  onUninstall: () => void;
}

const InstalledThemeItem: React.FC<InstalledThemeItemProps> = ({
  themeId,
  themeName,
  preview,
  currentTheme,
  onSelect,
  onUninstall,
}) => {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
      <div
        className="flex items-center cursor-pointer flex-1"
        onClick={onSelect}
      >
        {preview && (
          <div className="mr-2 flex-shrink-0">
            <img
              src={preview}
              alt={`${themeName} preview`}
              className="w-8 h-8 rounded border border-border object-cover"
            />
          </div>
        )}
        {!preview && (
          <div
            className={`w-4 h-4 rounded-full mr-2 ${
              currentTheme === themeId ? "bg-primary" : "bg-border"
            }`}
          />
        )}
        <span>{themeName}</span>
      </div>
      {themeId !== "light" && themeId !== "dark" && themeId !== "beos" && (
        <button
          onClick={onUninstall}
          className="text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive px-2 py-0.5 rounded"
        >
          Remove
        </button>
      )}
    </div>
  );
};

const ThemeSelector: React.FC = () => {
  const {
    theme,
    setTheme,
    themes,
    loadTheme,
    availableExternalThemes,
    uninstallTheme,
  } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstaller, setShowInstaller] = useState(false);

  const handleThemeChange = async (themeId: string) => {
    setError(null);

    // If theme is already loaded, just set it
    if (themes[themeId]) {
      setTheme(themeId as ThemeType);
      return;
    }

    // Otherwise, try to load it
    if (availableExternalThemes.includes(themeId)) {
      setLoading(true);
      try {
        const success = await loadTheme(themeId);
        if (!success) {
          setError(`Failed to load theme: ${themeId}`);
        }
      } catch (error) {
        setError("Error loading theme");
        console.error("Error loading theme:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUninstallTheme = async (themeId: string) => {
    setError(null);
    setLoading(true);

    try {
      const success = await uninstallTheme(themeId);
      if (!success) {
        setError(`Failed to uninstall theme: ${themeId}`);
      }
    } catch (error) {
      setError("Error uninstalling theme");
      console.error("Error uninstalling theme:", error);
    } finally {
      setLoading(false);
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

  return (
    <div
      className="theme-selector p-2 flex flex-col gap-2 items-start bg-background/80 rounded shadow backdrop-blur"
      role="region"
      aria-label="Theme selection"
    >
      <div className="flex w-full items-center justify-between">
        <label className="text-sm font-medium" id="theme-select-label">
          Themes
        </label>
        <button
          onClick={() => setShowInstaller(true)}
          className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded"
        >
          Install Theme
        </button>
      </div>

      <div
        className="w-full max-h-[220px] overflow-y-auto divide-y"
        aria-busy={loading}
      >
        {loading && (
          <div className="text-xs p-2 text-muted-foreground animate-pulse">
            Loading...
          </div>
        )}

        {error && (
          <div
            id="theme-error"
            className="text-xs p-2 text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="py-1">
          <div className="text-xs text-muted-foreground px-2 py-1">
            Built-in
          </div>
          {builtInThemes.map(([themeId, themeConfig]) => (
            <InstalledThemeItem
              key={themeId}
              themeId={themeId}
              themeName={themeConfig.name}
              preview={themeConfig.preview}
              currentTheme={theme}
              onSelect={() => handleThemeChange(themeId)}
              onUninstall={() => {}}
            />
          ))}
        </div>

        {externalThemes.length > 0 && (
          <div className="py-1">
            <div className="text-xs text-muted-foreground px-2 py-1">
              Installed
            </div>
            {externalThemes.map(([themeId, themeConfig]) => (
              <InstalledThemeItem
                key={themeId}
                themeId={themeId}
                themeName={themeConfig.name}
                preview={themeConfig.preview}
                currentTheme={theme}
                onSelect={() => handleThemeChange(themeId)}
                onUninstall={() => handleUninstallTheme(themeId)}
              />
            ))}
          </div>
        )}

        {availableExternalThemes.filter((id) => !themes[id as ThemeType])
          .length > 0 && (
          <div className="py-1">
            <div className="text-xs text-muted-foreground px-2 py-1">
              Available
            </div>
            {availableExternalThemes
              .filter((id) => !themes[id as ThemeType])
              .map((themeId) => (
                <div
                  key={themeId}
                  className="flex items-center px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                  onClick={() => handleThemeChange(themeId)}
                >
                  <span className="text-sm">{themeId}</span>
                  <span className="text-xs ml-2 text-muted-foreground">
                    (Click to load)
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {showInstaller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ThemeInstaller onClose={() => setShowInstaller(false)} />
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

import React, { useState } from "react";

import { WindowsButton } from "@/components/franky-ui-kit/Button";
import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

import InstallLocalTheme from "./InstallLocalTheme";
import ThemeInstaller from "./ThemeInstaller";
import styles from "./ThemeManager.module.css";

const ThemeManager: React.FC = () => {
  const {
    themes,
    theme: activeTheme,
    setTheme,
    loadTheme,
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
      // Wait for the theme to be registered in the theme system before loading
      // This ensures the theme is available in the context
      setTimeout(async () => {
        const success = await loadTheme("win7");
        if (!success) {
          setError("Failed to activate Windows 7 theme after install");
        }
      }, 100); // Small delay to allow theme registration
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
      // If we're uninstalling the active theme, switch to light theme using loadTheme
      if (activeTheme === themeToUninstall) {
        await loadTheme("light");
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
        <h3 className="text-lg font-semibold">Themes</h3>
        <div className="flex gap-2">
          <WindowsButton
            onClick={handleInstallWin7}
            variant="default"
            className={styles.themeButton}
          >
            Install Windows 7
          </WindowsButton>
          <WindowsButton
            onClick={() => setIsInstallerOpen(true)}
            variant="outline"
            className={styles.themeButton}
          >
            Install Theme
          </WindowsButton>
        </div>
      </div>
      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      {/* Built-in themes */}
      {builtInThemes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Built-in Themes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {builtInThemes.map(([id, theme]) => (
              <div
                key={id}
                className={styles.themeCard}
                style={{
                  border: "2px solid var(--wm-border-color)",
                  background:
                    activeTheme === id
                      ? "var(--theme-card-active-bg, #e6f0ff)"
                      : "var(--background, #fff)",
                  boxShadow:
                    activeTheme === id
                      ? "0 0 0 2px var(--accent, #4096e3)"
                      : undefined,
                  transition: "box-shadow 0.2s",
                  cursor: activeTheme === id ? "default" : "pointer",
                }}
                onClick={async () => {
                  if (activeTheme === id) return;
                  setError(null);
                  try {
                    const success = await loadTheme(id);
                    if (!success) {
                      setError(`Failed to load theme: ${id}`);
                    }
                  } catch (err) {
                    setError(`Error loading theme: ${id}`);
                  }
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-base mr-2">
                    {theme.name || id}
                  </span>
                  {activeTheme === id && (
                    <span className="ml-1 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {theme.description || ""}
                </div>
                <div className={styles.themeButtonsContainer}>
                  {activeTheme !== id && (
                    <WindowsButton
                      variant="default"
                      className={styles.themeActivateButton}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setError(null);
                        try {
                          const success = await loadTheme(id);
                          if (!success) {
                            setError(`Failed to load theme: ${id}`);
                          }
                        } catch (err) {
                          setError(`Error loading theme: ${id}`);
                        }
                      }}
                    >
                      Activate
                    </WindowsButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* External themes */}
      {externalThemes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Installed Themes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {externalThemes.map(([id, theme]) => (
              <div
                key={id}
                className={styles.themeCard}
                style={{
                  border: "2px solid var(--wm-border-color)",
                  background:
                    activeTheme === id
                      ? "var(--theme-card-active-bg, #e6f0ff)"
                      : "var(--background, #fff)",
                  boxShadow:
                    activeTheme === id
                      ? "0 0 0 2px var(--accent, #4096e3)"
                      : undefined,
                  transition: "box-shadow 0.2s",
                }}
              >
                <div className="flex items-center mb-2">
                  <span className="font-semibold text-base mr-2">
                    {theme.name || id}
                  </span>
                  {activeTheme === id && (
                    <span className="ml-1 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {theme.description || ""}
                </div>
                <div className={styles.themeButtonsContainer}>
                  {activeTheme !== id && (
                    <WindowsButton
                      variant="default"
                      className={styles.themeActivateButton}
                      onClick={async () => {
                        setError(null);
                        try {
                          const success = await loadTheme(id);
                          if (!success) {
                            setError(`Failed to load theme: ${id}`);
                          }
                        } catch (err) {
                          setError(`Error loading theme: ${id}`);
                        }
                      }}
                    >
                      Activate
                    </WindowsButton>
                  )}
                  <WindowsButton
                    variant="ghost"
                    className={styles.removeButton}
                    onClick={() => handleUninstallClick(id)}
                    title="Uninstall Theme"
                  >
                    Uninstall
                  </WindowsButton>
                </div>
                {theme.author && (
                  <div className="text-xs text-gray-500 mt-2">
                    By: {theme.author}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* No external themes message */}
      {externalThemes.length === 0 && (
        <div
          className="border rounded-md p-4 mb-4"
          style={{ borderColor: "var(--wm-border-color)" }}
        >
          <span className="text-muted-foreground text-sm">
            No third-party themes are currently installed.
          </span>
        </div>
      )}
      {/* Add our new component for installing local themes */}
      <InstallLocalTheme />
      {/* Uninstall confirmation dialog */}
      {isUninstallDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm border"
            style={{ borderColor: "var(--wm-border-color)" }}
          >
            <h4 className="font-semibold mb-2">Uninstall Theme</h4>
            <p className="mb-4 text-sm">
              Are you sure you want to uninstall this theme? This will remove it
              from your system.
            </p>
            <div className="flex justify-end gap-2">
              <WindowsButton
                onClick={() => setIsUninstallDialogOpen(false)}
                disabled={isUninstalling}
                variant="outline"
                className={styles.themeButton}
              >
                Cancel
              </WindowsButton>
              <WindowsButton
                onClick={confirmUninstall}
                disabled={isUninstalling}
                variant="destructive"
                className={styles.themeButton}
              >
                {isUninstalling ? "Uninstalling..." : "Uninstall"}
              </WindowsButton>
            </div>
          </div>
        </div>
      )}
      {/* Theme installer modal */}
      {isInstallerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-lg">
            <ThemeInstaller
              onInstall={() => {
                setIsInstallerOpen(false);
              }}
              onCancel={() => setIsInstallerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeManager;

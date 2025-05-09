import React, { useEffect, useState } from "react";

import InstalledPluginsList from "@/components/InstalledPluginsList";
import PluginInstaller from "@/components/PluginInstaller";
import ThemeManager from "@/components/ThemeManager";
import { Label } from "@/components/ui/label";
// Import Windows components
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/windows/AlertDialog";
import { WindowsButton } from "@/components/windows/Button";
import { WindowsRadioGroup } from "@/components/windows/RadioGroup";
import { WindowsSwitch } from "@/components/windows/Switch";
import {
  WinTabs,
  WinTabsContent,
  WinTabsList,
  WinTabsTrigger,
} from "@/components/windows/Tabs";
import { WindowSlider } from "@/components/windows/WindowSlider";
import { useViewMode } from "@/hooks/useViewMode";
import { ThemeType } from "@/lib/theme-types";
import { useTheme } from "@/lib/ThemeProvider";
import { resetDesktopState } from "@/utils/resetDesktop";

const SettingsContent: React.FC = () => {
  const {
    theme,
    setTheme,
    themes,
    padding,
    setPadding,
    wallpaper,
    setWallpaper,
    backgroundColor,
    setBackgroundColor,
    primaryColor,
    setPrimaryColor,
  } = useTheme();

  const {
    isMobile: isSmartphoneMode,
    isEnforced: enforceViewMode,
    enforcedMode,
    enforceDesktopMode,
    enforceSmartphoneMode,
    disableEnforcedMode,
  } = useViewMode();

  const [availableWallpapers, setAvailableWallpapers] = useState<string[]>([
    "/wallpapers/background_01.png",
    "/wallpapers/background_02.png",
  ]);

  // For view mode confirmation dialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingMode, setPendingMode] = useState<
    "desktop" | "smartphone" | "disable" | null
  >(null);

  // Desktop feature states
  const [showDesktopIcons, setShowDesktopIcons] = useState(() => {
    return localStorage.getItem("show-desktop-icons") !== "false";
  });

  const [autoHideTaskbar, setAutoHideTaskbar] = useState(() => {
    return localStorage.getItem("taskbar-autohide") === "true";
  });

  const [enableAnimations, setEnableAnimations] = useState(() => {
    return localStorage.getItem("enable-animations") !== "false";
  });

  // Available background colors
  const backgroundColors = [
    { name: "Indigo", value: "#6366f1" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Cyan", value: "#06b6d4" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
    { name: "Pink", value: "#ec4899" },
    { name: "Purple", value: "#a855f7" },
    { name: "Gray", value: "#71717a" },
    { name: "Slate", value: "#334155" },
  ];

  // Plugin installer state
  const [isPluginInstallerOpen, setIsPluginInstallerOpen] = useState(false);

  // Save desktop feature settings to localStorage
  useEffect(() => {
    localStorage.setItem("show-desktop-icons", showDesktopIcons.toString());
    localStorage.setItem("taskbar-autohide", autoHideTaskbar.toString());
    localStorage.setItem("enable-animations", enableAnimations.toString());

    // Apply desktop icons setting to the document
    document.documentElement.style.setProperty(
      "--desktop-icons-visibility",
      showDesktopIcons ? "visible" : "hidden"
    );

    // Apply taskbar auto-hide setting to the document
    document.documentElement.style.setProperty(
      "--taskbar-auto-hide",
      autoHideTaskbar ? "true" : "false"
    );

    // Apply animations setting to the document
    document.documentElement.style.setProperty(
      "--enable-animations",
      enableAnimations ? "true" : "false"
    );
  }, [showDesktopIcons, autoHideTaskbar, enableAnimations]);

  const handleThemeChange = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
  };

  const handlePaddingChange = (value: number[]) => {
    setPadding(value[0]);
  };

  const handleWallpaperChange = (wallpaperPath: string) => {
    setWallpaper(wallpaperPath);
  };

  // Use solid color background
  const useSolidColor = () => {
    setWallpaper(null);
  };

  // Apply the confirmed view mode change
  const applyViewModeChange = () => {
    if (!pendingMode) return;

    if (pendingMode === "desktop") {
      enforceDesktopMode();
    } else if (pendingMode === "smartphone") {
      enforceSmartphoneMode();
    } else if (pendingMode === "disable") {
      disableEnforcedMode();
    }

    // Reset pending mode
    setPendingMode(null);
  };

  // Handle enforced view mode change with confirmation
  const handleEnforceViewModeChange = (checked: boolean) => {
    if (checked) {
      // If enabling enforcement, show confirmation and use current mode as the default
      if (isSmartphoneMode) {
        setPendingMode("smartphone");
      } else {
        setPendingMode("desktop");
      }
      setIsConfirmDialogOpen(true);
    } else {
      // If disabling enforcement, show confirmation
      setPendingMode("disable");
      setIsConfirmDialogOpen(true);
    }
  };

  // Handle enforced mode selection with confirmation
  const handleEnforcedModeChange = (value: string) => {
    // Skip confirmation if selecting the current mode
    if (
      (value === "desktop" && !isSmartphoneMode) ||
      (value === "smartphone" && isSmartphoneMode)
    ) {
      return;
    }

    if (value === "desktop") {
      setPendingMode("desktop");
    } else {
      setPendingMode("smartphone");
    }
    setIsConfirmDialogOpen(true);
  };

  // Get the confirmation dialog message based on the pending mode
  const getConfirmationMessage = () => {
    if (pendingMode === "desktop") {
      return "Switching to Desktop view will close all running applications and may disrupt your current workflow. Are you sure you want to continue?";
    } else if (pendingMode === "smartphone") {
      return "Switching to Smartphone view will close all running applications and may disrupt your current workflow. Are you sure you want to continue?";
    } else {
      return "Disabling enforced view mode will revert to automatic detection based on screen size, which may change your current view and close all running applications. Are you sure you want to continue?";
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">System Settings</h2>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change View Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              {getConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>{" "}
          <AlertDialogFooter>
            {" "}
            <div className="flex justify-end gap-2">
              <WindowsButton
                variant="outline"
                onClick={() => setPendingMode(null)}
              >
                Cancel
              </WindowsButton>
              <WindowsButton onClick={applyViewModeChange}>
                Continue
              </WindowsButton>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WinTabs defaultValue="appearance" className="w-full">
        <WinTabsList className="mb-4">
          <WinTabsTrigger value="appearance">Appearance</WinTabsTrigger>
          <WinTabsTrigger value="display">Display</WinTabsTrigger>
          <WinTabsTrigger value="plugins">Plugins</WinTabsTrigger>
          <WinTabsTrigger value="about">About</WinTabsTrigger>
        </WinTabsList>

        <WinTabsContent value="appearance" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Choose the visual style for your desktop environment
              </p>
            </div>

            <ThemeManager />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Window Padding</h3>
              <p className="text-sm text-muted-foreground">
                Adjust the internal padding of window content
              </p>
            </div>{" "}
            <WindowSlider
              id="window-padding"
              defaultValue={padding}
              onChange={(e) => handlePaddingChange([parseInt(e.target.value)])}
              min={0}
              max={24}
              step={4}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span>
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
              <span>Extra Large</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Changes to padding affect all windows
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Desktop Wallpaper</h3>
              <p className="text-sm text-muted-foreground">
                Customize your desktop background image
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {/* Solid color option */}
              <div
                className={`relative group cursor-pointer ${
                  wallpaper === null ? "ring-2 ring-primary" : ""
                }`}
                onClick={useSolidColor}
              >
                <div className="rounded-md border border-border overflow-hidden aspect-video">
                  <div
                    className="h-full w-full"
                    style={{ background: backgroundColor }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-center">Solid Color</div>
              </div>

              {/* Custom wallpaper options */}
              {availableWallpapers.map((wallpaperPath, index) => (
                <div
                  key={wallpaperPath}
                  className={`relative group cursor-pointer ${
                    wallpaper === wallpaperPath ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleWallpaperChange(wallpaperPath)}
                >
                  <div className="rounded-md border border-border overflow-hidden aspect-video">
                    <div
                      className="h-full w-full"
                      style={{
                        backgroundImage: `url(${wallpaperPath})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-center">
                    Wallpaper {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Color Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Customize the color scheme of your desktop
              </p>
            </div>

            {/* Background color options */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                {backgroundColors.map((color) => (
                  <div
                    key={color.value}
                    className={`relative cursor-pointer ${
                      backgroundColor === color.value
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setBackgroundColor(color.value)}
                    title={color.name}
                  >
                    <div
                      className="h-10 rounded-md"
                      style={{ backgroundColor: color.value }}
                    ></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select a background color for Solid Color mode
              </p>
            </div>

            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`h-12 rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary ${
                    primaryColor === "#a855f7" ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: "#a855f7" }}
                  onClick={() => setPrimaryColor("#a855f7")}
                  title="Purple"
                ></div>
                <div
                  className={`h-12 rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary ${
                    primaryColor === "#71717a" ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: "#71717a" }}
                  onClick={() => setPrimaryColor("#71717a")}
                  title="Gray"
                ></div>
                <div
                  className={`h-12 rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary ${
                    primaryColor === "#3b82f6" ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: "#3b82f6" }}
                  onClick={() => setPrimaryColor("#3b82f6")}
                  title="Blue"
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {theme === "beos"
                  ? "Choose the color for focused window frames in BeOS theme"
                  : "Choose the primary accent color for the interface"}
              </p>
            </div>
          </div>
        </WinTabsContent>

        <WinTabsContent value="display" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Desktop Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Customize how your desktop appears and behaves
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`flex items-center justify-between ${
                  isSmartphoneMode ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label htmlFor="show-desktop-icons">Show desktop icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display application icons on the desktop
                  </p>
                </div>
                <WindowsSwitch
                  id="show-desktop-icons"
                  checked={showDesktopIcons}
                  onCheckedChange={setShowDesktopIcons}
                  disabled={isSmartphoneMode}
                  title={
                    isSmartphoneMode
                      ? "This setting is only available in desktop mode"
                      : ""
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isSmartphoneMode ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label htmlFor="taskbar-autohide">Auto-hide taskbar</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide the taskbar when not in use
                  </p>
                </div>
                <WindowsSwitch
                  id="taskbar-autohide"
                  checked={autoHideTaskbar}
                  onCheckedChange={setAutoHideTaskbar}
                  disabled={isSmartphoneMode}
                  title={
                    isSmartphoneMode
                      ? "This setting is only available in desktop mode"
                      : ""
                  }
                />
              </div>

              <div
                className={`flex items-center justify-between ${
                  isSmartphoneMode ? "opacity-50" : ""
                }`}
              >
                <div>
                  <Label htmlFor="animations">Enable animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Show animations when opening and closing windows
                  </p>
                </div>
                <WindowsSwitch
                  id="animations"
                  checked={enableAnimations}
                  onCheckedChange={setEnableAnimations}
                  disabled={isSmartphoneMode}
                  title={
                    isSmartphoneMode
                      ? "This setting is only available in desktop mode"
                      : ""
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">View Mode Settings</h3>
              <p className="text-sm text-muted-foreground">
                Override the automatic detection of view mode
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enforce-view-mode">Enforce view mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Override automatic screen size detection
                  </p>
                </div>
                <WindowsSwitch
                  id="enforce-view-mode"
                  checked={enforceViewMode}
                  onCheckedChange={handleEnforceViewModeChange}
                />
              </div>

              <div
                className={`space-y-2 ${!enforceViewMode ? "opacity-50" : ""}`}
              >
                {" "}
                <Label>Preferred view mode</Label>
                <WindowsRadioGroup
                  name="view-mode"
                  value={enforcedMode || "desktop"}
                  onChange={handleEnforcedModeChange}
                  options={[
                    { id: "mode-desktop", label: "Desktop", value: "desktop" },
                    {
                      id: "mode-smartphone",
                      label: "Smartphone",
                      value: "smartphone",
                    },
                  ]}
                  legend="Display Mode"
                  fieldset={false}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Changes to view mode are applied after confirmation
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Window Settings</h3>
              <p className="text-sm text-muted-foreground">
                Customize window appearance and behavior
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="window-padding">Window Content Padding</Label>
                  <span className="text-sm text-muted-foreground">
                    {padding}px
                  </span>
                </div>{" "}
                <WindowSlider
                  id="window-padding"
                  min={0}
                  max={32}
                  step={1}
                  value={padding}
                  onChange={(e) =>
                    handlePaddingChange([parseInt(e.target.value)])
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust the padding inside all application windows
                </p>
              </div>
            </div>
          </div>
        </WinTabsContent>

        <WinTabsContent value="plugins" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Plugin Management</h3>
              <p className="text-sm text-muted-foreground">
                Install and manage third-party plugins
              </p>
            </div>

            <div className="border rounded-md p-4 mb-4">
              <h4 className="font-medium mb-2">Install Plugin</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Install plugins from external sources to extend functionality
              </p>{" "}
              <WindowsButton
                variant="default"
                onClick={() => setIsPluginInstallerOpen(true)}
              >
                Install from URL
              </WindowsButton>
              {isPluginInstallerOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <PluginInstaller
                    onClose={() => setIsPluginInstallerOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Installed Plugins List */}
            <InstalledPluginsList />

            <div className="border rounded-md p-4">
              <h4 className="font-medium mb-2">Security Warning</h4>
              <p className="text-sm text-red-500">
                Third-party plugins can access your system and data. Only
                install plugins from trusted sources.
              </p>
            </div>
          </div>
        </WinTabsContent>

        <WinTabsContent value="about" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">About</h3>
              <p className="text-sm text-muted-foreground">
                Draggable Desktop Dreamscape - A modular, customizable browser
                desktop environment
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Version: 1.0.0
              </p>
            </div>

            {/* System Reset Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-destructive">
                  Reset System
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reset your desktop to a fresh state. This will clear all
                  window positions, installed plugins, and customized settings.
                </p>{" "}
                <div className="flex items-center justify-start pt-2">
                  <WindowsButton
                    variant="destructive"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to reset your desktop to its initial state?\n\nThis will remove all installed dynamic plugins, window positions, and custom settings."
                        )
                      ) {
                        resetDesktopState(true); // true = reload page after reset
                      }
                    }}
                    className="mr-2"
                  >
                    Factory Reset
                  </WindowsButton>
                </div>
              </div>
            </div>
          </div>
        </WinTabsContent>
      </WinTabs>
    </div>
  );
};

export default SettingsContent;

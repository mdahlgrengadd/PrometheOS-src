import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeType } from '@/lib/theme-types';
import { useTheme } from '@/lib/ThemeProvider';

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
  } = useTheme();
  const [availableWallpapers, setAvailableWallpapers] = useState<string[]>([
    "/wallpapers/background_01.png",
    "/wallpapers/background_02.png",
  ]);

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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">System Settings</h2>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Choose the visual style for your desktop environment
              </p>
            </div>

            <RadioGroup
              defaultValue={theme}
              onValueChange={(value) => handleThemeChange(value as ThemeType)}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              <div>
                <RadioGroupItem
                  value="beos"
                  id="theme-beos"
                  className="peer sr-only"
                  checked={theme === "beos"}
                />
                <Label
                  htmlFor="theme-beos"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 rounded-md border border-border overflow-hidden w-full">
                    <div className="h-24 bg-gradient-to-b from-blue-200 to-blue-300 relative">
                      <div className="absolute top-2 left-0 right-0 mx-auto w-4/5 h-5 bg-yellow-400 border border-yellow-600 rounded-t flex items-center justify-end px-1 space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="absolute top-7 left-0 right-0 mx-auto w-4/5 h-12 bg-gray-100 border border-gray-400"></div>
                    </div>
                  </div>
                  <span className="font-medium">BeOS Classic</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="light"
                  id="theme-light"
                  className="peer sr-only"
                  checked={theme === "light"}
                />
                <Label
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 rounded-md border border-border overflow-hidden w-full">
                    <div className="h-24 bg-gradient-to-br from-indigo-50 to-slate-100 relative">
                      <div className="absolute top-2 left-0 right-0 mx-auto w-4/5 h-5 bg-gray-100 border border-gray-200 rounded-t flex items-center justify-end px-1 space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      </div>
                      <div className="absolute top-7 left-0 right-0 mx-auto w-4/5 h-12 bg-white border border-gray-200 rounded-b"></div>
                    </div>
                  </div>
                  <span className="font-medium">Modern Light</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="dark"
                  id="theme-dark"
                  className="peer sr-only"
                  checked={theme === "dark"}
                />
                <Label
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <div className="mb-2 rounded-md border border-border overflow-hidden w-full">
                    <div className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 relative">
                      <div className="absolute top-2 left-0 right-0 mx-auto w-4/5 h-5 bg-slate-800 border border-slate-700 rounded-t flex items-center justify-end px-1 space-x-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      </div>
                      <div className="absolute top-7 left-0 right-0 mx-auto w-4/5 h-12 bg-slate-900 border border-slate-700 rounded-b"></div>
                    </div>
                  </div>
                  <span className="font-medium">Modern Dark</span>
                </Label>
              </div>
            </RadioGroup>
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

            <div
              className={`grid grid-cols-3 gap-4 ${
                theme === "beos" ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div
                className="h-12 bg-primary rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary"
                title="Primary Color"
              ></div>
              <div
                className="h-12 bg-secondary rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary"
                title="Secondary Color"
              ></div>
              <div
                className="h-12 bg-accent rounded-md cursor-pointer border-2 border-transparent transition hover:border-primary"
                title="Accent Color"
              ></div>
            </div>

            {theme === "beos" && (
              <p className="text-sm text-muted-foreground italic">
                Color customization is not available in BeOS Classic theme
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Desktop Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Customize how your desktop appears and behaves
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-desktop-icons">Show desktop icons</Label>
                  <p className="text-sm text-muted-foreground">
                    Display application icons on the desktop
                  </p>
                </div>
                <Switch id="show-desktop-icons" defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="taskbar-autohide">Auto-hide taskbar</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide the taskbar when not in use
                  </p>
                </div>
                <Switch id="taskbar-autohide" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">Enable animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Show animations when opening and closing windows
                  </p>
                </div>
                <Switch id="animations" defaultChecked={true} />
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
                </div>
                <Slider
                  id="window-padding"
                  min={0}
                  max={32}
                  step={1}
                  value={[padding]}
                  onValueChange={handlePaddingChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust the padding inside all application windows
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">About this System</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Information about your desktop environment
              </p>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex">
                <span className="font-medium w-32">System Name:</span>
                <span>Draggable Desktop Dreamscape</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Version:</span>
                <span>1.0.0</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Framework:</span>
                <span>React + TypeScript</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">UI Libraries:</span>
                <span>Tailwind CSS, Shadcn/ui</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Current Theme:</span>
                <span>{themes[theme].name}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-muted rounded-md">
              <p className="text-sm">
                This is a desktop environment simulator built with modern web
                technologies. All theme designs and visual elements are for
                demonstration purposes.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsContent;

import React from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeType } from "@/lib/theme-types";
import { useTheme } from "@/lib/ThemeProvider";

const SettingsContent: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();

  const handleThemeChange = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
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
              <h3 className="text-lg font-medium">Color Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Customize the color scheme of your desktop
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

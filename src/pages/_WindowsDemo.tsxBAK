import React, { useEffect, useRef, useState } from 'react';
import { createNoise2D } from 'simplex-noise';

import { WindowsButton } from '@/components/windows/Button';
import { WindowsCheckbox } from '@/components/windows/Checkbox';
import { WinProgress } from '@/components/windows/Progress';
import { WindowsRadioGroup } from '@/components/windows/RadioGroup';
import { WindowsSwitch } from '@/components/windows/Switch';
import { WinTabs, WinTabsContent, WinTabsList, WinTabsTrigger } from '@/components/windows/Tabs';
import { WindowsThemeSwitcher } from '@/components/windows/ThemeSwitcher';
import { WindowsWindow } from '@/components/windows/Window';
import { WindowSlider } from '@/components/windows/WindowSlider';
import { WindowsThemeProvider } from '@/providers/WindowsThemeProvider';

export default function Demo() {
  const [showWindow, setShowWindow] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notifications: false,
    darkMode: false,
  });
  const [mood, setMood] = useState("nicki-minaj");
  const [switch1, setSwitch1] = useState(false);

  // Animated progress value using SimplexNoise for smooth randomness
  const noiseRef = useRef(createNoise2D());
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let frameId: number;
    let currentValue = 0;
    let t = 0;
    // base speed and noise intensity for simulating network loading
    const baseSpeed = 0.01; // slower base increment per frame
    const noiseIntensity = 0.1; // increased noise variation
    const connectionSpeed = 1; // network speed multiplier
    const loop = () => {
      const noiseVal = noiseRef.current(t, 0);
      const noiseDelta = Math.abs(noiseVal) * noiseIntensity;
      const delta = baseSpeed * connectionSpeed + noiseDelta;
      currentValue += delta;
      if (currentValue >= 100) {
        currentValue = 0;
      }
      setAnimatedValue(currentValue);
      t += 0.005; // slower noise evolution
      frameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <WindowsThemeProvider hideNativeScrollbarButtons={true}>
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full space-y-4">
          <WindowsWindow
            title="Windows UI Themes"
            className="mx-auto"
            width="800px"
            height="780px"
            activeOnHover
            activeTarget="window"
          >
            <div className="p-2 flex flex-col gap-4">
              <h1 className="text-xl font-bold">
                Retro Windows UI Component Library
              </h1>
              <p>
                This demo showcases a React component library that switches
                between Windows 98, Windows XP, and Windows 7 visual styles.
              </p>

              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                  Progress Bar Demo
                </h2>
                <div className="space-y-2">
                  <WinProgress indeterminate value={50} />
                  <WinProgress value={80} paused />
                  <WinProgress value={60} error />

                  <WinProgress value={animatedValue} className="animate" />
                </div>
              </div>

              <WinTabs defaultValue="demo">
                <WinTabsList>
                  <WinTabsTrigger value="demo">Demo</WinTabsTrigger>
                  <WinTabsTrigger value="settings">Settings</WinTabsTrigger>
                  <WinTabsTrigger value="about">About</WinTabsTrigger>
                </WinTabsList>
                <WinTabsContent value="demo">
                  <div className="flex flex-wrap">
                    <WindowsButton onClick={() => setShowWindow(true)}>
                      Open Settings
                    </WindowsButton>
                    <WindowsButton onClick={() => setShowAbout(true)}>
                      About
                    </WindowsButton>
                  </div>
                  <WindowsThemeSwitcher />

                  <div className="mt-4 flex gap-4">
                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold mb-2">
                        Horizontal Window Sliders
                      </h2>
                      <WindowSlider
                        defaultValue={30}
                        orientation="horizontal"
                        className="w-60"
                      />
                      <WindowSlider
                        defaultValue={10}
                        orientation="horizontal"
                        className="w-60"
                      />
                      <WindowSlider
                        defaultValue={60}
                        orientation="horizontal"
                        className="w-60"
                      />
                      <WindowSlider
                        defaultValue={10}
                        orientation="horizontal"
                        className="w-60"
                      />
                      <WindowSlider
                        defaultValue={60}
                        orientation="horizontal"
                        className="w-60"
                      />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <h2 className="text-lg font-semibold mb-2">
                        Vertical Window Sliders
                      </h2>
                      <div className="flex justify-between items-center">
                        <WindowSlider
                          defaultValue={30}
                          orientation="vertical"
                          className="h-32"
                        />
                        <WindowSlider
                          defaultValue={10}
                          orientation="vertical"
                          className="h-32"
                        />
                        <WindowSlider
                          defaultValue={60}
                          orientation="vertical"
                          className="h-32"
                        />
                        <WindowSlider
                          defaultValue={70}
                          orientation="vertical"
                          className="h-32"
                        />
                        <WindowSlider
                          defaultValue={40}
                          orientation="vertical"
                          className="h-32"
                        />
                        <WindowSlider
                          defaultValue={50}
                          orientation="vertical"
                          className="h-32"
                        />
                      </div>
                    </div>
                  </div>
                </WinTabsContent>
                <WinTabsContent value="settings">
                  <div className="space-y-2">
                    <WindowsCheckbox
                      label="Enable sound"
                      name="soundEnabled"
                      checked={settings.soundEnabled}
                      onChange={handleCheckboxChange}
                    />
                    <WindowsCheckbox
                      label="Show notifications"
                      name="notifications"
                      checked={settings.notifications}
                      onChange={handleCheckboxChange}
                    />
                    <WindowsCheckbox
                      label="Dark mode"
                      name="darkMode"
                      checked={settings.darkMode}
                      onChange={handleCheckboxChange}
                    />
                  </div>

                  {/* shadcn switch examples */}
                  <div className="space-y-2 mt-4 mb-2">
                    <h3 className="text-md font-semibold">Switch Demo</h3>
                    <div className="flex items-center space-x-2">
                      <WindowsSwitch
                        id="demo-switch-1"
                        checked={switch1}
                        onCheckedChange={setSwitch1}
                      />
                      <label htmlFor="demo-switch-1">
                        Controlled Switch ({switch1 ? "On" : "Off"})
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <WindowsSwitch id="demo-switch-2" defaultChecked />
                      <label htmlFor="demo-switch-2">Uncontrolled Switch</label>
                    </div>
                  </div>

                  <WindowsRadioGroup
                    className="mt-4"
                    options={[
                      {
                        id: "radio30",
                        label: "Nicki Minaj",
                        value: "nicki-minaj",
                      },
                      {
                        id: "radio31",
                        label: "Bell Towers",
                        value: "bell-towers",
                      },
                      {
                        id: "radio32",
                        label: "The Glamorous Monique",
                        value: "glamorous-monique",
                      },
                      { id: "radio33", label: "EN. V", value: "en-v" },
                    ]}
                    name="mood"
                    value={mood}
                    onChange={setMood}
                    fieldset={true}
                    legend="Today's mood"
                  />
                </WinTabsContent>
                <WinTabsContent value="about">
                  <div>
                    <h2 className="font-bold mb-2">
                      Windows UI Theme Switcher
                    </h2>
                    <p className="mb-2">Version 1.0.0</p>
                    <p className="mb-4">
                      A demonstration of hot-swappable Windows themes using
                      React and shadcn/ui.
                    </p>
                    <p className="text-sm mb-4">
                      Based on 98.css, XP.css, and 7.css with Radix UI
                      primitives.
                    </p>
                  </div>
                </WinTabsContent>
              </WinTabs>
            </div>
          </WindowsWindow>
        </div>

        {showWindow && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
            <WindowsWindow
              title="Settings"
              onClose={() => setShowWindow(false)}
              controls={["close"]}
              width="350px"
              activeOnHover
            >
              <div className="p-2">
                <h2 className="font-bold mb-4">Application Settings</h2>
                <div className="space-y-2 mb-4">
                  <WindowsCheckbox
                    label="Enable sound"
                    name="soundEnabled"
                    checked={settings.soundEnabled}
                    onChange={handleCheckboxChange}
                  />
                  <WindowsCheckbox
                    label="Show notifications"
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleCheckboxChange}
                  />
                  <WindowsCheckbox
                    label="Dark mode"
                    name="darkMode"
                    checked={settings.darkMode}
                    onChange={handleCheckboxChange}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <WindowsButton onClick={() => setShowWindow(false)}>
                    OK
                  </WindowsButton>
                </div>
              </div>
            </WindowsWindow>
          </div>
        )}

        {showAbout && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
            <WindowsWindow
              title="About"
              onClose={() => setShowAbout(false)}
              controls={["close"]}
              width="400px"
              activeOnHover
            >
              <div className="p-2">
                <h2 className="font-bold mb-2">Windows UI Theme Switcher</h2>
                <p className="mb-2">Version 1.0.0</p>
                <p className="mb-4">
                  A demonstration of hot-swappable Windows themes using React
                  and shadcn/ui.
                </p>
                <p className="text-sm mb-4">
                  Based on 98.css, XP.css, and 7.css with Radix UI primitives.
                </p>
                <div className="flex justify-end">
                  <WindowsButton onClick={() => setShowAbout(false)}>
                    Close
                  </WindowsButton>
                </div>
              </div>
            </WindowsWindow>
          </div>
        )}
      </div>
    </WindowsThemeProvider>
  );
}

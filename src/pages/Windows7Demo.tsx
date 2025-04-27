import React, { useEffect } from 'react';

import { WindowsWindow } from '@/components/windows/Window';
import { useTheme } from '@/lib/ThemeProvider';

const DemoContent: React.FC = () => {
  const { loadTheme, theme } = useTheme();

  useEffect(() => {
    if (theme !== "win7") {
      (async () => {
        const success = await loadTheme("win7");
        if (!success) {
          console.error("Failed to load Windows 7 theme");
        }
      })();
    }
  }, [loadTheme, theme]);

  return (
    <div
      className="space-y-8 p-4"
      style={{ background: "var(--app-bg)", height: "100vh" }}
    >
      <h1 className="text-2xl font-bold text-foreground">
        Windows 7 Theme Demo
      </h1>

      {/* Normal window */}
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <WindowsWindow
          id="demo-normal"
          title="Normal Window"
          zIndex={10}
          position={{ x: 20, y: 20 }}
          size={{ width: 300, height: 160 }}
          isMaximized={false}
          isOpen={true}
          isMinimized={false}
          onClose={() => {}}
          onMinimize={() => {}}
          onMaximize={() => {}}
          onFocus={() => {}}
          onDragEnd={() => {}}
          onResize={() => {}}
        >
          <div className="p-2 text-sm">
            This is a standard window under the Win7 theme.
          </div>
        </WindowsWindow>
      </div>

      {/* Maximized window */}
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <WindowsWindow
          id="demo-max"
          title="Maximized Window"
          zIndex={5}
          position={{ x: 0, y: 0 }}
          size={{ width: "100%", height: "100%" }}
          isMaximized={true}
          isOpen={true}
          isMinimized={false}
          onClose={() => {}}
          onMinimize={() => {}}
          onMaximize={() => {}}
          onFocus={() => {}}
          onDragEnd={() => {}}
          onResize={() => {}}
        >
          <div className="p-2 text-sm">This window is in maximized state.</div>
        </WindowsWindow>
      </div>
    </div>
  );
};

const Windows7DemoPage: React.FC = () => <DemoContent />;

export default Windows7DemoPage;

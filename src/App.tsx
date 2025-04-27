import "./App.css";

import { useEffect } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import { ThemeProvider, useTheme } from "@/lib/ThemeProvider";
import { PluginProvider } from "@/plugins/PluginContext";

import { WindowDndContext } from "./components/window/WindowDndContext";
import { useViewMode } from "./hooks/useViewMode";
import Index from "./pages/index";
import MobileIndex from "./pages/MobileIndex";
import Windows7DemoPage from "./pages/Windows7Demo";
import Demo from "./pages/WindowsDemo";

function ThemedWindowWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // Only Win7 needs to be wrapped in a .win7 class
  // Win98 and WinXP are global CSS resets that don't need a wrapper
  if (theme === "win7") {
    return <div className="win7">{children}</div>;
  }

  // For Win98, WinXP and other themes, just render children directly
  return <>{children}</>;
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WindowDndContext>
        <ThemedWindowWrapper>{children}</ThemedWindowWrapper>
      </WindowDndContext>
    </ThemeProvider>
  );
}

function App() {
  const { isMobile } = useViewMode();

  return (
    <AppProviders>
      <BrowserRouter>
        {/* Navigation Links */}
        <div className="p-2 bg-gray-100 border-b">
          <Link to="/demo" className="mr-4 text-blue-600 hover:underline">
            Windows Demo
          </Link>
          <Link to="/windows7-demo" className="text-blue-600 hover:underline">
            Win7 Demo
          </Link>
        </div>
        <Routes>
          <Route path="/" element={isMobile ? <MobileIndex /> : <Index />} />
          <Route path="/demo" element={isMobile ? <MobileIndex /> : <Demo />} />
          <Route
            path="/windows7-demo"
            element={isMobile ? <MobileIndex /> : <Windows7DemoPage />}
          />
          <Route
            path="/apps/:id"
            element={isMobile ? <MobileIndex /> : <Index />}
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;

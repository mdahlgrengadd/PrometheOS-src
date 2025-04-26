import "./App.css";

import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ThemeProvider, useTheme } from "@/lib/ThemeProvider";
import { PluginProvider } from "@/plugins/PluginContext";

import { WindowDndContext } from "./components/window/WindowDndContext";
import { useViewMode } from "./hooks/useViewMode";
import Index from "./pages/index";
import MobileIndex from "./pages/MobileIndex";
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
        <Routes>
          <Route path="/" element={isMobile ? <MobileIndex /> : <Index />} />
          <Route path="/demo" element={isMobile ? <MobileIndex /> : <Demo />} />
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

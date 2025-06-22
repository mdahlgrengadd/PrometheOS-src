import './App.css';

import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import DialogListener from '@/components/DialogListener';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import WasmVFSInitializer from '@/components/WasmVFSInitializer';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { WasmKernelProvider } from '@/lib/wasm/WasmKernelProvider';

import { WindowDndContext } from './components/shelley-wm/WindowDndContext';
import { useViewMode } from './hooks/useViewMode';

// Lazy-loaded pages
const Index = lazy(() => import("./pages/index"));
const MobileIndex = lazy(() => import("./pages/MobileIndex"));

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WasmKernelProvider>
        <WindowDndContext>{children}</WindowDndContext>
      </WasmKernelProvider>
    </ThemeProvider>
  );
}

function App() {
  const { isMobile } = useViewMode();

  return (
    <AppProviders>
      {" "}
      <Router>
        <WasmVFSInitializer />
        <Suspense
          fallback={
            <div
              style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.0rem",
                color: "white",
              }}
            >
              Loading...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={isMobile ? <MobileIndex /> : <Index />} />
            <Route
              path="/apps/:id"
              element={isMobile ? <MobileIndex /> : <Index />}
            />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
      <SonnerToaster />
      <DialogListener />
    </AppProviders>
  );
}

export default App;

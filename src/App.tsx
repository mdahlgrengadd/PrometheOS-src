import './App.css';

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import DialogListener from '@/components/DialogListener';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/ThemeProvider';

import { WindowDndContext } from './components/shelley-wm/WindowDndContext';
import { useViewMode } from './hooks/useViewMode';

// Lazy-loaded pages
const Index = lazy(() => import("./pages/index"));
const MobileIndex = lazy(() => import("./pages/MobileIndex"));

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <WindowDndContext>{children}</WindowDndContext>
    </ThemeProvider>
  );
}

function App() {
  const { isMobile } = useViewMode();

  return (
    <AppProviders>
      <BrowserRouter>
        <Suspense
          fallback={
            <div
              style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
      </BrowserRouter>
      <Toaster />
      <SonnerToaster />
      <DialogListener />
    </AppProviders>
  );
}

export default App;

import './App.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import DialogListener from '@/components/DialogListener';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/ThemeProvider';

import { WindowDndContext } from './components/shelley-wm/WindowDndContext';
import { useViewMode } from './hooks/useViewMode';
import Index from './pages/index';
import MobileIndex from './pages/MobileIndex';

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
        {/* Navigation Links */}

        <Routes>
          <Route path="/" element={isMobile ? <MobileIndex /> : <Index />} />

          <Route
            path="/apps/:id"
            element={isMobile ? <MobileIndex /> : <Index />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <SonnerToaster />
      <DialogListener />
    </AppProviders>
  );
}

export default App;

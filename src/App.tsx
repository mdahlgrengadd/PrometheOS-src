import './App.css';

import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ThemeProvider } from '@/lib/ThemeProvider';
import { PluginProvider } from '@/plugins/PluginContext';

import { WindowDndContext } from './components/window/WindowDndContext';
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
        <Routes>
          <Route path="/" element={isMobile ? <MobileIndex /> : <Index />} />
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

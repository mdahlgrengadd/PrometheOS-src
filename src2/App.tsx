import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Create a debug log for startup
const DEBUG = true;

// Add type for legacy navigator properties
interface NavigatorWithLegacyProperties extends Navigator {
  pointerEnabled?: boolean;
}

const queryClient = new QueryClient();

const App = () => {
  // Add debug logging for initial app load
  useEffect(() => {
    if (DEBUG) {
      console.log("[APP DEBUG] App component mounted");
      console.log("[APP DEBUG] User agent:", navigator.userAgent);
      console.log("[APP DEBUG] Window dimensions:", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      console.log("[APP DEBUG] Device pixel ratio:", window.devicePixelRatio);

      // Log the pointer features for debugging
      if ("maxTouchPoints" in navigator) {
        console.log("[APP DEBUG] Max touch points:", navigator.maxTouchPoints);
      }
      if ("pointerEnabled" in navigator) {
        console.log(
          "[APP DEBUG] Pointer enabled:",
          (navigator as NavigatorWithLegacyProperties).pointerEnabled
        );
      }

      console.log(
        "[APP DEBUG] Is Windows:",
        navigator.userAgent.indexOf("Windows") > -1
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Add a root div with explicit pointer-events and z-index to ensure proper stacking */}
          <div
            className="app-root"
            style={{
              position: "relative",
              zIndex: 0,
              height: "100vh",
              width: "100vw",
              overflow: "hidden",
              pointerEvents: "auto",
              touchAction: "manipulation",
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

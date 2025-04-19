import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./lib/ThemeProvider";
import Index from "./pages/index";
import MobileIndex from "./pages/MobileIndex";
import NotFound from "./pages/NotFound";

// Define mobile breakpoint
const MOBILE_BREAKPOINT = 768;

// Interface for legacy Navigator properties
interface NavigatorWithMSMaxTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

const queryClient = new QueryClient();

const App = () => {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  // Detect if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      // Check screen width
      const isMobileWidth = window.innerWidth < MOBILE_BREAKPOINT;

      // Additional check for touch support (most mobile devices)
      const hasTouchSupport =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as NavigatorWithMSMaxTouchPoints).msMaxTouchPoints > 0;

      // On Windows, favor the width detection more than touch capability
      const isWindowsPlatform = navigator.userAgent.includes("Windows");

      if (isWindowsPlatform) {
        // For Windows: primarily rely on screen width
        setIsMobile(isMobileWidth);
      } else {
        // For other platforms: consider both width and touch support
        setIsMobile(
          isMobileWidth || (hasTouchSupport && window.innerWidth < 1024)
        );
      }
    };

    // Check initially
    checkMobile();

    // Set up listeners for resize
    window.addEventListener("resize", checkMobile);

    // Also listen for orientation change for better mobile detection
    window.addEventListener("orientationchange", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={isMobile ? <MobileIndex /> : <Index />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

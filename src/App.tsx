import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useViewMode } from "@/hooks/useViewMode";
import MobileIndex from "@/pages/MobileIndex";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./lib/ThemeProvider";
import AppLauncher from "./pages/AppLauncher";
import Index from "./pages/index";
import NotFound from "./pages/NotFound";

// Define mobile breakpoint
const MOBILE_BREAKPOINT = 768;

// Custom event for view mode changes
const VIEW_MODE_CHANGE_EVENT = "viewmode:change";

// Interface for legacy Navigator properties
interface NavigatorWithMSMaxTouchPoints extends Navigator {
  msMaxTouchPoints?: number;
}

const queryClient = new QueryClient();

const App = () => {
  const { isMobile } = useViewMode();

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
              {/* App launcher route */}
              <Route path="/apps/:appId" element={<AppLauncher />} />
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

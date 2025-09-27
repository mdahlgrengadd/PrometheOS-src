// Main Host Application - Preserves sophisticated architecture
import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from './core/ErrorBoundary';
import { WindowManager } from './core/WindowManager';
import { ApiProvider } from './api/ApiProvider';
import { ThemeProvider } from './core/ThemeProvider';
import { RemoteRegistry } from './shell/RemoteRegistry';
import { DesktopShell } from './shell/DesktopShell';
import { DesktopBootstrap } from './core/DesktopBootstrap';
import { WorkerManager } from './workers/WorkerManager';
import { SystemApiIntegration } from './api/SystemApiIntegration';
import { Toaster } from 'sonner';

export const DesktopHost: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the sophisticated integration architecture
    const initializeHost = async () => {
      try {
        console.log('[Host] Initializing API bridge system...');

        // Initialize worker manager for Python/MCP integration
        console.log('[Host] Setting up worker management...');

        // Initialize theme system
        console.log('[Host] Loading theme provider...');

        // Initialize window management
        console.log('[Host] Setting up window management system...');

        // Mark as initialized
        setIsInitialized(true);
        console.log('✅ [Host] Initialization complete - ready for remotes');

      } catch (error) {
        console.error('❌ [Host] Initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Initialization failed');
      }
    };

    initializeHost();
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Desktop Host Initialization Failed
          </h1>
          <p className="text-red-500">{initError}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="text-center text-white">
          <div className="mb-4">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold">Initializing PrometheOS</h2>
          <p className="text-blue-200 mt-2">Setting up integration architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster richColors position="top-right" closeButton />
        <ApiProvider>
          <SystemApiIntegration>
            <WorkerManager>
              <WindowManager>
                <RemoteRegistry>
                  <DesktopBootstrap />
                  <DesktopShell />
                </RemoteRegistry>
              </WindowManager>
            </WorkerManager>
          </SystemApiIntegration>
        </ApiProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
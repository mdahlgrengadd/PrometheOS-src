// Remote Window Renderer - Renders Module Federation remotes in windows
import React, { Suspense, useMemo } from 'react';
import { RemoteErrorBoundary } from '../core/ErrorBoundary';
import { useRemoteRegistry } from './RemoteRegistry';
import { WindowState } from '../types/window';
import { ApiClientProvider } from '../api/ApiClientProvider';

interface RemoteWindowRendererProps {
  window: WindowState;
  /**
   * API Pattern selection for this remote
   * - 'context': Use React Context Pattern (clean React integration)
   * - 'bridge': Use Module Federation Bridge Pattern (cross-framework support)
   * - 'auto': Automatically detect the best pattern (default)
   */
  apiPattern?: 'context' | 'bridge' | 'auto';
}

export const RemoteWindowRenderer: React.FC<RemoteWindowRendererProps> = ({
  window,
  apiPattern = 'auto'
}) => {
  const { loadRemote } = useRemoteRegistry();

  console.log(`[RemoteWindowRenderer] Rendering window: ${window.id}, isOpen: ${window.isOpen}, apiPattern: ${apiPattern}`);

  // Create a dynamic remote component loader (memoized per window.id)
  const RemoteComponent = useMemo(() => {
    return React.lazy(async () => {
      try {
        console.log(`[RemoteWindowRenderer] Loading remote component for: ${window.id}`);
        const Component = await loadRemote(window.id);
        console.log(`[RemoteWindowRenderer] Remote component loaded for ${window.id}:`, !!Component);
        return Component ? { default: Component } : { default: () => <div>Remote not found</div> };
      } catch (error) {
        console.error(`[RemoteWindowRenderer] Failed to load remote ${window.id}:`, error);
        return { default: () => <div>Failed to load remote</div> };
      }
    });
  }, [loadRemote, window.id]);

  // Determine the actual API pattern to use
  const effectiveApiPattern = useMemo(() => {
    if (apiPattern !== 'auto') {
      return apiPattern;
    }

    // Auto-detection logic - for now, default to bridge for backward compatibility
    // In the future, this could inspect the remote component or use configuration
    console.log(`[RemoteWindowRenderer] Auto-detecting API pattern for ${window.id} - using bridge for compatibility`);
    return 'bridge';
  }, [apiPattern, window.id]);

  const windowStyle: React.CSSProperties = window.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: window.zIndex,
      }
    : {
        position: 'absolute',
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      };

  // Create the remote component with appropriate API pattern wrapper
  const remoteComponent = (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading {window.title}...</p>
          </div>
        </div>
      }
    >
      <RemoteComponent />
    </Suspense>
  );

  console.log(`[RemoteWindowRenderer] Using ${effectiveApiPattern} pattern for ${window.id}`);

  return (
    <div
      className="remote-window pointer-events-auto"
      style={windowStyle}
    >
      <div className="window-container bg-background border rounded-lg shadow-lg overflow-hidden h-full">
        <RemoteErrorBoundary remoteName={window.id}>
          {effectiveApiPattern === 'context' ? (
            <ApiClientProvider remoteId={window.id}>
              {remoteComponent}
            </ApiClientProvider>
          ) : (
            remoteComponent
          )}
        </RemoteErrorBoundary>
      </div>
    </div>
  );
};

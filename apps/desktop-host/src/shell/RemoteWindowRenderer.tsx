// Remote Window Renderer - Renders Module Federation remotes in windows
import React, { Suspense } from 'react';
import { RemoteErrorBoundary } from '../core/ErrorBoundary';
import { useRemoteRegistry } from './RemoteRegistry';
import { WindowState } from '../types/window';

interface RemoteWindowRendererProps {
  window: WindowState;
}

export const RemoteWindowRenderer: React.FC<RemoteWindowRendererProps> = ({ window }) => {
  const { loadRemote } = useRemoteRegistry();

  // Create a dynamic remote component loader
  const RemoteComponent = React.lazy(async () => {
    try {
      const Component = await loadRemote(window.id);
      return Component ? { default: Component } : { default: () => <div>Remote not found</div> };
    } catch (error) {
      console.error(`Failed to load remote ${window.id}:`, error);
      return { default: () => <div>Failed to load remote</div> };
    }
  });

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

  return (
    <div
      className="remote-window pointer-events-auto"
      style={windowStyle}
    >
      <div className="window-container bg-background border rounded-lg shadow-lg overflow-hidden h-full">
        <RemoteErrorBoundary remoteName={window.id}>
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
        </RemoteErrorBoundary>
      </div>
    </div>
  );
};
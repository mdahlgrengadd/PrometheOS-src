// Host API Bridge - Federation export for remotes
import React from 'react';

/**
 * Host API Bridge Provider for remotes
 * Sets up remote ID and provides bridge availability info
 */
export const HostApiBridgeProvider: React.FC<{
  children: React.ReactNode;
  remoteId?: string;
}> = ({ children, remoteId }) => {
  // Set remote ID if provided
  React.useEffect(() => {
    if (remoteId && typeof window !== 'undefined') {
      window.__REMOTE_ID__ = remoteId;
    }
  }, [remoteId]);

  // Check if host bridge is available
  const hasHostBridge = typeof window !== 'undefined' && !!window.__HOST_API_BRIDGE__;

  if (hasHostBridge) {
    console.log(`[Host Bridge] Bridge available for remote: ${remoteId || 'unknown'}`);
  } else {
    console.log('[Host Bridge] No host bridge available, components will use fallback mode');
  }

  // Just render children - components will use the host bridge via hooks
  return <>{children}</>;
};

/**
 * Hook to access the host API bridge directly
 * For remotes that need direct bridge access
 */
export const useHostApiBridge = () => {
  if (typeof window === 'undefined' || !window.__HOST_API_BRIDGE__) {
    throw new Error('Host API Bridge not available');
  }
  return window.__HOST_API_BRIDGE__;
};

/**
 * Hook to check if host bridge is available
 */
export const useHostBridgeAvailable = () => {
  return typeof window !== 'undefined' && !!window.__HOST_API_BRIDGE__;
};

// Re-export the API provider from this module for convenience
export { ApiProvider } from './ApiProvider';
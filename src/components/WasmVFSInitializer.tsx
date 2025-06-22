import React from 'react';

import { useWasmVFS } from '@/hooks/useWasmVFS';

/**
 * Component to initialize WASM VFS integration
 * Should be rendered early in the app lifecycle
 */
export const WasmVFSInitializer: React.FC = () => {
  const { isEnabled, isInitializing, error } = useWasmVFS();

  if (error) {
    console.warn("WASM VFS initialization failed:", error);
  }

  // This component doesn't render anything visible
  // It just handles the initialization side effect
  return null;
};

export default WasmVFSInitializer;

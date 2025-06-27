import { useEffect, useState } from 'react';

import { virtualFs } from '@/utils/virtual-fs';

import { useWasmKernel } from './useWasmKernel';

export interface WasmVFSState {
  isEnabled: boolean;
  isInitializing: boolean;
  error: string | null;
}

/**
 * Hook to initialize and manage WASM VFS integration
 * Automatically enables WASM backend when WASM kernel is ready
 */
export function useWasmVFS() {
  const { api, state } = useWasmKernel();
  const [wasmVFSState, setWasmVFSState] = useState<WasmVFSState>({
    isEnabled: false,
    isInitializing: false,
    error: null,
  });

  useEffect(() => {
    const initializeWasmVFS = async () => {
      if (!api || !state.isInitialized) return;

      if (wasmVFSState.isEnabled || wasmVFSState.isInitializing) return;

      console.log("🔄 Initializing WASM VFS integration...");
      setWasmVFSState((prev) => ({
        ...prev,
        isInitializing: true,
        error: null,
      }));
      try {
        // First, ensure VFS is initialized with shadow data
        console.log("📂 Initializing VFS from shadow folder...");
        await virtualFs.initializeOnce();
        console.log("✅ VFS initialized with shadow data");

        // Then enable WASM backend for the virtual filesystem
        console.log("🔗 Enabling WASM backend...");
        await virtualFs.enableWasmBackend(api);

        setWasmVFSState({
          isEnabled: true,
          isInitializing: false,
          error: null,
        });

        console.log("✅ WASM VFS integration initialized successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        setWasmVFSState({
          isEnabled: false,
          isInitializing: false,
          error: errorMessage,
        });

        console.error("❌ Failed to initialize WASM VFS integration:", error);
      }
    };

    initializeWasmVFS();
  }, [
    api,
    state.isInitialized,
    wasmVFSState.isEnabled,
    wasmVFSState.isInitializing,
  ]);

  return {
    ...wasmVFSState,
    virtualFs, // Provide access to the VFS instance
  };
}

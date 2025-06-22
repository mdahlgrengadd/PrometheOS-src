import React, { useCallback, useEffect, useState } from 'react';

import { WasmKernelContext } from './context';

import type {
  WasmKernelState,
  WasmKernelAPI,
  FSMessage,
  ProcStat,
} from "./types";
import type { EmscriptenModule } from "@/types/wasm";

// Helper function to dynamically load WASM module
async function loadWasmModule(
  url: string
): Promise<(options?: object) => Promise<EmscriptenModule>> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      // The script defines WasmCore globally
      const globalWindow = window as typeof window & {
        WasmCore?: (options?: object) => Promise<EmscriptenModule>;
      };
      if (typeof globalWindow.WasmCore === "function") {
        resolve(globalWindow.WasmCore);
      } else {
        reject(new Error("WASM module not found on window object"));
      }
    };
    script.onerror = () =>
      reject(new Error(`Failed to load WASM module from ${url}`));
    document.head.appendChild(script);
  });
}

interface WasmKernelProviderProps {
  children: React.ReactNode;
}

export const WasmKernelProvider: React.FC<WasmKernelProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<WasmKernelState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    module: null,
  });

  const [eventListeners, setEventListeners] = useState<
    Set<(event: FSMessage) => void>
  >(new Set());

  const initialize = useCallback(async () => {
    if (state.isInitialized || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Load the WASM module from public directory
      // Use dynamic script loading to avoid build-time resolution issues
      // Get base URL from Vite environment
      const baseUrl = import.meta.env.BASE_URL || "/";
      const wasmModuleUrl = new URL(
        `${baseUrl}wasm/core.js`,
        window.location.origin
      );

      console.log("🔍 Loading WASM from:", wasmModuleUrl.href);
      console.log("🔍 Base URL:", baseUrl);
      const WasmCore = await loadWasmModule(wasmModuleUrl.href); // Initialize the WASM module
      const wasmModule = await WasmCore({
        onRuntimeInitialized: function () {
          console.log("🚀 WASM Kernel initialized successfully");

          // Mount filesystems and start kernel
          try {
            // Use 'this' to refer to the module in the callback
            (this as EmscriptenModule).callMain();
            console.log("✅ WASM Kernel main loop started");
          } catch (error) {
            console.error("❌ Failed to start kernel main loop:", error);
          }
        },

        print: (text: string) => {
          console.log(`[WASM]: ${text}`);
        },

        printErr: (text: string) => {
          console.error(`[WASM Error]: ${text}`);
        },
        locateFile: (path: string, scriptDirectory: string) => {
          // Ensure WASM file is loaded from the correct location with base URL
          const baseUrl = import.meta.env.BASE_URL || "/";
          if (path.endsWith(".wasm")) {
            return `${baseUrl}wasm/${path}`;
          }
          return scriptDirectory + path;
        },
      });
      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        module: wasmModule,
      }));
    } catch (error) {
      console.error("❌ Failed to initialize WASM kernel:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, [state.isInitialized, state.isLoading]);

  // Create API methods
  const api: WasmKernelAPI | null = state.module
    ? {
        readFile: async (path: string): Promise<Uint8Array> => {
          try {
            const data = state.module!.FS.readFile(path);
            if (data instanceof Uint8Array) {
              return data;
            }
            // Convert string to Uint8Array if needed
            return new TextEncoder().encode(data as string);
          } catch (error) {
            throw new Error(`Failed to read file ${path}: ${error}`);
          }
        },

        writeFile: async (path: string, data: Uint8Array): Promise<void> => {
          try {
            state.module!.FS.writeFile(path, data);

            // Emit FS_CHANGED event
            eventListeners.forEach((listener) => {
              listener({
                version: 1,
                type: "FS_CHANGED",
                flags: 0,
                seq: Date.now(),
                data_len: data.length,
                path,
              });
            });
          } catch (error) {
            throw new Error(`Failed to write file ${path}: ${error}`);
          }
        },

        deleteFile: async (path: string): Promise<void> => {
          try {
            state.module!.FS.unlink(path);

            // Emit FS_DELETE event
            eventListeners.forEach((listener) => {
              listener({
                version: 1,
                type: "FS_DELETE",
                flags: 0,
                seq: Date.now(),
                data_len: 0,
                path,
              });
            });
          } catch (error) {
            throw new Error(`Failed to delete file ${path}: ${error}`);
          }
        },

        renameFile: async (oldPath: string, newPath: string): Promise<void> => {
          try {
            state.module!.FS.rename(oldPath, newPath);

            // Emit FS_RENAME event
            eventListeners.forEach((listener) => {
              listener({
                version: 1,
                type: "FS_RENAME",
                flags: 0,
                seq: Date.now(),
                data_len: 0,
                path: `${oldPath} -> ${newPath}`,
              });
            });
          } catch (error) {
            throw new Error(
              `Failed to rename ${oldPath} to ${newPath}: ${error}`
            );
          }
        },

        createDir: async (path: string): Promise<void> => {
          try {
            state.module!.FS.mkdir(path);
          } catch (error) {
            throw new Error(`Failed to create directory ${path}: ${error}`);
          }
        },

        listDir: async (path: string): Promise<string[]> => {
          try {
            return state
              .module!.FS.readdir(path)
              .filter((name: string) => name !== "." && name !== "..");
          } catch (error) {
            throw new Error(`Failed to list directory ${path}: ${error}`);
          }
        },

        onFileSystemEvent: (callback: (event: FSMessage) => void) => {
          setEventListeners((prev) => new Set([...prev, callback]));

          // Return cleanup function
          return () => {
            setEventListeners((prev) => {
              const newSet = new Set(prev);
              newSet.delete(callback);
              return newSet;
            });
          };
        },

        ptyWrite: async (data: string): Promise<void> => {
          // TODO: Implement PTY write using C function wrapper
          console.log("PTY Write:", data);
        },

        ptyRead: async (): Promise<string> => {
          // TODO: Implement PTY read using C function wrapper
          return "";
        },

        getProcStat: async (): Promise<ProcStat> => {
          try {
            const stat = state.module!.FS.readFile("/proc/stat", {
              encoding: "utf8",
            });
            return JSON.parse(stat as string);
          } catch (error) {
            throw new Error(`Failed to read proc stat: ${error}`);
          }
        },
      }
    : null;

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const contextValue = {
    state,
    api,
    initialize,
  };

  return (
    <WasmKernelContext.Provider value={contextValue}>
      {children}
    </WasmKernelContext.Provider>
  );
};

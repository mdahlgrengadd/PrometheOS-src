import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  // Use useRef to maintain stable eventListeners reference
  const eventListenersRef = useRef<Set<(event: FSMessage) => void>>(new Set());
  const initialize = useCallback(async () => {
    setState((current) => {
      if (current.isInitialized || current.isLoading) {
        return current; // No change, early return
      }
      return { ...current, isLoading: true, error: null };
    });

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
          console.log("🚀 WASM Kernel runtime initialized");

          // Verify FS is available
          if (!this.FS) {
            console.error("❌ FS object not available on WASM module");
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: "WASM FS API not available - build configuration issue",
            }));
            return;
          }

          console.log("✅ FS API confirmed available:", typeof this.FS);

          // Mount filesystems and start kernel
          try {
            // Use 'this' to refer to the module in the callback
            (this as EmscriptenModule).callMain();
            console.log("✅ WASM Kernel main loop started");

            // Update state with the fully initialized module
            setState((prev) => ({
              ...prev,
              isInitialized: true,
              isLoading: false,
              module: this as EmscriptenModule,
            }));
          } catch (error) {
            console.error("❌ Failed to start kernel main loop:", error);
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to start kernel",
            }));
          }
        },

        print: (text: string) => {
          console.log(`[WASM]: ${text}`);
        },
        printErr: (text: string) => {
          // Don't abort on known non-critical errors
          if (text.includes("/proc/stat") || text.includes("No such file")) {
            console.warn(`[WASM Warning]: ${text}`);
          } else {
            console.error(`[WASM Error]: ${text}`);
          }
        },
        locateFile: (path: string, scriptDirectory: string) => {
          // Ensure WASM file is loaded from the correct location with base URL
          const baseUrl = import.meta.env.BASE_URL || "/";
          if (path.endsWith(".wasm")) {
            return `${baseUrl}wasm/${path}`;
          }
          return scriptDirectory + path;
        },
      }); // Don't set state here - it will be set in onRuntimeInitialized
      // Just keep the loading state until the runtime is ready
    } catch (error) {
      console.error("❌ Failed to initialize WASM kernel:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }, []); // Remove state dependencies to prevent infinite loops
  // Create API methods with useMemo to prevent recreation
  const api: WasmKernelAPI | null = useMemo(() => {
    if (!state.module) return null;

    return {
      readFile: async (path: string): Promise<Uint8Array> => {
        try {
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          const data = state.module.FS.readFile(path);
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
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          state.module.FS.writeFile(path, data); // Emit FS_CHANGED event
          eventListenersRef.current.forEach((listener) => {
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
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          state.module.FS.unlink(path); // Emit FS_DELETE event
          eventListenersRef.current.forEach((listener) => {
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
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          state.module.FS.rename(oldPath, newPath); // Emit FS_RENAME event
          eventListenersRef.current.forEach((listener) => {
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
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          state.module.FS.mkdir(path);
        } catch (error) {
          throw new Error(`Failed to create directory ${path}: ${error}`);
        }
      },

      listDir: async (path: string): Promise<string[]> => {
        try {
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }
          return state.module.FS.readdir(path).filter(
            (name: string) => name !== "." && name !== ".."
          );
        } catch (error) {
          throw new Error(`Failed to list directory ${path}: ${error}`);
        }
      },
      onFileSystemEvent: (callback: (event: FSMessage) => void) => {
        eventListenersRef.current.add(callback);

        // Return cleanup function
        return () => {
          eventListenersRef.current.delete(callback);
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
          if (!state.module?.FS) {
            throw new Error("WASM FS not available");
          }

          // Check if the file exists first to avoid runtime abort
          try {
            state.module.FS.stat("/proc/stat");
          } catch (statError) {
            // File doesn't exist, return default proc stat
            return {
              processes: [
                {
                  pid: 1,
                  name: "kernel",
                  state: "running",
                },
              ],
              uptime: Date.now() / 1000,
            };
          }

          const stat = state.module.FS.readFile("/proc/stat", {
            encoding: "utf8",
          });
          return JSON.parse(stat as string);
        } catch (error) {
          // Return a default proc stat instead of throwing
          console.warn("Failed to read proc stat, returning defaults:", error);
          return {
            processes: [
              {
                pid: 1,
                name: "kernel",
                state: "running",
              },
            ],
            uptime: Date.now() / 1000,
          };
        }
      },
    };
  }, [state.module]); // Only recreate when module changes

  // Auto-initialize on mount (only once)
  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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

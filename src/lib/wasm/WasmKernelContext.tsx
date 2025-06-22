import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// WASM Kernel Types
export interface WasmKernelModule {
  FS: any;
  callMain: () => void;
  addOnPostRun: (callback: () => void) => void;
  addOnExit: (callback: (code: number) => void) => void;
  cwrap: (name: string, returnType: string, argTypes: string[]) => Function;
  getValue: (ptr: number, type: string) => any;
  setValue: (ptr: number, value: any, type: string) => void;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;
}

export interface FSMessage {
  version: number;
  type: "FS_READ" | "FS_WRITE" | "FS_RENAME" | "FS_DELETE" | "FS_CHANGED";
  flags: number;
  seq: number;
  data_len: number;
  path: string;
  data?: ArrayBuffer;
}

export interface WasmKernelState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  module: WasmKernelModule | null;
}

export interface WasmKernelAPI {
  // File Operations
  readFile: (path: string) => Promise<Uint8Array>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;

  // Directory Operations
  createDir: (path: string) => Promise<void>;
  listDir: (path: string) => Promise<string[]>;

  // Event System
  onFileSystemEvent: (callback: (event: FSMessage) => void) => () => void;

  // PTY Operations
  ptyWrite: (data: string) => Promise<void>;
  ptyRead: () => Promise<string>;

  // Process Operations
  getProcStat: () => Promise<any>;
}

interface WasmKernelContextType {
  state: WasmKernelState;
  api: WasmKernelAPI | null;
  initialize: () => Promise<void>;
}

export const WasmKernelContext = createContext<WasmKernelContextType | null>(
  null
);

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
      // Dynamic import of the WASM module
      const WasmCore = await import("/dist/wasm/core.js");

      // Initialize the WASM module
      const module = await WasmCore.default({
        onRuntimeInitialized: () => {
          console.log("🚀 WASM Kernel initialized successfully");

          // Mount filesystems and start kernel
          try {
            module.callMain();
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
          // Ensure WASM file is loaded from the correct location
          if (path.endsWith(".wasm")) {
            return "/dist/wasm/" + path;
          }
          return scriptDirectory + path;
        },
      });

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        module,
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
            return new Uint8Array(data);
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

        getProcStat: async (): Promise<any> => {
          try {
            const stat = state.module!.FS.readFile("/proc/stat", {
              encoding: "utf8",
            });
            return JSON.parse(stat);
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

  const contextValue: WasmKernelContextType = {
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

import type { EmscriptenModule } from "@/types/wasm";

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
  module: EmscriptenModule | null;
}

export interface ProcStat {
  processes: Array<{
    pid: number;
    name: string;
    state: string;
  }>;
  uptime: number;
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
  ptySetMode: (mode: number) => Promise<void>;
  ptyGetMode: () => Promise<number>;
  ptyFlush: () => Promise<void>;
  ptyHasData: () => Promise<boolean>;
  ptyGetScreen: () => Promise<string>;
  // Shell Operations
  shellExecute: (command: string) => Promise<void>;
  shellGetEnv: (name: string) => Promise<string | null>;
  shellSetEnv: (name: string, value: string) => Promise<void>;
  shellPrompt: () => Promise<void>;

  // Terminal Operations
  terminalClear: () => Promise<void>;
  terminalPutString: (text: string) => Promise<void>;
  terminalGetDimensions: () => Promise<{ width: number; height: number }>;

  // PTY Mode Constants
  getPtyModeConstants: () => Promise<{
    RAW: number;
    ECHO: number;
    CANON: number;
  }>;

  // Process Operations
  getProcStat: () => Promise<ProcStat>;
}

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

  // Process Operations
  getProcStat: () => Promise<ProcStat>;
}

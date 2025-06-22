// TypeScript definitions for WASM Core System

export interface WasmCoreModule {
  // Memory management
  _malloc(size: number): number;
  _free(ptr: number): void;

  // String utilities
  stringToUTF8(str: string, outPtr: number, maxBytesToWrite: number): void;
  UTF8ToString(ptr: number, maxBytesToRead?: number): string;

  // Core functions exported from WASM
  _main(): number;
  _bus_send_message(msgPtr: number, responsePtr: number): number;
  _fs_open(pathPtr: number, flags: number, mode: number): number;
  _fs_read(fd: number, bufPtr: number, count: number): number;
  _fs_write(fd: number, bufPtr: number, count: number): number;
  _fs_close(fd: number): number;

  // Memory views
  HEAP8: Int8Array;
  HEAP16: Int16Array;
  HEAP32: Int32Array;
  HEAPU8: Uint8Array;
  HEAPU16: Uint16Array;
  HEAPU32: Uint32Array;
}

export interface SyscallMessage {
  type: number;
  pid: number;
  fd: number;
  flags: number;
  size: number;
  data: string;
}

export interface SyscallResponse {
  result: number;
  errno_val: number;
  size: number;
  data: string;
}

// Message types enum matching C definitions
export enum MessageType {
  MSG_FS_READ = 1,
  MSG_FS_WRITE = 2,
  MSG_FS_OPEN = 3,
  MSG_FS_CLOSE = 4,
  MSG_FS_STAT = 5,
  MSG_FS_MKDIR = 6,
  MSG_FS_RMDIR = 7,
  MSG_FS_UNLINK = 8,
  MSG_PROC_SPAWN = 16,
  MSG_PROC_KILL = 17,
  MSG_PROC_WAIT = 18,
  MSG_PROC_LIST = 19,
  MSG_TTY_READ = 32,
  MSG_TTY_WRITE = 33,
  MSG_TTY_IOCTL = 34,
}

// File flags matching C definitions
export enum FileFlags {
  O_RDONLY = 0x0000,
  O_WRONLY = 0x0001,
  O_RDWR = 0x0002,
  O_CREAT = 0x0040,
  O_EXCL = 0x0080,
  O_TRUNC = 0x0200,
  O_APPEND = 0x0400,
}

// High-level JavaScript API wrapper
export class WasmCore {
  private module: WasmCoreModule;

  constructor(module: WasmCoreModule) {
    this.module = module;
  }

  // File system operations
  async openFile(
    path: string,
    flags: FileFlags = FileFlags.O_RDONLY
  ): Promise<number> {
    const pathPtr = this.allocateString(path);
    try {
      const fd = this.module._fs_open(pathPtr, flags, 0o644);
      return fd;
    } finally {
      this.module._free(pathPtr);
    }
  }

  async readFile(fd: number, size: number): Promise<string> {
    const bufPtr = this.module._malloc(size);
    try {
      const bytesRead = this.module._fs_read(fd, bufPtr, size);
      if (bytesRead > 0) {
        return this.module.UTF8ToString(bufPtr, bytesRead);
      }
      return "";
    } finally {
      this.module._free(bufPtr);
    }
  }

  async writeFile(fd: number, data: string): Promise<number> {
    const dataPtr = this.allocateString(data);
    try {
      return this.module._fs_write(fd, dataPtr, data.length);
    } finally {
      this.module._free(dataPtr);
    }
  }

  async closeFile(fd: number): Promise<void> {
    this.module._fs_close(fd);
  }

  // Utility methods
  private allocateString(str: string): number {
    const len = str.length * 3 + 1; // Worst case for UTF-8
    const ptr = this.module._malloc(len);
    this.module.stringToUTF8(str, ptr, len);
    return ptr;
  }
}

// Factory function to load and initialize the WASM core
export async function loadWasmCore(): Promise<WasmCore> {
  // Dynamic import to avoid bundling the WASM module
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WasmCoreFactory = (await import("/wasm/wasm-core.js")) as any;
  const module = await WasmCoreFactory.default();

  // Initialize the core system
  module._main();

  return new WasmCore(module);
}

// Global instance (singleton pattern)
let wasmCoreInstance: WasmCore | null = null;

export async function getWasmCore(): Promise<WasmCore> {
  if (!wasmCoreInstance) {
    wasmCoreInstance = await loadWasmCore();
  }
  return wasmCoreInstance;
}

// Type declarations for the WASM core module

export interface EmscriptenModule {
  FS: EmscriptenFS;
  callMain: () => void;
  addOnPostRun: (callback: () => void) => void;
  addOnExit: (callback: (code: number) => void) => void;
  cwrap: (
    name: string,
    returnType: string,
    argTypes: string[]
  ) => (...args: unknown[]) => unknown;
  getValue: (ptr: number, type: string) => number;
  setValue: (ptr: number, value: number, type: string) => void;
  _malloc: (size: number) => number;
  _free: (ptr: number) => void;
  HEAPU8: Uint8Array;
}

export interface EmscriptenFS {
  readFile: (
    path: string,
    options?: { encoding?: string }
  ) => Uint8Array | string;
  writeFile: (path: string, data: Uint8Array | string) => void;
  unlink: (path: string) => void;
  rename: (oldPath: string, newPath: string) => void;
  mkdir: (path: string) => void;
  readdir: (path: string) => string[];
  stat: (path: string) => EmscriptenFSStat;
}

export interface EmscriptenFSStat {
  isFile: () => boolean;
  isDirectory: () => boolean;
  size: number;
  mtime: Date;
}

export interface WasmCoreOptions {
  onRuntimeInitialized?: () => void;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
  locateFile?: (path: string, scriptDirectory: string) => string;
}

declare module "/dist/wasm/core.js" {
  const WasmCore: (options?: WasmCoreOptions) => Promise<EmscriptenModule>;
  export default WasmCore;
}

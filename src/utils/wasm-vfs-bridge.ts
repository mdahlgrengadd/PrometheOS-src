import { useWasmKernel } from '@/hooks/useWasmKernel';

import type { FileSystemItem } from "../plugins/apps/builder/types";
import type { WasmKernelAPI } from "@/lib/wasm/types";

interface VFSEvent {
  path: string;
  type: string;
  [key: string]: unknown;
}

interface WasmDirEntry {
  name: string;
  isDirectory: boolean;
  size?: number;
  mtime?: number;
}

/**
 * Bridge between Desktop VFS and WASM Core Filesystem
 * Provides persistent storage using WASM OPFS backend
 */
export class WasmVFSBridge {
  private wasmApi: WasmKernelAPI | null = null;
  private initialized = false;
  private eventListeners: Map<string, ((event: VFSEvent) => void)[]> =
    new Map();

  constructor() {
    // Will be initialized via setWasmApi
  }

  async initialize(wasmApi: WasmKernelAPI): Promise<void> {
    if (this.initialized) return;

    this.wasmApi = wasmApi;

    // Ensure WASM filesystem is mounted
    console.log("🔗 Initializing WASM VFS Bridge...");

    // Create essential directories in WASM FS
    await this.ensureDirectoryStructure();

    this.initialized = true;
    console.log("✅ WASM VFS Bridge initialized");
  }
  private async ensureDirectoryStructure(): Promise<void> {
    const essentialDirs = [
      "/home/user",
      "/home/user/Desktop",
      "/home/user/Documents",
      "/home/user/Downloads",
      "/tmp",
    ];

    for (const dir of essentialDirs) {
      try {
        // Try to create directory (will fail silently if exists)
        await this.wasmApi!.createDir(dir);
      } catch (error) {
        // Directory likely already exists, continue
      }
    }
  }

  /**
   * Read a file from WASM filesystem
   */
  async readFile(path: string): Promise<string | null> {
    if (!this.initialized || !this.wasmApi) {
      throw new Error("WASM VFS Bridge not initialized");
    }

    try {
      // Convert VFS path to WASM path
      const wasmPath = this.convertToWasmPath(path);

      // Use WASM API to read file
      const data = await this.wasmApi.readFile(wasmPath);
      const decoder = new TextDecoder();
      return decoder.decode(data);
    } catch (error) {
      console.warn("Failed to read file from WASM FS:", path, error);
      return null;
    }
  }

  /**
   * Write a file to WASM filesystem
   */
  async writeFile(path: string, content: string): Promise<boolean> {
    if (!this.initialized || !this.wasmApi) {
      throw new Error("WASM VFS Bridge not initialized");
    }

    try {
      const wasmPath = this.convertToWasmPath(path);
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      // Use WASM write method
      await this.wasmApi.writeFile(wasmPath, data);

      // Emit change event
      this.emitEvent("fileChanged", { path, type: "write" });

      return true;
    } catch (error) {
      console.error("Failed to write file to WASM FS:", path, error);
      return false;
    }
  }

  /**
   * List directory contents from WASM filesystem
   */
  async listDirectory(path: string): Promise<FileSystemItem[]> {
    if (!this.initialized || !this.wasmApi) {
      throw new Error("WASM VFS Bridge not initialized");
    }

    try {
      const wasmPath = this.convertToWasmPath(path);

      // Get directory listing from WASM
      const entries = await this.wasmApi.listDir(wasmPath);

      // Convert WASM entries to VFS format
      return this.convertWasmEntriesToVFS(entries, path);
    } catch (error) {
      console.warn("Failed to list directory from WASM FS:", path, error);
      return [];
    }
  }

  /**
   * Create directory in WASM filesystem
   */
  async createDirectory(path: string): Promise<boolean> {
    if (!this.initialized || !this.wasmApi) {
      throw new Error("WASM VFS Bridge not initialized");
    }

    try {
      const wasmPath = this.convertToWasmPath(path);
      await this.wasmApi.createDir(wasmPath);

      this.emitEvent("directoryCreated", { path, type: "create" });
      return true;
    } catch (error) {
      console.error("Failed to create directory in WASM FS:", path, error);
      return false;
    }
  }

  /**
   * Delete file or directory from WASM filesystem
   */
  async delete(path: string): Promise<boolean> {
    if (!this.initialized || !this.wasmApi) {
      throw new Error("WASM VFS Bridge not initialized");
    }

    try {
      const wasmPath = this.convertToWasmPath(path);
      await this.wasmApi.deleteFile(wasmPath);

      this.emitEvent("fileDeleted", { path, type: "delete" });
      return true;
    } catch (error) {
      console.error("Failed to delete from WASM FS:", path, error);
      return false;
    }
  }
  /**
   * Convert VFS path to WASM filesystem path
   */
  private convertToWasmPath(vfsPath: string): string {
    // If path already starts with /home/user or /tmp, it's already in WASM format
    if (
      vfsPath.startsWith("/home/user/") ||
      vfsPath.startsWith("/tmp/") ||
      vfsPath === "/home/user" ||
      vfsPath === "/tmp"
    ) {
      return vfsPath;
    }

    // Remove leading slash and map to appropriate WASM mount
    const cleanPath = vfsPath.replace(/^\/+/, "");

    if (cleanPath.startsWith("Desktop")) {
      return `/home/user/${cleanPath}`;
    } else if (cleanPath.startsWith("Documents")) {
      return `/home/user/${cleanPath}`;
    } else if (cleanPath.startsWith("Downloads")) {
      return `/home/user/${cleanPath}`;
    } else if (cleanPath.startsWith("tmp")) {
      return `/${cleanPath}`;
    } else {
      // Default to user home
      return `/home/user/${cleanPath}`;
    }
  }
  /**
   * Convert WASM filesystem entries to VFS format
   */
  private convertWasmEntriesToVFS(
    wasmEntries: string[],
    parentPath: string
  ): FileSystemItem[] {
    return wasmEntries.map((name, index) => ({
      id: `${parentPath}/${name}`.replace(/\/+/g, "/"),
      name: name,
      type: name.includes(".") ? "file" : ("folder" as const),
      size: 0, // Size will be loaded on demand
      content: name.includes(".") ? "" : undefined, // Will be loaded on demand
      children: name.includes(".") ? undefined : [],
    }));
  }

  /**
   * Event system for filesystem changes
   */
  addEventListener(event: string, callback: (data: VFSEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (data: VFSEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: VFSEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in VFS event listener:", error);
        }
      });
    }
  }

  /**
   * Sync desktop shortcuts to WASM filesystem
   */
  async syncDesktopShortcuts(shortcuts: FileSystemItem[]): Promise<void> {
    const desktopPath = "/home/user/Desktop";

    for (const shortcut of shortcuts) {
      if (shortcut.content) {
        const shortcutPath = `${desktopPath}/${shortcut.name}`;
        await this.writeFile(shortcutPath, shortcut.content);
      }
    }
  }

  /**
   * Load desktop shortcuts from WASM filesystem
   */
  async loadDesktopShortcuts(): Promise<FileSystemItem[]> {
    return await this.listDirectory("/Desktop");
  }
}

// Singleton instance
export const wasmVFSBridge = new WasmVFSBridge();

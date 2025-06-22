/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileSystemItem } from "../plugins/apps/builder/types";
import { wasmVFSBridge } from './wasm-vfs-bridge';

// A unified virtual file system that can use either memory or WASM backend
export class VirtualFS {
  private root: FileSystemItem[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private useWasmBackend = false;

  constructor(initialData?: FileSystemItem[]) {
    if (initialData) {
      this.root = initialData;
      this.initialized = true;
    }
  }

  // Enable WASM backend for persistent storage
  async enableWasmBackend(wasmApi: any): Promise<void> {
    console.log("[VirtualFS] Enabling WASM backend...");
    console.log("[VirtualFS] Current VFS state:", {
      initialized: this.initialized,
      rootItems: this.root.length,
      rootItemNames: this.root.map((item) => item.name),
    });

    try {
      await wasmVFSBridge.initialize(wasmApi);
      this.useWasmBackend = true;

      console.log("[VirtualFS] WASM bridge initialized, starting sync...");

      // Sync existing in-memory data to WASM
      await this.syncToWasm();

      console.log("✅ VirtualFS WASM backend enabled and synced");
    } catch (error) {
      console.error("❌ Failed to enable WASM backend:", error);
      this.useWasmBackend = false;
      throw error; // Re-throw to see the error in the calling code
    }
  }

  // Sync in-memory data to WASM filesystem
  private async syncToWasm(): Promise<void> {
    if (!this.useWasmBackend) {
      console.log("[VirtualFS] Sync skipped - WASM backend not enabled");
      return;
    }

    console.log("[VirtualFS] Starting sync to WASM filesystem...");
    console.log("[VirtualFS] Root items to sync:", this.root.length);
    console.log(
      "[VirtualFS] Root items details:",
      this.root.map((item) => ({
        name: item.name,
        type: item.type,
        id: item.id,
        hasChildren: !!(item.children && item.children.length > 0),
        childrenCount: item.children?.length || 0,
      }))
    );

    // Map VFS directories to WASM filesystem paths
    const pathMapping: { [key: string]: string } = {
      Desktop: "/home/user/Desktop",
      Documents: "/home/user/Documents",
      Downloads: "/home/user/Downloads",
      documents: "/home/user/documents",
      downloads: "/home/user/downloads",
    };

    for (const item of this.root) {
      console.log(
        `[VirtualFS] Processing sync for: ${item.name} (${item.type})`
      );

      // Use mapped path if available, otherwise use root
      const targetPath = pathMapping[item.name] || `/home/user/${item.name}`;
      const parentPath = targetPath.substring(0, targetPath.lastIndexOf("/"));
      const targetName = targetPath.split("/").pop() || item.name;

      console.log(
        `[VirtualFS] Mapping ${item.name} to ${targetPath} (parent: ${parentPath}, name: ${targetName})`
      );

      try {
        await this.syncItemToWasm(item, parentPath, targetName);
        console.log(`[VirtualFS] ✅ Successfully synced ${item.name}`);
      } catch (error) {
        console.error(`[VirtualFS] ❌ Failed to sync ${item.name}:`, error);
      }
    }

    console.log("[VirtualFS] Sync to WASM completed");
  }

  // Recursively sync an item to WASM
  private async syncItemToWasm(
    item: FileSystemItem,
    parentPath: string,
    customName?: string
  ): Promise<void> {
    const itemName = customName || item.name;
    const fullPath = `${parentPath}/${itemName}`.replace(/\/+/g, "/");
    console.log(`[VirtualFS] Syncing ${item.type}: ${fullPath}`);

    try {
      if (item.type === "folder") {
        console.log(`[VirtualFS] Creating directory: ${fullPath}`);
        await wasmVFSBridge.createDirectory(fullPath);
        console.log(`[VirtualFS] ✅ Directory created: ${fullPath}`);

        if (item.children && item.children.length > 0) {
          console.log(
            `[VirtualFS] Syncing ${item.children.length} children of ${fullPath}`
          );
          for (const child of item.children) {
            console.log(
              `[VirtualFS] Syncing child: ${child.name} (${child.type})`
            );
            await this.syncItemToWasm(child, fullPath);
          }
          console.log(`[VirtualFS] ✅ All children synced for ${fullPath}`);
        } else {
          console.log(`[VirtualFS] No children to sync for ${fullPath}`);
        }
      } else if (item.type === "file" && item.content) {
        console.log(
          `[VirtualFS] Writing file ${fullPath} (${item.content.length} chars)`
        );
        const success = await wasmVFSBridge.writeFile(fullPath, item.content);
        console.log(`[VirtualFS] File write result for ${fullPath}:`, success);
      } else {
        console.log(
          `[VirtualFS] Skipping item ${fullPath} (type: ${
            item.type
          }, hasContent: ${!!item.content})`
        );
      }
    } catch (error) {
      console.error(`[VirtualFS] Error syncing ${fullPath}:`, error);
      throw error;
    }
  }

  // Get the current state of initialization
  isInitialized(): boolean {
    return this.initialized;
  }

  // Check if WASM backend is enabled
  isWasmBackendEnabled(): boolean {
    return this.useWasmBackend;
  }

  // Manually trigger a sync to WASM (useful for debugging or re-syncing after changes)
  async manualSyncToWasm(): Promise<void> {
    if (!this.useWasmBackend) {
      console.log("[VirtualFS] Manual sync skipped - WASM backend not enabled");
      return;
    }

    console.log("[VirtualFS] Manual sync requested...");
    await this.syncToWasm();
  }

  // Initialize once from shadow folder - subsequent calls return existing data
  async initializeOnce(): Promise<void> {
    if (this.initialized) {
      console.log("[VirtualFS] Already initialized, skipping shadow reload");
      return;
    }

    if (this.initPromise) {
      console.log("[VirtualFS] Initialization in progress, waiting...");
      return this.initPromise;
    }

    console.log("[VirtualFS] First-time initialization from shadow folder");
    this.initPromise = this.loadFromShadow();
    await this.initPromise;
    this.initialized = true;
    this.initPromise = null;
  }

  // Force reload from shadow (use carefully!)
  async forceReloadFromShadow(): Promise<void> {
    console.log("[VirtualFS] Force reloading from shadow folder");
    this.initialized = false;
    this.initPromise = null;
    await this.initializeOnce();
  }

  // Internal method to load from shadow
  private async loadFromShadow(): Promise<void> {
    const shadowData = await loadShadowFolder();
    this.root = shadowData;
  }

  // Get the root structure as a FileSystemItem for Zustand store compatibility
  getRootFileSystemItem(): FileSystemItem {
    const rootItem: FileSystemItem = {
      id: "root",
      name: "My Computer",
      type: "folder",
      children: this.root,
    };
    return rootItem;
  }

  // Read a file by path (e.g. 'src/app.jsx') - WASM aware
  readFile(path: string): string | undefined {
    if (this.useWasmBackend) {
      // For WASM backend, we'll need an async version
      console.warn(
        "readFile called on WASM backend - use readFileAsync instead"
      );
    }

    const file = this.findItemByPath(path);
    return file && file.type === "file" ? file.content : undefined;
  }

  // Async version for WASM backend
  async readFileAsync(path: string): Promise<string | undefined> {
    if (this.useWasmBackend) {
      return await wasmVFSBridge.readFile(path);
    }

    return this.readFile(path);
  }

  // Write a file by path - WASM aware
  writeFile(path: string, content: string): void {
    if (this.useWasmBackend) {
      // For WASM backend, we'll need an async version
      console.warn(
        "writeFile called on WASM backend - use writeFileAsync instead"
      );
      wasmVFSBridge.writeFile(path, content).catch(console.error);
      return;
    }

    const file = this.findItemByPath(path);
    if (file && file.type === "file") {
      file.content = content;
    }
  }

  // Async version for WASM backend
  async writeFileAsync(path: string, content: string): Promise<boolean> {
    if (this.useWasmBackend) {
      return await wasmVFSBridge.writeFile(path, content);
    }

    this.writeFile(path, content);
    return true;
  }

  // List directory contents - WASM aware
  listDir(path: string): FileSystemItem[] {
    if (this.useWasmBackend) {
      console.warn("listDir called on WASM backend - use listDirAsync instead");
    }

    const dir = this.findItemByPath(path);
    return dir && dir.type === "folder" && dir.children ? dir.children : [];
  }

  // Async version for WASM backend
  async listDirAsync(path: string): Promise<FileSystemItem[]> {
    if (this.useWasmBackend) {
      return await wasmVFSBridge.listDirectory(path);
    }

    return this.listDir(path);
  }

  // Delete a file or folder (not implemented)
  deleteFile(path: string): void {
    // TODO: implement recursive delete
  }

  // Initialize from data (e.g. mock, shadow folder, etc.)
  initFromData(data: FileSystemItem[]): void {
    this.root = data;
    this.initialized = true;
  }

  // Serialize the current FS (for saving, exporting, etc.)
  serialize(): FileSystemItem[] {
    return JSON.parse(JSON.stringify(this.root)) as FileSystemItem[];
  }

  // Find item by ID via recursive traversal
  public findById(id: string): FileSystemItem | undefined {
    const traverse = (items: FileSystemItem[]): FileSystemItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = traverse(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    return traverse(this.root);
  }

  // List directory contents by parent ID
  public listChildrenById(parentId: string): FileSystemItem[] {
    const parent = this.findById(parentId);
    return parent && parent.type === "folder" && parent.children
      ? parent.children
      : [];
  }

  // Add items to a specific path (used by the Zustand store)
  public addItems(path: string[], items: FileSystemItem[]): void {
    // Special case for root path - modify this.root directly
    if (path.length === 1 && path[0] === "root") {
      this.root = [...this.root, ...items];
      return;
    }

    // For non-root paths, use the existing logic
    const target = this.findItemByPathArray(path);
    if (target && target.type === "folder") {
      target.children = [...(target.children || []), ...items];
    }
  }

  // Async version for WASM backend
  public async addItemsAsync(
    path: string[],
    items: FileSystemItem[]
  ): Promise<void> {
    if (this.useWasmBackend) {
      const basePath = this.vfsPathToWasmPath(path);

      for (const item of items) {
        const itemPath = `${basePath}/${item.name}`.replace(/\/+/g, "/");

        if (item.type === "folder") {
          await wasmVFSBridge.createDirectory(itemPath);

          // Recursively add children
          if (item.children) {
            for (const child of item.children) {
              await this.syncItemToWasm(child, itemPath);
            }
          }
        } else if (item.type === "file" && item.content) {
          await wasmVFSBridge.writeFile(itemPath, item.content);
        }
      }
    }

    // Always update in-memory structure
    this.addItems(path, items);
  }

  // Rename an item at a specific path
  public renameItem(path: string[], id: string, newName: string): void {
    const target = this.findItemByPathArray(path);
    if (target && target.type === "folder" && target.children) {
      const item = target.children.find((c) => c.id === id);
      if (item) {
        item.name = newName;
      }
    }
  }

  // Async version for WASM backend
  public async renameItemAsync(
    path: string[],
    id: string,
    newName: string
  ): Promise<void> {
    if (this.useWasmBackend) {
      const target = this.findItemByPathArray(path);
      if (target && target.type === "folder" && target.children) {
        const item = target.children.find((c) => c.id === id);
        if (item) {
          const basePath = this.vfsPathToWasmPath(path);
          const oldPath = `${basePath}/${item.name}`.replace(/\/+/g, "/");
          const newPath = `${basePath}/${newName}`.replace(/\/+/g, "/");

          // For now, we'll implement this as delete + create
          // A proper rename operation would be better but requires more WASM API
          if (item.type === "file" && item.content) {
            await wasmVFSBridge.writeFile(newPath, item.content);
            await wasmVFSBridge.delete(oldPath);
          } else if (item.type === "folder") {
            // For folders, we'd need recursive copy + delete
            console.warn("Folder rename in WASM not fully implemented");
          }
        }
      }
    }

    // Always update in-memory structure
    this.renameItem(path, id, newName);
  }

  // Delete an item at a specific path
  public deleteItem(path: string[], id: string): void {
    const target = this.findItemByPathArray(path);
    if (target && target.type === "folder" && target.children) {
      target.children = target.children.filter((c) => c.id !== id);
    }
  }

  // Async version for WASM backend
  public async deleteItemAsync(path: string[], id: string): Promise<void> {
    if (this.useWasmBackend) {
      const target = this.findItemByPathArray(path);
      if (target && target.type === "folder" && target.children) {
        const item = target.children.find((c) => c.id === id);
        if (item) {
          const basePath = this.vfsPathToWasmPath(path);
          const itemPath = `${basePath}/${item.name}`.replace(/\/+/g, "/");
          await wasmVFSBridge.delete(itemPath);
        }
      }
    }

    // Always update in-memory structure
    this.deleteItem(path, id);
  }

  // Move an item from one path to another
  public moveItem(fromPath: string[], id: string, toPath: string[]): void {
    const source = this.findItemByPathArray(fromPath);
    const destination = this.findItemByPathArray(toPath);

    if (
      source &&
      source.type === "folder" &&
      source.children &&
      destination &&
      destination.type === "folder"
    ) {
      const item = source.children.find((c) => c.id === id);
      if (item) {
        source.children = source.children.filter((c) => c.id !== id);
        destination.children = [...(destination.children || []), item];
      }
    }
  }

  // Async version for WASM backend
  public async moveItemAsync(
    fromPath: string[],
    id: string,
    toPath: string[]
  ): Promise<void> {
    if (this.useWasmBackend) {
      const source = this.findItemByPathArray(fromPath);
      const destination = this.findItemByPathArray(toPath);

      if (
        source &&
        source.type === "folder" &&
        source.children &&
        destination &&
        destination.type === "folder"
      ) {
        const item = source.children.find((c) => c.id === id);
        if (item) {
          const fromBasePath = this.vfsPathToWasmPath(fromPath);
          const toBasePath = this.vfsPathToWasmPath(toPath);
          const oldPath = `${fromBasePath}/${item.name}`.replace(/\/+/g, "/");
          const newPath = `${toBasePath}/${item.name}`.replace(/\/+/g, "/");

          // For now, implement as copy + delete
          if (item.type === "file" && item.content) {
            await wasmVFSBridge.writeFile(newPath, item.content);
            await wasmVFSBridge.delete(oldPath);
          } else if (item.type === "folder") {
            // For folders, we'd need recursive copy + delete
            console.warn("Folder move in WASM not fully implemented");
          }
        }
      }
    }

    // Always update in-memory structure
    this.moveItem(fromPath, id, toPath);
  }

  // Update file content at a specific path
  public updateFileContent(path: string[], id: string, content: string): void {
    const target = this.findItemByPathArray(path);
    if (target && target.type === "folder" && target.children) {
      const file = target.children.find((c) => c.id === id);
      if (file && file.type === "file") {
        file.content = content;
      }
    }
  }

  // Async version for WASM backend
  public async updateFileContentAsync(
    path: string[],
    id: string,
    content: string
  ): Promise<void> {
    if (this.useWasmBackend) {
      const target = this.findItemByPathArray(path);
      if (target && target.type === "folder" && target.children) {
        const file = target.children.find((c) => c.id === id);
        if (file && file.type === "file") {
          const basePath = this.vfsPathToWasmPath(path);
          const filePath = `${basePath}/${file.name}`.replace(/\/+/g, "/");
          await wasmVFSBridge.writeFile(filePath, content);
        }
      }
    }

    // Always update in-memory structure
    this.updateFileContent(path, id, content);
  }

  // Helper to convert VFS path array to WASM filesystem path
  private vfsPathToWasmPath(path: string[]): string {
    if (path.length <= 1) return "/home/user";

    const vfsPath = path.slice(1).join("/");
    if (vfsPath === "Desktop") return "/home/user/Desktop";
    if (vfsPath === "Documents") return "/home/user/Documents";
    if (vfsPath === "Downloads") return "/home/user/Downloads";
    return `/home/user/${vfsPath}`;
  }
  private findItemByPathArray(path: string[]): FileSystemItem | undefined {
    if (path.length === 1 && path[0] === "root") {
      const rootItem: FileSystemItem = {
        id: "root",
        name: "My Computer",
        type: "folder",
        children: this.root,
      };
      return rootItem;
    }

    let current: FileSystemItem | undefined = {
      id: "root",
      name: "My Computer",
      type: "folder" as const,
      children: this.root,
    };

    for (let i = 1; i < path.length; i++) {
      if (!current || current.type !== "folder" || !current.children) {
        return undefined;
      }
      current = current.children.find((item) => item.id === path[i]);
    }

    return current;
  }

  // Helper: find a file or folder by path
  private findItemByPath(path: string): FileSystemItem | undefined {
    if (!path || path === "/")
      return { type: "folder", name: "/", id: "root", children: this.root };
    const parts = path.split("/").filter(Boolean);
    let current: FileSystemItem | undefined = {
      type: "folder",
      name: "/",
      id: "root",
      children: this.root,
    };
    for (const part of parts) {
      if (!current || current.type !== "folder" || !current.children)
        return undefined;
      current = current.children.find((item) => item.name === part);
    }
    return current;
  }
}

// Singleton instance for global use
export const virtualFs = new VirtualFS();

// A helper to build nested tree from flat file list
function buildFsTree(files: FileSystemItem[]): FileSystemItem[] {
  const root: { [name: string]: FileSystemItem } = {};
  const allPaths = new Set<string>();

  // First pass: collect all paths and create directory structure
  for (const file of files) {
    const parts = file.id.split("/");
    let pathSoFar = "";

    // Add all parent directories to our path set
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

      if (i < parts.length - 1) {
        // This is a directory path
        allPaths.add(pathSoFar);
      }
    }
  }

  // Second pass: create all directories first
  for (const dirPath of allPaths) {
    const parts = dirPath.split("/");
    let current = root as any;
    let pathSoFar = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

      if (!current[part]) {
        current[part] = {
          id: pathSoFar,
          name: part,
          type: "folder",
          children: {},
        } as any;
      }
      if (!current[part].children) current[part].children = {};
      current = current[part].children;
    }
  }

  // Third pass: add files to their proper directories
  for (const file of files) {
    const parts = file.id.split("/");
    let current = root as any;
    let pathSoFar = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;

      if (i === parts.length - 1) {
        // This is the file itself
        current[part] = { ...file, name: part, id: pathSoFar };
      } else {
        // Navigate to the parent directory
        current = current[part].children;
      }
    }
  }

  function toArray(node: any): FileSystemItem[] {
    return Object.values(node).map((item: any) => {
      if (item.type === "folder") {
        const children = toArray(item.children);
        return { ...item, children };
      }
      return item;
    });
  }

  return toArray(root);
}

// Load a shadow folder manifest and contents for dev and build
export async function loadShadowFolder(): Promise<FileSystemItem[]> {
  try {
    const manifestUrl = `${import.meta.env.BASE_URL}shadow-manifest.json`;
    const res = await fetch(manifestUrl);
    if (!res.ok) throw new Error("Failed to load shadow-manifest.json");
    const manifest: Array<{
      id: string;
      name: string;
      type: string;
      contentPath: string;
    }> = await res.json();

    // First, extract all directory paths from file paths (including those with empty.txt)
    const allDirectoryPaths = new Set<string>();
    for (const item of manifest) {
      if (item.type === "file") {
        const pathParts = item.id.split("/");
        // Add all parent directory paths
        for (let i = 1; i < pathParts.length; i++) {
          const dirPath = pathParts.slice(0, i).join("/");
          allDirectoryPaths.add(dirPath);
        }
      }
    }

    // Create directory entries for all directories that should exist
    const directoryEntries: FileSystemItem[] = Array.from(
      allDirectoryPaths
    ).map((dirPath) => ({
      id: dirPath,
      name: dirPath.split("/").pop() || dirPath,
      type: "folder" as const,
      children: [],
    }));

    // Process files, excluding empty.txt placeholders
    const fileEntries: FileSystemItem[] = await Promise.all(
      manifest
        .filter((item) => item.type === "file" && item.name !== "empty.txt")
        .map(async (item) => {
          // contentPath already includes the full path with base URL
          const fileUrl = item.contentPath;
          const fileRes = await fetch(fileUrl);
          const content = await fileRes.text();
          let language: string | undefined;
          if (item.name.endsWith(".js") || item.name.endsWith(".jsx"))
            language = "javascript";
          else if (item.name.endsWith(".ts") || item.name.endsWith(".tsx"))
            language = "typescript";
          else if (item.name.endsWith(".css")) language = "css";
          else if (item.name.endsWith(".html")) language = "html";
          else if (item.name.endsWith(".json")) language = "json";
          return {
            id: item.id,
            name: item.name,
            type: "file",
            content,
            language,
          } as FileSystemItem;
        })
    ); // Combine directories and files
    const allItems = [...directoryEntries, ...fileEntries];

    // Build the tree structure
    return buildFsTree(allItems);
  } catch (e) {
    console.error("Failed to load shadow folder:", e);
    return [];
  }
}

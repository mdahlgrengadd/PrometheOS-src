/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FileSystemItem } from "../plugins/apps/builder/types";

// A unified in-memory virtual file system
export class VirtualFS {
  private root: FileSystemItem[] = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(initialData?: FileSystemItem[]) {
    if (initialData) {
      this.root = initialData;
      this.initialized = true;
    }
  }

  // Get the current state of initialization
  isInitialized(): boolean {
    return this.initialized;
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

  // Read a file by path (e.g. 'src/app.jsx')
  readFile(path: string): string | undefined {
    const file = this.findItemByPath(path);
    return file && file.type === "file" ? file.content : undefined;
  }

  // Write a file by path
  writeFile(path: string, content: string): void {
    const file = this.findItemByPath(path);
    if (file && file.type === "file") {
      file.content = content;
    }
  }

  // List directory contents
  listDir(path: string): FileSystemItem[] {
    const dir = this.findItemByPath(path);
    return dir && dir.type === "folder" && dir.children ? dir.children : [];
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

  // Delete an item at a specific path
  public deleteItem(path: string[], id: string): void {
    const target = this.findItemByPathArray(path);
    if (target && target.type === "folder" && target.children) {
      target.children = target.children.filter((c) => c.id !== id);
    }
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

  // Helper: find item by path array (used by Zustand store)
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

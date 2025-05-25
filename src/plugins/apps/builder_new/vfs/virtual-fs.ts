import type { FileSystemItem } from "../types";

export class VirtualFS {
  private root: FileSystemItem[] = [];

  constructor(initialData?: FileSystemItem[]) {
    if (initialData) {
      this.root = initialData;
    }
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
    } else {
      // Optionally, create the file if it doesn't exist
      // (not implemented here for brevity)
    }
  }

  // List directory contents
  listDir(path: string): FileSystemItem[] {
    const dir = this.findItemByPath(path);
    return dir && dir.type === "folder" && dir.children ? dir.children : [];
  }

  // Delete a file or folder
  deleteFile(path: string): void {
    // Not implemented for brevity
  }

  // Initialize from data (e.g. mock, shadow folder, etc)
  initFromData(data: FileSystemItem[]): void {
    this.root = data;
  }

  // Serialize the current FS (for saving, exporting, etc)
  serialize(): FileSystemItem[] {
    return JSON.parse(JSON.stringify(this.root));
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

function buildFsTree(files: FileSystemItem[]): FileSystemItem[] {
  const root: { [name: string]: FileSystemItem } = {};

  for (const file of files) {
    const parts = file.id.split("/"); // id is the relative path
    let current = root;
    let parent: FileSystemItem | undefined;
    let pathSoFar = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
      if (i === parts.length - 1) {
        // File
        current[part] = { ...file, name: part, id: pathSoFar };
      } else {
        // Folder
        if (!current[part]) {
          current[part] = {
            id: pathSoFar,
            name: part,
            type: "folder",
            children: {},
          } as any;
        }
        parent = current[part];
        if (!parent.children) parent.children = {};
        current = parent.children as any;
      }
    }
  }

  // Convert children objects to arrays recursively
  function toArray(node: any): FileSystemItem[] {
    return Object.values(node).map((item: any) => {
      if (item.type === "folder") {
        return { ...item, children: toArray(item.children) };
      }
      return item;
    });
  }

  return toArray(root);
}

// Utility to load a shadow folder from /public/shadow (for dev, using Vite plugin)
export async function loadShadowFolder(): Promise<FileSystemItem[]> {
  try {
    const res = await fetch("/shadow-manifest.json");
    if (!res.ok) throw new Error("Failed to load shadow-manifest.json");
    const manifest: Array<{
      id: string;
      name: string;
      type: string;
      contentPath: string;
    }> = await res.json();
    // Fetch file contents in parallel and map to FileSystemItem
    const filesWithContent: FileSystemItem[] = await Promise.all(
      manifest.map(async (item) => {
        if (item.type === "file") {
          const fileRes = await fetch(item.contentPath);
          const content = await fileRes.text();
          // Infer language from extension
          let language: string | undefined = undefined;
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
        }
        // Folders are not supported in this flat manifest, but could be added
        return {
          id: item.id,
          name: item.name,
          type: "folder",
          children: [],
        } as FileSystemItem;
      })
    );
    // Build a nested tree from the flat file list
    return buildFsTree(filesWithContent);
  } catch (e) {
    console.error("Failed to load shadow folder:", e);
    return [];
  }
}

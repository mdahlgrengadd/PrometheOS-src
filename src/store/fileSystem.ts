import { create } from "zustand";

import { eventBus } from "@/plugins/EventBus";
import { virtualFs } from "@/utils/virtual-fs";

import type { FileSystemItem } from "@/plugins/apps/file-explorer/types/fileSystem";

// Helper function to find a file by ID recursively
function findFileById(root: FileSystemItem, id: string): FileSystemItem | null {
  if (root.id === id) {
    return root;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = findFileById(child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

// Global helper function to read file content by ID from the file system store
export function getFileContent(fileId: string): string | null {
  const state = useFileSystemStore.getState();
  const file = findFileById(state.fs, fileId);

  if (file && file.type === "file") {
    return file.content || "";
  }

  return null;
}

interface FileSystemStore {
  fs: FileSystemItem;
  init: () => Promise<void>;
  forceReload: () => Promise<void>;
  addItems: (path: string[], items: FileSystemItem[]) => void;
  renameItem: (path: string[], id: string, newName: string) => void;
  deleteItem: (path: string[], id: string) => void;
  moveItem: (fromPath: string[], id: string, toPath: string[]) => void;
  updateFileContent: (path: string[], id: string, content: string) => void;
}

export const useFileSystemStore = create<FileSystemStore>((set, get) => ({
  // Get current state from the singleton VirtualFS
  fs: virtualFs.getRootFileSystemItem(),

  // Initialize the singleton VirtualFS (only loads once)
  init: async () => {
    await virtualFs.initializeOnce();
    set({ fs: virtualFs.getRootFileSystemItem() });
  },

  // Force reload from shadow (use carefully - will destroy runtime files!)
  forceReload: async () => {
    await virtualFs.forceReloadFromShadow();
    set({ fs: virtualFs.getRootFileSystemItem() });
  },

  // Add new items under a given path
  addItems: (path, items) => {
    virtualFs.addItems(path, items);
    const newFs = virtualFs.getRootFileSystemItem();
    set({ fs: newFs });

    // Emit event for components to react to changes
    eventBus.emit("vfs:itemsAdded", { path, items });
    console.log("[VFS Store] Emitted vfs:itemsAdded event for path:", path);
  },

  // Rename an item under a given path
  renameItem: (path, id, newName) => {
    virtualFs.renameItem(path, id, newName);
    set({ fs: virtualFs.getRootFileSystemItem() });

    // Emit event for components to react to changes
    eventBus.emit("vfs:itemRenamed", { path, id, newName });
    console.log("[VFS Store] Emitted vfs:itemRenamed event for path:", path);
  },

  // Delete an item under a given path
  deleteItem: (path, id) => {
    virtualFs.deleteItem(path, id);
    set({ fs: virtualFs.getRootFileSystemItem() });

    // Emit event for components to react to changes
    eventBus.emit("vfs:itemDeleted", { path, id });
    console.log("[VFS Store] Emitted vfs:itemDeleted event for path:", path);
  },

  // Move a single item from one folder path to another
  moveItem: (fromPath, id, toPath) => {
    virtualFs.moveItem(fromPath, id, toPath);
    set({ fs: virtualFs.getRootFileSystemItem() });

    // Emit event for components to react to changes
    eventBus.emit("vfs:itemMoved", { fromPath, id, toPath });
    console.log(
      "[VFS Store] Emitted vfs:itemMoved event from:",
      fromPath,
      "to:",
      toPath
    );
  },

  // Update the content of a file without having to delete and re-create it
  updateFileContent: (path, id, content) => {
    virtualFs.updateFileContent(path, id, content);
    set({ fs: virtualFs.getRootFileSystemItem() });

    // Emit event for components to react to changes
    eventBus.emit("vfs:fileContentUpdated", { path, id, content });
    console.log(
      "[VFS Store] Emitted vfs:fileContentUpdated event for path:",
      path
    );
  },
}));

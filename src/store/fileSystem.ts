import { create } from 'zustand';

import { loadShadowFolder } from '@/utils/virtual-fs';

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
  
  if (file && file.type === 'file') {
    return file.content || '';
  }
  
  return null;
}

interface FileSystemStore {
  fs: FileSystemItem;
  init: () => Promise<void>;
  addItems: (path: string[], items: FileSystemItem[]) => void;
  renameItem: (path: string[], id: string, newName: string) => void;
  deleteItem: (path: string[], id: string) => void;
  moveItem: (fromPath: string[], id: string, toPath: string[]) => void;
  updateFileContent: (path: string[], id: string, content: string) => void;
}

export const useFileSystemStore = create<FileSystemStore>((set) => ({
  // root wrapper
  fs: { id: "root", name: "My Computer", type: "folder", children: [] },

  // load initial state from shadow manifest
  init: async () => {
    const items = await loadShadowFolder();
    set({
      fs: { id: "root", name: "My Computer", type: "folder", children: items },
    });
  },

  // add new items under a given path
  addItems: (path, items) =>
    set((state) => {
      const clone = JSON.parse(JSON.stringify(state.fs)) as FileSystemItem;
      let curr = clone;
      for (let i = 1; i < path.length; i++) {
        const next = curr.children?.find((c) => c.id === path[i]);
        if (!next) return { fs: clone };
        curr = next;
      }
      curr.children = [...(curr.children || []), ...items];
      return { fs: clone };
    }),

  // rename an item under a given path
  renameItem: (path, id, newName) =>
    set((state) => {
      const clone = JSON.parse(JSON.stringify(state.fs)) as FileSystemItem;
      let curr = clone;
      for (let i = 1; i < path.length; i++) {
        const next = curr.children?.find((c) => c.id === path[i]);
        if (!next) return { fs: clone };
        curr = next;
      }
      const item = curr.children?.find((c) => c.id === id);
      if (item) item.name = newName;
      return { fs: clone };
    }),

  // delete an item under a given path
  deleteItem: (path, id) =>
    set((state) => {
      const clone = JSON.parse(JSON.stringify(state.fs)) as FileSystemItem;
      let curr = clone;
      for (let i = 1; i < path.length; i++) {
        const next = curr.children?.find((c) => c.id === path[i]);
        if (!next) return { fs: clone };
        curr = next;
      }
      curr.children = curr.children?.filter((c) => c.id !== id);
      return { fs: clone };
    }),

  // move a single item from one folder path to another
  moveItem: (fromPath, id, toPath) =>
    set((state) => {
      const clone = JSON.parse(JSON.stringify(state.fs)) as FileSystemItem;
      // remove from source
      let src = clone;
      for (let i = 1; i < fromPath.length; i++) {
        const next = src.children?.find((c) => c.id === fromPath[i]);
        if (!next) return { fs: clone };
        src = next;
      }
      const item = src.children?.find((c) => c.id === id);
      if (!item) return { fs: clone };
      src.children = src.children?.filter((c) => c.id !== id);

      // add to destination
      let dst = clone;
      for (let i = 1; i < toPath.length; i++) {
        const next = dst.children?.find((c) => c.id === toPath[i]);
        if (!next) return { fs: clone };
        dst = next;
      }
      dst.children = [...(dst.children || []), item];
      return { fs: clone };
    }),

  // update the content of a file without having to delete and re-create it
  updateFileContent: (path, id, content) =>
    set((state) => {
      const clone = JSON.parse(JSON.stringify(state.fs)) as FileSystemItem;
      let curr = clone;

      // Navigate to the containing folder
      for (let i = 1; i < path.length; i++) {
        const next = curr.children?.find((c) => c.id === path[i]);
        if (!next) return { fs: clone };
        curr = next;
      }

      // Find and update the file
      const file = curr.children?.find((c) => c.id === id);
      if (file && file.type === "file") {
        file.content = content;
      }

      return { fs: clone };
    }),
}));

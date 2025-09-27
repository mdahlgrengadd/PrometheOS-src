// Stub Virtual File System for Module Federation compatibility

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemItem[];
}

class VirtualFileSystem {
  private root: FileSystemItem = {
    id: 'root',
    name: 'root',
    type: 'folder',
    children: []
  };

  getRootFileSystemItem(): FileSystemItem {
    return this.root;
  }

  async initializeOnce(): Promise<void> {
    console.log('[VirtualFS] Initialized (stub implementation)');
  }

  async forceReloadFromShadow(): Promise<void> {
    console.log('[VirtualFS] Force reload (stub implementation)');
  }

  addItems(path: string[], items: FileSystemItem[]): void {
    console.log('[VirtualFS] Add items (stub implementation)', { path, items });
  }

  renameItem(path: string[], id: string, newName: string): void {
    console.log('[VirtualFS] Rename item (stub implementation)', { path, id, newName });
  }

  deleteItem(path: string[], id: string): void {
    console.log('[VirtualFS] Delete item (stub implementation)', { path, id });
  }

  moveItem(fromPath: string[], id: string, toPath: string[]): void {
    console.log('[VirtualFS] Move item (stub implementation)', { fromPath, id, toPath });
  }

  updateFileContent(path: string[], id: string, content: string): void {
    console.log('[VirtualFS] Update file content (stub implementation)', { path, id, content });
  }
}

export const virtualFs = new VirtualFileSystem();
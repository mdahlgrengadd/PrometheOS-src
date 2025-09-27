// File System types for Module Federation compatibility

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemItem[];
  path?: string;
  size?: number;
  modified?: Date;
  created?: Date;
}

export interface FileSystemStore {
  fs: FileSystemItem;
  init: () => Promise<void>;
  forceReload: () => Promise<void>;
  addItems: (path: string[], items: FileSystemItem[]) => void;
  renameItem: (path: string[], id: string, newName: string) => void;
  deleteItem: (path: string[], id: string) => void;
  moveItem: (fromPath: string[], id: string, toPath: string[]) => void;
  updateFileContent: (path: string[], id: string, content: string) => void;
}
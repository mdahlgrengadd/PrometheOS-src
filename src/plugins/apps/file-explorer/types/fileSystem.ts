export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  content?: string;
  language?: string;
  children?: FileSystemItem[];
}

export interface User {
  login: string;
  avatar_url: string;
  name: string;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
  itemId: string;
}

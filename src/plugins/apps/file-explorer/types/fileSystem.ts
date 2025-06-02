export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  content?: string;
  language?: string;
  children?: FileSystemItem[];
}

// Desktop shortcut manifest format
export interface DesktopShortcut {
  name: string; // Display name for the icon
  description?: string; // Tooltip description
  target: string; // Plugin ID to launch OR vfs:// path
  icon?: string; // Path to icon image OR plugin icon reference
  iconType?: "file" | "plugin" | "url";
  args?: Record<string, unknown>; // Optional arguments to pass
}

// List of file extensions to treat as text when uploading
export const TEXT_FILE_EXTENSIONS: string[] = [
  "txt",
  "js",
  "jsx",
  "ts",
  "tsx",
  "md",
  "css",
  "html",
  "json",
  "csv",
  "xml",
  "yml",
  "yaml",
  "py",
  "c",
  "h",
  "cpp",
  "cc",
  "hpp",
];

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

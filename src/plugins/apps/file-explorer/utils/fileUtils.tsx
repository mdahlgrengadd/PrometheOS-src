import {
  Archive,
  Code,
  File,
  FileText,
  Folder,
  Image,
  Music,
  Settings,
  Video,
} from "lucide-react";
import React from "react";

import { DesktopShortcut, FileSystemItem } from "../types/fileSystem";

// Create a desktop shortcut file
export const createDesktopShortcut = (
  pluginId: string,
  pluginName: string,
  description?: string
): FileSystemItem => {
  const shortcut: DesktopShortcut = {
    name: pluginName,
    description: description || `Launch ${pluginName}`,
    target: pluginId,
    iconType: "plugin",
    icon: pluginId,
  };

  return {
    id: `desktop_shortcut_${pluginId}_${Date.now()}`,
    name: `${pluginName}.json`,
    type: "file",
    content: JSON.stringify(shortcut, null, 2),
    size: JSON.stringify(shortcut, null, 2).length,
  };
};

// Create a file shortcut (points to a file in VFS)
export const createFileShortcut = (
  fileName: string,
  filePath: string,
  displayName?: string
): FileSystemItem => {
  const shortcut: DesktopShortcut = {
    name: displayName || fileName,
    description: `Open ${fileName}`,
    target: `vfs://${filePath}`,
    iconType: "file",
    icon: "/icons/34794_pictures_pictures.png", // default file icon
  };

  return {
    id: `desktop_file_shortcut_${Date.now()}`,
    name: `${displayName || fileName}.json`,
    type: "file",
    content: JSON.stringify(shortcut, null, 2),
    size: JSON.stringify(shortcut, null, 2).length,
  };
};

// Check if a file is a desktop shortcut
export const isDesktopShortcut = (item: FileSystemItem): boolean => {
  return item.type === "file" && item.name.endsWith(".json") && item.content
    ? isValidShortcutContent(item.content)
    : false;
};

// Validate shortcut content
const isValidShortcutContent = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return (
      parsed.name &&
      parsed.target &&
      typeof parsed.name === "string" &&
      typeof parsed.target === "string"
    );
  } catch {
    return false;
  }
};

// Parse shortcut content
export const parseShortcut = (item: FileSystemItem): DesktopShortcut | null => {
  if (!isDesktopShortcut(item)) return null;

  try {
    return JSON.parse(item.content || "{}") as DesktopShortcut;
  } catch {
    return null;
  }
};

// Map file extensions to appropriate desktop applications
export const getAppForFileExtension = (fileName: string): string | null => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    // Code files -> HybrIDE
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "py":
    case "css":
    case "html":
    case "json":
    case "xml":
    case "yml":
    case "yaml":
    case "c":
    case "h":
    case "cpp":
    case "cc":
    case "hpp":
    case "java":
    case "php":
    case "rb":
    case "go":
    case "rs":
    case "swift":
    case "kt":
    case "sh":
    case "bat":
    case "ps1":
      return "hybride";

    // Text files -> Notepad
    case "txt":
    case "log":
    case "ini":
    case "cfg":
    case "conf":
      return "notepad";

    // Document files -> Word Editor
    case "md":
    case "markdown":
    case "doc":
    case "docx":
    case "rtf":
      return "wordeditor";

    // Audio files -> Audio Player
    case "mp3":
    case "wav":
    case "flac":
    case "ogg":
    case "m4a":
    case "aac":
    case "wma":
      return "audioplayer";
    // Web files -> Browser
    case "htm":
    case "url":
      return "browser";

    // Published apps (folders with .exe extension) -> App Preview plugin
    case "exe":
      return "app-preview";

    default:
      return null;
  }
};

// Get file icon based on extension and type with proper color coding
export const getFileIcon = (item: FileSystemItem) => {
  if (item.type === "folder") {
    // Special handling for .exe folders (published apps)
    if (item.name.endsWith(".exe")) {
      return <Settings className="w-4 h-4 text-purple-600" />;
    }
    return <Folder className="w-4 h-4 text-blue-500" />;
  }

  const extension = item.name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return <Image className="w-4 h-4 text-green-500" />;
    case "txt":
    case "doc":
    case "docx":
    case "pdf":
    case "rtf":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "mp3":
    case "wav":
    case "flac":
    case "ogg":
      return <Music className="w-4 h-4 text-purple-500" />;
    case "mp4":
    case "avi":
    case "mkv":
    case "mov":
    case "wmv":
      return <Video className="w-4 h-4 text-orange-500" />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <Archive className="w-4 h-4 text-yellow-500" />;
    case "js":
    case "ts":
    case "html":
    case "css":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "php":
      return <Code className="w-4 h-4 text-cyan-500" />;
    case "json":
      // Special handling for shortcut files
      if (isDesktopShortcut(item)) {
        return <Settings className="w-4 h-4 text-blue-600" />;
      }
      return <Code className="w-4 h-4 text-cyan-500" />;
    case "exe":
    case "msi":
    case "dmg":
      return <Settings className="w-4 h-4 text-indigo-500" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

// Format file size
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to find path to folder
export const findFolderPath = (
  item: FileSystemItem,
  targetId: string,
  currentPath: string[] = ["root"]
): string[] | null => {
  if (item.id === targetId) {
    return currentPath;
  }

  if (item.children) {
    for (const child of item.children) {
      const result = findFolderPath(child, targetId, [
        ...currentPath,
        child.id,
      ]);
      if (result) return result;
    }
  }

  return null;
};

// Create a desktop shortcut from an existing VFS item
export const createDesktopShortcutFromItem = (
  item: FileSystemItem,
  vfsPath: string
): FileSystemItem => {
  const shortcut: DesktopShortcut = {
    name: item.name,
    description:
      item.type === "folder" ? `Open ${item.name} folder` : `Open ${item.name}`,
    target: `vfs://${vfsPath}`,
    iconType: "file",
    icon: "/icons/34794_pictures_pictures.png", // default icon
  };

  return {
    id: `desktop_shortcut_from_${item.id}_${Date.now()}`,
    name: `${item.name}.json`,
    type: "file",
    content: JSON.stringify(shortcut, null, 2),
    size: JSON.stringify(shortcut, null, 2).length,
  };
};

// Create a copy of a VFS item for desktop (maintains original file)
export const createDesktopCopy = (item: FileSystemItem): FileSystemItem => {
  return {
    ...item,
    id: `desktop_copy_${item.id}_${Date.now()}`, // New ID for desktop copy
  };
};

// Generate a unique file name if duplicates exist
export const generateUniqueFileName = (
  originalName: string,
  existingItems: FileSystemItem[]
): string => {
  // Check if the original name already exists
  const existingNames = existingItems.map((item) => item.name.toLowerCase());

  if (!existingNames.includes(originalName.toLowerCase())) {
    return originalName; // No conflict, return original name
  }

  // Parse the file name and extension
  const lastDotIndex = originalName.lastIndexOf(".");
  const baseName =
    lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
  const extension =
    lastDotIndex > 0 ? originalName.substring(lastDotIndex) : "";

  // Try numbers starting from 1
  let counter = 1;
  let newName: string;

  do {
    newName = `${baseName} (${counter})${extension}`;
    counter++;
  } while (existingNames.includes(newName.toLowerCase()));

  return newName;
};

// Create a copy of a VFS item for desktop with unique naming
export const createDesktopCopyWithUniqueName = (
  item: FileSystemItem,
  existingItems: FileSystemItem[]
): FileSystemItem => {
  const uniqueName = generateUniqueFileName(item.name, existingItems);

  return {
    ...item,
    id: `desktop_copy_${item.id}_${Date.now()}`, // New ID for desktop copy
    name: uniqueName, // Use the unique name
  };
};

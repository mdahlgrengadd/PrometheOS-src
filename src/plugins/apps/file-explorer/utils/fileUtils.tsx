import React from 'react';
import { FileSystemItem } from "../types/fileSystem";
import { 
  Folder, 
  File, 
  Image, 
  FileText, 
  Music, 
  Video, 
  Archive, 
  Code,
  Settings
} from 'lucide-react';

// Map file extensions to appropriate desktop applications
export const getAppForFileExtension = (fileName: string): string | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    // Code files -> HybrIDE
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'py':
    case 'css':
    case 'html':
    case 'json':
    case 'xml':
    case 'yml':
    case 'yaml':
    case 'c':
    case 'h':
    case 'cpp':
    case 'cc':
    case 'hpp':
    case 'java':
    case 'php':
    case 'rb':
    case 'go':
    case 'rs':
    case 'swift':
    case 'kt':
    case 'sh':
    case 'bat':
    case 'ps1':
      return 'hybride';
    
    // Text files -> Notepad
    case 'txt':
    case 'log':
    case 'ini':
    case 'cfg':
    case 'conf':
      return 'notepad';
    
    // Document files -> Word Editor
    case 'md':
    case 'markdown':
    case 'doc':
    case 'docx':
    case 'rtf':
      return 'wordeditor';
    
    // Audio files -> Audio Player
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
    case 'm4a':
    case 'aac':
    case 'wma':
      return 'audioplayer';
    
    // Web files -> Browser
    case 'htm':
    case 'url':
      return 'browser';
    
    default:
      return null;
  }
};

// Get file icon based on extension and type with proper color coding
export const getFileIcon = (item: FileSystemItem) => {
  if (item.type === 'folder') {
    return <Folder className="w-4 h-4 text-blue-500" />;
  }
  
  const extension = item.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return <Image className="w-4 h-4 text-green-500" />;
    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'rtf':
      return <FileText className="w-4 h-4 text-red-500" />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
      return <Music className="w-4 h-4 text-purple-500" />;
    case 'mp4':
    case 'avi':
    case 'mkv':
    case 'mov':
    case 'wmv':
      return <Video className="w-4 h-4 text-orange-500" />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <Archive className="w-4 h-4 text-yellow-500" />;
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'php':
      return <Code className="w-4 h-4 text-cyan-500" />;
    case 'exe':
    case 'msi':
    case 'dmg':
      return <Settings className="w-4 h-4 text-indigo-500" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

// Format file size
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to find path to folder
export const findFolderPath = (
  item: FileSystemItem, 
  targetId: string, 
  currentPath: string[] = ['root']
): string[] | null => {
  if (item.id === targetId) {
    return currentPath;
  }
  
  if (item.children) {
    for (const child of item.children) {
      const result = findFolderPath(child, targetId, [...currentPath, child.id]);
      if (result) return result;
    }
  }
  
  return null;
};

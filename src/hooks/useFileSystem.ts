
import { useState, useEffect } from 'react';
import { fileSystem, FileSystemItem, Drive } from '../services/FileSystem';

export function useFileSystem() {
  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [currentDrive, setCurrentDrive] = useState<string>('local-drive');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Load files and drives from localStorage
  useEffect(() => {
    loadFiles();
    loadDrives();
    
    // Set initial directory to root of local drive
    if (!currentDirectory) {
      const rootFolder = fileSystem.getFilesByParent(null, 'local-drive')[0];
      if (rootFolder) {
        setCurrentDirectory(rootFolder.id);
      }
    }
  }, [currentDirectory]);

  // Refresh file list
  const loadFiles = () => {
    const allFiles = fileSystem.getFiles();
    setFiles(allFiles);
  };

  // Refresh drives list
  const loadDrives = () => {
    const allDrives = fileSystem.getDrives();
    setDrives(allDrives);
  };

  // Get files in current directory
  const getCurrentDirectoryFiles = (): FileSystemItem[] => {
    return fileSystem.getFilesByParent(currentDirectory, currentDrive);
  };

  // Get current directory info
  const getCurrentDirectoryInfo = (): FileSystemItem | null => {
    if (!currentDirectory) return null;
    return fileSystem.getFileById(currentDirectory);
  };

  // Navigate to directory
  const navigateToDirectory = (dirId: string) => {
    setCurrentDirectory(dirId);
    setSelectedItems([]);
  };

  // Navigate to parent directory
  const navigateToParentDirectory = () => {
    const currentDir = fileSystem.getFileById(currentDirectory || '');
    if (currentDir && currentDir.parent !== null) {
      navigateToDirectory(currentDir.parent);
    }
  };

  // Navigate to drive root
  const navigateToDrive = (driveId: string) => {
    setCurrentDrive(driveId);
    const rootFolder = fileSystem.getFilesByParent(null, driveId)[0];
    if (rootFolder) {
      setCurrentDirectory(rootFolder.id);
    }
    setSelectedItems([]);
  };

  // Create new file
  const createFile = (name: string, content: string = '') => {
    const id = `file-${Date.now()}`;
    const currentDir = fileSystem.getFileById(currentDirectory || '');
    const path = currentDir ? `${currentDir.path}/${name}` : `/${name}`;
    
    const newFile: FileSystemItem = {
      id,
      name,
      type: 'file',
      parent: currentDirectory,
      content,
      path,
      driveId: currentDrive,
      modifiedAt: Date.now(),
      createdAt: Date.now()
    };
    
    fileSystem.saveFile(newFile);
    loadFiles();
    return newFile;
  };

  // Create new folder
  const createFolder = (name: string) => {
    const id = `folder-${Date.now()}`;
    const currentDir = fileSystem.getFileById(currentDirectory || '');
    const path = currentDir ? `${currentDir.path}/${name}` : `/${name}`;
    
    const newFolder: FileSystemItem = {
      id,
      name,
      type: 'folder',
      parent: currentDirectory,
      path,
      driveId: currentDrive,
      modifiedAt: Date.now(),
      createdAt: Date.now()
    };
    
    fileSystem.saveFile(newFolder);
    loadFiles();
    return newFolder;
  };

  // Delete item
  const deleteItem = (id: string) => {
    fileSystem.deleteFile(id);
    
    // If we deleted the current directory, navigate to parent
    if (id === currentDirectory) {
      navigateToParentDirectory();
    }
    
    loadFiles();
  };

  // Move item to new directory
  const moveItem = (itemId: string, targetDirId: string) => {
    const item = fileSystem.getFileById(itemId);
    const targetDir = fileSystem.getFileById(targetDirId);
    
    if (item && targetDir && targetDir.type === 'folder') {
      const newPath = `${targetDir.path}/${item.name}`;
      fileSystem.moveFile(itemId, targetDirId, newPath);
      loadFiles();
    }
  };

  // Update item name or content
  const updateItem = (id: string, updates: Partial<FileSystemItem>) => {
    const item = fileSystem.getFileById(id);
    if (item) {
      fileSystem.saveFile({
        ...item,
        ...updates
      });
      loadFiles();
    }
  };

  // Add a network drive
  const addNetworkDrive = async (url: string) => {
    const drive = await fileSystem.addNetworkDrive(url);
    loadDrives();
    return drive;
  };

  // Connect to GitHub
  const connectToGitHub = async (accessToken: string, repoUrl: string, readOnly: boolean) => {
    const drive = await fileSystem.connectToGitHub(accessToken, repoUrl, readOnly);
    loadDrives();
    return drive;
  };

  return {
    files,
    drives,
    currentDirectory,
    currentDrive,
    selectedItems,
    setSelectedItems,
    getCurrentDirectoryFiles,
    getCurrentDirectoryInfo,
    navigateToDirectory,
    navigateToParentDirectory,
    navigateToDrive,
    createFile,
    createFolder,
    deleteItem,
    moveItem,
    updateItem,
    addNetworkDrive,
    connectToGitHub
  };
}

import {
    File as FileIcon, FileCode, FileImage, FileSpreadsheet, FileText, Folder
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { toast } from '@/components/ui/use-toast';
import { useFileSystem } from '@/hooks/useFileSystem';
import { FileSystemItem } from '@/services/FileSystem';

import FileBrowserSidebar from './FileBrowserSidebar';
import FileBrowserToolbar from './FileBrowserToolbar';

const FileBrowserContent: React.FC = () => {
  const {
    getCurrentDirectoryFiles,
    getCurrentDirectoryInfo,
    navigateToDirectory,
    navigateToDrive,
    currentDrive,
    currentDirectory,
    moveItem,
    selectedItems,
    setSelectedItems,
    updateItem,
    createFile,
  } = useFileSystem();

  const [files, setFiles] = useState<FileSystemItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files when directory changes
  useEffect(() => {
    refreshFiles();
  }, [currentDrive, currentDirectory]);

  const refreshFiles = () => {
    const dirFiles = getCurrentDirectoryFiles();
    setFiles(dirFiles);
  };

  const currentDir = getCurrentDirectoryInfo();

  const getFileIcon = (file: FileSystemItem) => {
    if (file.type === "folder") {
      return <Folder className="h-5 w-5 text-yellow-500" />;
    }

    // Determine file type based on name
    if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
      return <FileImage className="h-5 w-5 text-blue-500" />;
    } else if (file.name.match(/\.(txt|md)$/i)) {
      return <FileText className="h-5 w-5 text-gray-500" />;
    } else if (file.name.match(/\.(html|css|js|ts|jsx|tsx)$/i)) {
      return <FileCode className="h-5 w-5 text-green-500" />;
    } else if (file.name.match(/\.(csv|xls|xlsx)$/i)) {
      return <FileSpreadsheet className="h-5 w-5 text-green-700" />;
    }

    return <FileIcon className="h-5 w-5 text-gray-400" />;
  };

  const handleFileClick = (file: FileSystemItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-selection with Ctrl/Command
      if (selectedItems.includes(file.id)) {
        setSelectedItems(selectedItems.filter((id) => id !== file.id));
      } else {
        setSelectedItems([...selectedItems, file.id]);
      }
    } else if (e.shiftKey && selectedItems.length > 0) {
      // Range selection with Shift
      const fileIds = files.map((f) => f.id);
      const lastSelectedIndex = fileIds.indexOf(
        selectedItems[selectedItems.length - 1]
      );
      const currentIndex = fileIds.indexOf(file.id);

      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);

      const rangeSelection = fileIds.slice(start, end + 1);
      setSelectedItems([...new Set([...selectedItems, ...rangeSelection])]);
    } else {
      // Regular click (single selection)
      setSelectedItems([file.id]);

      if (file.type === "folder") {
        navigateToDirectory(file.id);
      }
    }
  };

  const handleDoubleClick = (file: FileSystemItem) => {
    if (file.type === "folder") {
      navigateToDirectory(file.id);
    } else {
      // Open file content editor (simplified for this example)
      toast({
        title: "File Opened",
        description: `Opening ${file.name}`,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    setDraggedItem(fileId);
    e.dataTransfer.setData("text/plain", fileId);
  };

  const handleDragOver = (e: React.DragEvent, fileId: string | null) => {
    e.preventDefault();
    setDragOverItem(fileId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (draggedItem && draggedItem !== targetId) {
      const target = files.find((f) => f.id === targetId);

      if (target && target.type === "folder") {
        moveItem(draggedItem, targetId);
        refreshFiles();
        toast({
          title: "Item Moved",
          description: `Item has been moved successfully.`,
        });
      }
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleExternalDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer.items) {
      // Handle dropped files from OS
      handleUploadedFiles(e.dataTransfer.items);
    }

    setDragOverItem(null);
  };

  const handleUploadedFiles = async (items: DataTransferItemList) => {
    const uploadPromises = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          uploadPromises.push(readFileContent(file));
        }
      }
    }

    try {
      await Promise.all(uploadPromises);
      refreshFiles();
      toast({
        title: "Files Uploaded",
        description: `${uploadPromises.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Some files failed to upload.",
        variant: "destructive",
      });
    }
  };

  const readFileContent = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const { name } = file;
        const content = e.target?.result?.toString() || "";

        try {
          createFile(name, content);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleRename = (file: FileSystemItem) => {
    setEditingFile(file.id);
    setEditName(file.name);

    // Focus the input once it's rendered
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus();
        fileInputRef.current.select();
      }
    }, 10);
  };

  const handleRenameSubmit = () => {
    if (editingFile && editName.trim()) {
      updateItem(editingFile, { name: editName.trim() });
      setEditingFile(null);
      refreshFiles();
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const filesArray = Array.from(target.files);

        const uploadPromises = filesArray.map((file) => {
          return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
              try {
                createFile(file.name, e.target?.result?.toString() || "");
                resolve();
              } catch (error) {
                reject(error);
              }
            };

            reader.onerror = reject;
            reader.readAsText(file);
          });
        });

        try {
          await Promise.all(uploadPromises);
          refreshFiles();
          toast({
            title: "Files Uploaded",
            description: `${filesArray.length} file(s) uploaded successfully.`,
          });
        } catch (error) {
          toast({
            title: "Upload Error",
            description: "Some files failed to upload.",
            variant: "destructive",
          });
        }
      }
    };

    input.click();
  };

  return (
    <div className="flex flex-col h-full">
      <FileBrowserToolbar
        selectedItems={selectedItems}
        refreshFiles={refreshFiles}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileBrowserSidebar
          selectedDrive={currentDrive}
          onDriveSelect={navigateToDrive}
        />

        <div
          className="flex-1 overflow-auto p-4 text-foreground"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleExternalDrop}
        >
          <div className="text-sm mb-2 pb-1 border-b border-border">
            <span>Current path: {currentDir?.path || "/"}</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`
                  p-2 border rounded-md flex flex-col items-center justify-center
                  ${
                    dragOverItem === file.id && file.type === "folder"
                      ? "bg-blue-100"
                      : ""
                  }
                  ${
                    selectedItems.includes(file.id)
                      ? "bg-blue-50 border-blue-300"
                      : ""
                  }
                  hover:bg-muted/50 cursor-pointer transition-colors
                `}
                onClick={(e) => handleFileClick(file, e)}
                onDoubleClick={() => handleDoubleClick(file)}
                onDragStart={(e) => handleDragStart(e, file.id)}
                onDragOver={(e) => handleDragOver(e, file.id)}
                onDragEnd={() => setDraggedItem(null)}
                onDrop={(e) => handleDrop(e, file.id)}
                draggable={true}
              >
                {getFileIcon(file)}

                {editingFile === file.id ? (
                  <div className="mt-1 w-full">
                    <input
                      ref={fileInputRef}
                      type="text"
                      className="w-full text-xs border rounded px-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameSubmit();
                        } else if (e.key === "Escape") {
                          setEditingFile(null);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="mt-1 text-xs text-center w-full truncate"
                    title={file.name}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!selectedItems.includes(file.id)) {
                        setSelectedItems([file.id]);
                      }

                      // Context menu actions could be implemented here
                      // For simplicity, we'll just trigger rename
                      handleRename(file);
                    }}
                  >
                    {file.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t p-2 flex items-center justify-between bg-muted/20 text-xs text-muted-foreground">
        <div>{files.length} item(s)</div>
        <div>
          <button
            onClick={handleFileUpload}
            className="px-2 py-1 text-xs hover:underline"
          >
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileBrowserContent;

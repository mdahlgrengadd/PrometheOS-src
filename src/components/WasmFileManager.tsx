import { Edit, FileText, Folder, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useWasmKernel } from '@/hooks/useWasmKernel';

interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
}

export const WasmFileManager: React.FC = () => {
  const { state, api } = useWasmKernel();
  const [currentPath, setCurrentPath] = useState("/home");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [newFileName, setNewFileName] = useState("");
  const [newDirName, setNewDirName] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");

  const refreshFiles = async () => {
    if (!api) return;

    try {
      const fileNames = await api.listDir(currentPath);
      const fileItems: FileItem[] = [];

      for (const name of fileNames) {
        const fullPath = `${currentPath}/${name}`;
        try {
          // Try to list as directory first
          await api.listDir(fullPath);
          fileItems.push({ name, type: "directory", path: fullPath });
        } catch {
          // If it fails, it's a file
          fileItems.push({ name, type: "file", path: fullPath });
        }
      }

      setFiles(fileItems);
    } catch (error) {
      console.error("Failed to refresh files:", error);
    }
  };

  const createFile = async () => {
    if (!api || !newFileName) return;

    try {
      const filePath = `${currentPath}/${newFileName}`;
      const content = new TextEncoder().encode("");
      await api.writeFile(filePath, content);
      setNewFileName("");
      await refreshFiles();
    } catch (error) {
      console.error("Failed to create file:", error);
    }
  };

  const createDirectory = async () => {
    if (!api || !newDirName) return;

    try {
      const dirPath = `${currentPath}/${newDirName}`;
      await api.createDir(dirPath);
      setNewDirName("");
      await refreshFiles();
    } catch (error) {
      console.error("Failed to create directory:", error);
    }
  };

  const deleteFile = async (path: string) => {
    if (!api) return;

    try {
      await api.deleteFile(path);
      await refreshFiles();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const openFile = async (path: string) => {
    if (!api) return;

    try {
      const data = await api.readFile(path);
      const content = new TextDecoder().decode(data);
      setFileContent(content);
      setSelectedFile(path);
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const saveFile = async () => {
    if (!api || !selectedFile) return;

    try {
      const data = new TextEncoder().encode(fileContent);
      await api.writeFile(selectedFile, data);
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  };

  const navigateToDirectory = (path: string) => {
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent("");
  };

  useEffect(() => {
    if (state.isInitialized) {
      refreshFiles();
    }
  }, [state.isInitialized, currentPath]);

  if (!state.isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>WASM File Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Waiting for WASM kernel to initialize...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            File Browser
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current: {currentPath}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateToDirectory("/home")}
            >
              Home
            </Button>
            {currentPath !== "/home" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const parentPath =
                    currentPath.split("/").slice(0, -1).join("/") || "/";
                  navigateToDirectory(parentPath);
                }}
              >
                Up
              </Button>
            )}
          </div>

          {/* Create new items */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="New file name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createFile()}
              />
              <Button onClick={createFile} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="New directory name"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createDirectory()}
              />
              <Button onClick={createDirectory} size="sm">
                <Folder className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* File list */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between p-2 hover:bg-muted rounded"
              >
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => {
                    if (file.type === "directory") {
                      navigateToDirectory(file.path);
                    } else {
                      openFile(file.path);
                    }
                  }}
                >
                  {file.type === "directory" ? (
                    <Folder className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <span>{file.name}</span>
                  <Badge
                    variant={
                      file.type === "directory" ? "default" : "secondary"
                    }
                  >
                    {file.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteFile(file.path)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            File Editor
          </CardTitle>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Editing: {selectedFile}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="space-y-4">
              <textarea
                className="w-full h-64 p-3 border rounded font-mono text-sm resize-none"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="File content..."
              />
              <Button onClick={saveFile}>Save File</Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a file to edit</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

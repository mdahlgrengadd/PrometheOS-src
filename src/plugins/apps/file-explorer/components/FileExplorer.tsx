import { Folder } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSelectionContainer } from '@air/react-drag-to-select';

import { ideSettings } from '../../../../plugins/apps/builder/utils/esbuild-settings';
import { loadShadowFolder } from '../../../../utils/virtual-fs';
import { ContextMenuPosition, FileSystemItem, User } from '../types/fileSystem';
import { findFolderPath } from '../utils/fileUtils';
import ContextMenu from './ContextMenu';
import { NewItemDialog, RenameDialog } from './Dialogs';
import FileGrid from './FileGrid';
import Sidebar from './Sidebar';
// Component imports
import TitleBar from './TitleBar';
import Toolbar from './Toolbar';

const FileExplorer: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemItem>({
    id: "root",
    name: "My Computer",
    type: "folder",
    children: [],
  });
  const [currentPath, setCurrentPath] = useState<string[]>(["root"]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["root"])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showContextMenu, setShowContextMenu] =
    useState<ContextMenuPosition | null>(null);
  const [showNewItemDialog, setShowNewItemDialog] = useState<boolean>(false);
  const [showRenameDialog, setShowRenameDialog] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState<string>("");
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [dragSelectActive, setDragSelectActive] = useState<boolean>(false);
  const [isDraggingOnEmptySpace, setIsDraggingOnEmptySpace] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Derive ignore patterns from .vfsignore at root
  const ignoreFile = useMemo(
    () =>
      fileSystem.children?.find(
        (item) => item.name === ".vfsignore" && item.type === "file"
      ),
    [fileSystem]
  );
  const ignorePatterns = useMemo(() => {
    if (!ignoreFile || !ignoreFile.content) return [];
    return ignoreFile.content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }, [ignoreFile]);
  const ignoreMatchers = useMemo(() => {
    return ignorePatterns.map((pattern) => {
      const isDirPattern = pattern.endsWith("/");
      const basePattern = isDirPattern ? pattern.slice(0, -1) : pattern;
      let regexStr = basePattern
        .replace(/\*\*/g, ".*")
        .replace(/\*/g, "[^/]*")
        .replace(/\?/g, ".");
      if (isDirPattern) {
        regexStr = `${regexStr}(/.*)?`;
      }
      return new RegExp(`^${regexStr}$`);
    });
  }, [ignorePatterns]);

  // Compute visible & sorted children for the current folder
  const visibleChildren = useMemo(() => {
    // Determine current folder based on path
    let current: FileSystemItem | undefined = fileSystem;
    for (let i = 1; i < currentPath.length; i++) {
      current = current.children?.find((child) => child.id === currentPath[i]);
      if (!current) break;
    }
    const children = current?.children || [];
    return children.filter((child) => {
      if (child.name === ".vfsignore") return false;
      if (!ideSettings.showHiddenFiles && child.name.startsWith("."))
        return false;
      if (ignoreMatchers.some((rx) => rx.test(child.id))) return false;
      return true;
    });
  }, [fileSystem, currentPath, ignoreMatchers, ideSettings.showHiddenFiles]);
  const sortedChildren = useMemo(() => {
    return [...visibleChildren].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [visibleChildren]);

  // Load initial file system from shadow on mount
  useEffect(() => {
    (async () => {
      const items = await loadShadowFolder();
      setFileSystem({
        id: "root",
        name: "My Computer",
        type: "folder",
        children: items,
      });
      setExpandedFolders(new Set(["root"]));
    })();
  }, []);

  // Set up drag selection container
  const { DragSelection } = useSelectionContainer({
    onSelectionChange: handleSelectionChange,
    isEnabled: isDraggingOnEmptySpace,
    shouldStartSelecting: (target) => {
      // Only allow selection to start if we're clicking on the grid container itself,
      // not on any of the file/folder items
      if (target instanceof HTMLElement) {
        // Check if the click target is a file/folder item or one of its children
        let el = target;
        while (el && el !== gridRef.current) {
          if (el.hasAttribute("data-item-id")) {
            return false; // Don't start selection if we're on a file item
          }
          el = el.parentElement as HTMLElement;
        }
        return true; // Allow selection if we're on empty space
      }
      return false;
    },
    selectionProps: {
      style: {
        border: "2px solid #3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        position: "absolute",
        zIndex: 1000,
      },
    },
  });

  // Find item by path through the file system
  const findItemByPath = useCallback(
    (path: string[]): FileSystemItem | null => {
      let current = fileSystem;
      for (let i = 1; i < path.length; i++) {
        const found = current.children?.find((child) => child.id === path[i]);
        if (!found) return null;
        current = found;
      }
      return current;
    },
    [fileSystem]
  );

  // Get current folder
  const getCurrentFolder = useCallback(
    () => findItemByPath(currentPath),
    [findItemByPath, currentPath]
  );

  // Navigate to folder
  const navigateToFolder = useCallback(
    (folderId: string) => {
      const newPath = [...currentPath, folderId];
      setCurrentPath(newPath);
      setSelectedItems(new Set());
      setExpandedFolders((prev) => new Set([...prev, folderId]));
    },
    [currentPath]
  );

  // Navigate up one level
  const navigateUp = useCallback(() => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedItems(new Set());
    }
  }, [currentPath]);

  // Navigate to specific path level (breadcrumb navigation)
  const navigateToPathLevel = useCallback(
    (level: number) => {
      const newPath = currentPath.slice(0, level + 1);
      setCurrentPath(newPath);
      setSelectedItems(new Set());
    },
    [currentPath]
  );

  // Toggle folder expansion in tree view
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  }, []);

  // Handle drag selection
  function handleSelectionChange(selectionBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) {
    if (!gridRef.current || !selectionBox.width || !selectionBox.height) return;

    setSelectionBox(selectionBox);

    // Find items that intersect with the selection box
    const gridItems = gridRef.current.querySelectorAll("[data-item-id]");
    const selectedIds = new Set<string>();

    gridItems.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const itemId = element.getAttribute("data-item-id");

      if (!itemId) return;

      // Get the container's bounding rect to calculate relative positions
      const containerRect = gridRef.current!.getBoundingClientRect();

      // Convert item rect to be relative to the container
      const itemRelativeRect = {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        right: rect.right - containerRect.left,
        bottom: rect.bottom - containerRect.top,
      };

      // Check if the element intersects with the selection box
      const intersects = !(
        itemRelativeRect.right < selectionBox.left ||
        itemRelativeRect.left > selectionBox.left + selectionBox.width ||
        itemRelativeRect.bottom < selectionBox.top ||
        itemRelativeRect.top > selectionBox.top + selectionBox.height
      );

      if (intersects) {
        selectedIds.add(itemId);
      }
    });

    setSelectedItems(selectedIds);
  }

  // Handle external file drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    // Highlight drop zone
    const target = e.currentTarget as HTMLElement;
    target.classList.add("bg-blue-50", "border-blue-300");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("bg-blue-50", "border-blue-300");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("bg-blue-50", "border-blue-300");

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0 && isAuthenticated) {
      const currentFolder = getCurrentFolder();
      if (currentFolder && currentFolder.children) {
        const newFiles = files.map((file) => ({
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: "file" as const,
          size: file.size,
        }));

        setFileSystem((prev) => {
          const updated = JSON.parse(JSON.stringify(prev));
          const target = findItemByPath(currentPath);
          if (target && target.children) {
            target.children = [...target.children, ...newFiles];
          }
          return updated;
        });
      }
    }
  };

  // Create new item (file or folder)
  const createNewItem = (type: "file" | "folder") => {
    if (!newItemName.trim() || !isAuthenticated) return;

    const newItem: FileSystemItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      type: type,
      ...(type === "folder" ? { children: [] } : { size: 0 }),
    };

    setFileSystem((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const target = findItemByPath(currentPath);
      if (target && target.children) {
        target.children.push(newItem);
      }
      return updated;
    });

    setNewItemName("");
    setShowNewItemDialog(false);
  };

  // Rename item
  const renameItem = (itemId: string, newName: string) => {
    if (!newName.trim() || !isAuthenticated) return;

    setFileSystem((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const target = findItemByPath(currentPath);
      if (target && target.children) {
        const item = target.children.find((child) => child.id === itemId);
        if (item) {
          item.name = newName.trim();
        }
      }
      return updated;
    });

    setShowRenameDialog(null);
    setNewItemName("");
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    if (!isAuthenticated) return;

    setFileSystem((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const target = findItemByPath(currentPath);
      if (target && target.children) {
        target.children = target.children.filter(
          (child) => child.id !== itemId
        );
      }
      return updated;
    });
    setSelectedItems(new Set());
    setShowContextMenu(null);
  };

  // GitHub authentication simulation
  const handleGithubAuth = () => {
    // Simulate GitHub OAuth flow
    setIsAuthenticated(true);
    setUser({
      login: "developer-user",
      avatar_url: "https://github.com/github.png",
      name: "Developer User",
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setSelectedItems(new Set());
  };

  // Quick access navigation
  const navigateToQuickAccess = (folderId: string) => {
    const folderPath = findFolderPath(fileSystem, folderId);
    if (folderPath) {
      setCurrentPath(folderPath);
      setSelectedItems(new Set());
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showNewItemDialog && newItemName.trim()) {
      createNewItem("folder");
    } else if (e.key === "Escape") {
      setShowNewItemDialog(false);
      setShowRenameDialog(null);
      setShowContextMenu(null);
    }
  };

  // Click outside to close context menu
  const handleClickOutside = () => {
    setShowContextMenu(null);
  };

  // Start item dragging
  const handleDragStart = (itemId: string, e: React.DragEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    setDraggedItem(itemId);
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "move";

    // If the item isn't in the current selection, make it the only selected item
    if (!selectedItems.has(itemId)) {
      setSelectedItems(new Set([itemId]));
    }
  };

  // Handle folder dragover
  const handleFolderDragOver = (folderId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem && draggedItem !== folderId) {
      setDragOverFolder(folderId);
      e.dataTransfer.dropEffect = "move";
    }
  };

  // Handle folder dragleave
  const handleFolderDragLeave = () => {
    setDragOverFolder(null);
  };

  // Handle dropping files/folders into other folders
  const handleFolderDrop = (targetFolderId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!draggedItem || !isAuthenticated) return;

    // Don't allow dropping a folder into itself
    if (draggedItem === targetFolderId) return;

    // Find the target folder path
    const targetFolderPath = findFolderPath(fileSystem, targetFolderId);
    if (!targetFolderPath) return;

    // Move all selected items to the target folder
    const itemsToMove = Array.from(selectedItems);

    setFileSystem((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));

      // Find source folder and remove items from it
      const sourceFolder = findItemByPath(currentPath);
      if (!sourceFolder || !sourceFolder.children) return prev;

      // Get the items to move and remove them from source
      const movedItems = sourceFolder.children.filter((item) =>
        itemsToMove.includes(item.id)
      );
      sourceFolder.children = sourceFolder.children.filter(
        (item) => !itemsToMove.includes(item.id)
      );

      // Find target folder and add items to it
      const targetFolder = findItemByPath(targetFolderPath);
      if (!targetFolder || !targetFolder.children) return prev;

      targetFolder.children = [...targetFolder.children, ...movedItems];

      return updated;
    });

    setDraggedItem(null);
  };

  const handleGridMouseDown = (e: React.MouseEvent) => {
    // Check if the click is directly on the grid (empty space) and not on a file/folder item
    if (e.target === gridRef.current || e.target === e.currentTarget) {
      setIsDraggingOnEmptySpace(true);
    } else {
      // Check if we're clicking on a file item or its children
      let el = e.target as HTMLElement;
      let isFileItem = false;

      while (el && el !== gridRef.current) {
        if (el.hasAttribute("data-item-id")) {
          isFileItem = true;
          break;
        }
        el = el.parentElement as HTMLElement;
      }

      if (!isFileItem) {
        setIsDraggingOnEmptySpace(true);
      }
    }

    setDragSelectActive(true);
  };

  const handleGridMouseUp = () => {
    setDragSelectActive(false);
    setIsDraggingOnEmptySpace(false);
    setSelectionBox(null);
  };

  const currentFolder = getCurrentFolder();
  const breadcrumbs = currentPath
    .slice(1)
    .reduce(
      (
        acc: Array<{ id: string; name: string; path: string[] }>,
        pathId,
        index
      ) => {
        const pathSoFar = currentPath.slice(0, index + 2);
        const item = findItemByPath(pathSoFar);
        if (item) {
          acc.push({ id: pathId, name: item.name, path: pathSoFar });
        }
        return acc;
      },
      []
    );

  return (
    <div
      className="h-screen flex flex-col bg-white"
      onClick={handleClickOutside}
    >
      {/* Title Bar */}
      <TitleBar
        isAuthenticated={isAuthenticated}
        user={user}
        handleGithubAuth={handleGithubAuth}
        handleLogout={handleLogout}
      />

      {/* Toolbar */}
      <Toolbar
        currentPath={currentPath}
        breadcrumbs={breadcrumbs}
        navigateUp={navigateUp}
        navigateToPathLevel={navigateToPathLevel}
        showNewItemDialog={() => setShowNewItemDialog(true)}
        fileInputRef={fileInputRef}
        isAuthenticated={isAuthenticated}
        handleGithubAuth={handleGithubAuth}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          fileSystem={fileSystem}
          expandedFolders={expandedFolders}
          selectedItems={selectedItems}
          navigateToQuickAccess={navigateToQuickAccess}
          toggleFolder={toggleFolder}
          setSelectedItems={setSelectedItems}
          handleFolderDragOver={handleFolderDragOver}
          handleFolderDragLeave={handleFolderDragLeave}
          handleFolderDrop={handleFolderDrop}
          dragOverFolder={dragOverFolder}
        />

        {/* Main Content with DragToSelect */}
        <div
          className="flex-1 p-6 overflow-y-auto bg-white transition-colors duration-200 relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseDown={handleGridMouseDown}
          onMouseUp={handleGridMouseUp}
          ref={gridRef}
        >
          <DragSelection />

          {currentFolder && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-1">
                  {currentFolder.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentFolder.children?.length || 0} item
                  {(currentFolder.children?.length || 0) !== 1 ? "s" : ""}
                </p>
              </div>

              {/* File Grid */}
              {sortedChildren.length > 0 ? (
                <FileGrid
                  items={sortedChildren}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  navigateToFolder={navigateToFolder}
                  setShowContextMenu={setShowContextMenu}
                  handleDragStart={handleDragStart}
                  handleFolderDragOver={handleFolderDragOver}
                  handleFolderDragLeave={handleFolderDragLeave}
                  handleFolderDrop={handleFolderDrop}
                  dragOverFolder={dragOverFolder}
                  selectionBox={selectionBox}
                />
              ) : (
                <div className="text-center text-gray-500 mb-8">
                  <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>This folder is empty</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hidden file input for upload button */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          console.log("Files selected for upload:", files);
        }}
      />

      {/* Context Menu */}
      {showContextMenu && (
        <ContextMenu
          position={{ x: showContextMenu.x, y: showContextMenu.y }}
          itemId={showContextMenu.itemId}
          onRename={(id) => {
            const currentItem = currentFolder?.children?.find(
              (item) => item.id === id
            );
            if (currentItem) {
              setNewItemName(currentItem.name);
              setShowRenameDialog(id);
            }
          }}
          onDelete={deleteItem}
          setShowContextMenu={setShowContextMenu}
        />
      )}

      {/* New Item Dialog */}
      {showNewItemDialog && (
        <NewItemDialog
          newItemName={newItemName}
          setNewItemName={setNewItemName}
          setShowNewItemDialog={setShowNewItemDialog}
          createNewItem={createNewItem}
          handleKeyDown={handleKeyDown}
        />
      )}

      {/* Rename Dialog */}
      {showRenameDialog && (
        <RenameDialog
          newItemName={newItemName}
          setNewItemName={setNewItemName}
          setShowRenameDialog={setShowRenameDialog}
          renameItem={renameItem}
          showRenameDialog={showRenameDialog}
        />
      )}
    </div>
  );
};

export default FileExplorer;

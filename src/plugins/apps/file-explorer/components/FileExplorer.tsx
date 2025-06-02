import { Folder } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { useApi } from "@/api/hooks/useApi";
import { useFileSystemStore } from "@/store/fileSystem";
import { useSelectionContainer } from "@air/react-drag-to-select";

import { ideSettings } from "../../../../plugins/apps/builder/utils/esbuild-settings";
import {
  ContextMenuPosition,
  FileSystemItem,
  TEXT_FILE_EXTENSIONS,
  User,
} from "../types/fileSystem";
import {
  createDesktopCopyWithUniqueName,
  createDesktopShortcut,
  createFileShortcut,
  findFolderPath,
  generateUniqueFileName,
  getAppForFileExtension,
} from "../utils/fileUtils";
import ContextMenu from "./ContextMenu";
import { NewItemDialog, RenameDialog } from "./Dialogs";
import FileGrid from "./FileGrid";
import Sidebar from "./Sidebar";
// Component imports
import TitleBar from "./TitleBar";
import Toolbar from "./Toolbar";

const FileExplorer: React.FC = () => {
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
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // use shared Zustand store for file system
  const fileSystem = useFileSystemStore((s) => s.fs);
  const initFs = useFileSystemStore((s) => s.init);
  const addItems = useFileSystemStore((s) => s.addItems);
  const renameItemStore = useFileSystemStore((s) => s.renameItem);
  const deleteItemStore = useFileSystemStore((s) => s.deleteItem);
  const moveItem = useFileSystemStore((s) => s.moveItem);

  // Use API context for opening files with appropriate apps
  const apiContext = useApi();

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
  }, [fileSystem, currentPath, ignoreMatchers]);
  const sortedChildren = useMemo(() => {
    return [...visibleChildren].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [visibleChildren]);

  // initialize file system from shadow on mount
  useEffect(() => {
    initFs().then(() => setExpandedFolders(new Set(["root"])));

    // Auto-authenticate by default
    if (!isAuthenticated) {
      handleGithubAuth();
    }
  }, [initFs, isAuthenticated]);

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
  // Handle opening files with appropriate apps
  const openFile = useCallback(
    async (file: FileSystemItem) => {
      if (
        file.type !== "file" &&
        !(file.type === "folder" && file.name.endsWith(".exe"))
      )
        return;

      // Special handling for .exe folders (published apps)
      if (file.type === "folder" && file.name.endsWith(".exe")) {
        try {
          const appPath = `app://PublishedApps/${file.name}`;
          // Use App Preview plugin for published apps
          await apiContext?.executeAction("sys", "open", {
            name: "app-preview",
            initFromUrl: appPath,
          });
          toast(`Opening published app: ${file.name}`);
        } catch (error) {
          console.error("Failed to open published app:", error);
          toast(`Failed to open ${file.name}`);
        }
        return;
      }

      const appId = getAppForFileExtension(file.name);
      if (!appId) {
        toast(`No default app for file type: ${file.name.split(".").pop()}`);
        return;
      }

      try {
        const vfsPath = `vfs://${file.id}`;
        await apiContext?.executeAction("sys", "open", {
          name: appId,
          initFromUrl: vfsPath,
        });
        toast(`Opening ${file.name} with ${appId}`);
      } catch (error) {
        console.error("Failed to open file:", error);
        toast(`Failed to open ${file.name}`);
      }
    },
    [apiContext]
  );

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
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);

    // Auto-authenticate for better demo experience if not already authenticated
    if (files.length > 0 && !isAuthenticated) {
      handleGithubAuth();
      toast.success("Auto-authenticated for file upload");
    }

    if (files.length > 0) {
      try {
        // Create array for new files
        const newFiles: FileSystemItem[] = [];

        // Process each file sequentially to avoid race conditions
        for (const file of files) {
          // Determine if file is text or binary based on extension list
          const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
          const isTextFile = TEXT_FILE_EXTENSIONS.includes(ext);

          let content: string;
          if (isTextFile) {
            content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsText(file);
            });
          } else {
            content = "[Binary file content]";
          }

          // Create file item with unique ID
          newFiles.push({
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            type: "file",
            size: file.size,
            content,
          });
        }

        // delegate to shared store
        addItems(currentPath, newFiles);
        toast.success(`${newFiles.length} file(s) uploaded`);
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error("Failed to upload files");
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

    addItems(currentPath, [newItem]);
    toast.success(`${type === "folder" ? "Folder" : "File"} created`);

    setNewItemName("");
    setShowNewItemDialog(false);
  };

  // Rename item
  const renameItem = (itemId: string, newName: string) => {
    if (!newName.trim() || !isAuthenticated) return;

    renameItemStore(currentPath, itemId, newName.trim());
    toast.success("Item renamed");

    setShowRenameDialog(null);
    setNewItemName("");
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    if (!isAuthenticated) return;

    // Check if this is a shadow file (system file)
    const itemToDelete = currentFolder?.children?.find(
      (item) => item.id === itemId
    );

    // List of protected files that came from shadow fs
    const protectedFiles = [
      "test.md",
      "test.txt",
      "package.json",
      "package-lock.json",
      ".vfsignore",
    ];

    if (itemToDelete && protectedFiles.includes(itemToDelete.name)) {
      toast.error(`Cannot delete system file: ${itemToDelete.name}`, {
        description:
          "Files loaded from the shadow filesystem are protected and cannot be deleted.",
      });
      return;
    }

    deleteItemStore(currentPath, itemId);
    toast.success("Item deleted");

    setSelectedItems(new Set());
    setShowContextMenu(null);
  };

  // Create desktop shortcut
  const createShortcut = (itemId: string) => {
    if (!isAuthenticated) return;

    const currentItem = currentFolder?.children?.find(
      (item) => item.id === itemId
    );

    if (!currentItem) return;

    try {
      // Get the Desktop folder to check existing items
      const desktopPath = ["root", "Desktop"];
      const desktopFolder = findItemByPath(desktopPath);
      const existingItems = desktopFolder?.children || [];

      let shortcutFile: FileSystemItem;

      if (currentItem.type === "file") {
        // Create file shortcut
        shortcutFile = createFileShortcut(
          currentItem.name,
          currentItem.id,
          currentItem.name.replace(/\.[^/.]+$/, "") // Remove extension for display name
        );
      } else {
        // Create folder shortcut
        shortcutFile = createDesktopShortcut(
          currentItem.id,
          currentItem.name,
          `Open ${currentItem.name} folder`
        );
      }

      // Generate unique name for the shortcut
      const uniqueName = generateUniqueFileName(
        shortcutFile.name,
        existingItems
      );
      shortcutFile.name = uniqueName;

      // Add to Desktop folder
      addItems(desktopPath, [shortcutFile]);

      const displayName = uniqueName.replace(".json", ""); // Remove .json for display
      toast.success(`Desktop shortcut created: ${displayName}`);

      setShowContextMenu(null);
    } catch (error) {
      console.error("Error creating desktop shortcut:", error);
      toast.error("Failed to create desktop shortcut");
    }
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

    // Set up data transfer for different drag targets
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.setData(
      "application/vfs-item",
      JSON.stringify({
        itemId,
        currentPath,
        action: "copy",
      })
    );
    e.dataTransfer.effectAllowed = "copyMove";

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

    // Don't allow dropping into itself
    if (draggedItem === targetFolderId) return;

    // Resolve paths
    const targetFolderPath = findFolderPath(fileSystem, targetFolderId);
    if (!targetFolderPath) return;

    // Check if we're dropping into the Desktop folder
    const isDroppingToDesktop =
      targetFolderId === "Desktop" ||
      targetFolderPath.includes("Desktop") ||
      targetFolderPath[targetFolderPath.length - 1] === "Desktop";

    // Get the dragged item
    const draggedItemObj = currentFolder?.children?.find(
      (item) => item.id === draggedItem
    );

    // List of protected files that came from shadow fs
    const protectedFiles = [
      "test.md",
      "test.txt",
      "package.json",
      "package-lock.json",
      ".vfsignore",
    ];

    // Check if trying to move a protected file (not to Desktop, which is a copy operation)
    if (
      !isDroppingToDesktop &&
      draggedItemObj &&
      protectedFiles.includes(draggedItemObj.name)
    ) {
      toast.error(`Cannot move system file: ${draggedItemObj.name}`, {
        description:
          "Files loaded from the shadow filesystem are protected and cannot be moved. You can copy them to Desktop instead.",
      });
      return;
    }

    if (isDroppingToDesktop) {
      // Handle Desktop drops with unique naming
      const currentItem = currentFolder?.children?.find(
        (item) => item.id === draggedItem
      );
      if (currentItem) {
        // Get the target Desktop folder to check existing items
        const targetFolder = findItemByPath(targetFolderPath);
        const existingItems = targetFolder?.children || [];

        // Create a copy with unique naming
        const uniqueItem = createDesktopCopyWithUniqueName(
          currentItem,
          existingItems
        );

        // Add the item to Desktop folder
        addItems(targetFolderPath, [uniqueItem]);

        console.log(
          `[FileExplorer] Copied ${currentItem.name} to Desktop as ${uniqueItem.name}`
        );
        toast.success(`Copied to Desktop as ${uniqueItem.name}`);
      }
    } else {
      // For non-Desktop folders, use the existing move logic
      moveItem(currentPath, draggedItem, targetFolderPath);
    }

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
      {/* Title Bar
      <TitleBar
        isAuthenticated={isAuthenticated}
        user={user}
        handleGithubAuth={handleGithubAuth}
        handleLogout={handleLogout}
      /> */}

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
          className={`flex-1 p-6 overflow-y-auto bg-white transition-colors duration-200 relative border-2 border-dashed ${
            isDragActive ? "border-blue-400 bg-blue-50" : "border-transparent"
          }`}
          onDragEnter={handleDragEnter}
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
                  openFile={openFile}
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

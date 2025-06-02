import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  DesktopShortcut,
  FileSystemItem,
} from "@/plugins/apps/file-explorer/types/fileSystem";
import {
  createDesktopCopy,
  getAppForFileExtension,
  getFileIcon,
} from "@/plugins/apps/file-explorer/utils/fileUtils";
import { eventBus } from "@/plugins/EventBus";
import { useFileSystemStore } from "@/store/fileSystem";
import { getAppLaunchUrl } from "@/utils/url";

import { usePlugins } from "../plugins/PluginContext";

interface DesktopIconsProps {
  openWindow: (id: string, initFromUrl?: string) => void;
}

interface ProcessedDesktopItem {
  id: string;
  name: string;
  displayName: string;
  displayIcon: React.ReactNode;
  isShortcut: boolean;
  shortcut?: DesktopShortcut;
  originalItem: FileSystemItem;
}

const DesktopIcons: React.FC<DesktopIconsProps> = ({ openWindow }) => {
  //console.log("%c[DesktopIcons] Re-rendered", "color: orange");
  const [showIcons, setShowIcons] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: ProcessedDesktopItem;
    visible: boolean;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Get plugin manager and file system
  const { loadedPlugins } = usePlugins();
  const fileSystem = useFileSystemStore((state) => state.fs);
  const initFileSystem = useFileSystemStore((state) => state.init);
  const forceReload = useFileSystemStore((state) => state.forceReload);
  const addItems = useFileSystemStore((state) => state.addItems);
  const deleteItem = useFileSystemStore((state) => state.deleteItem);

  // Initialize VFS on mount
  useEffect(() => {
    const initVFS = async () => {
      console.log("[DesktopIcons] Initializing VFS...");
      await initFileSystem();

      // Check if Desktop folder exists, if not create it
      const currentFs = useFileSystemStore.getState().fs;
      const hasDesktop = currentFs.children?.some(
        (item) =>
          (item.id === "Desktop" || item.id === "desktop") &&
          item.type === "folder"
      );

      if (!hasDesktop) {
        console.log("[DesktopIcons] Desktop folder not found, creating it...");
        const desktopFolder: FileSystemItem = {
          id: "Desktop",
          name: "Desktop",
          type: "folder",
          children: [],
        };
        addItems(["root"], [desktopFolder]);
      }

      console.log("[DesktopIcons] VFS initialized");
    };
    initVFS();
  }, [initFileSystem, addItems]);

  // Listen for VFS changes that affect the Desktop folder
  useEffect(() => {
    const handleVFSChange = () => {
      console.log(
        "[DesktopIcons] VFS change detected, refreshing desktop icons"
      );
      setRefreshTrigger((prev) => prev + 1);
    };

    // Helper function to check if path includes desktop (case-insensitive)
    const pathIncludesDesktop = (path: string[]) => {
      return path.some(
        (segment) =>
          segment.toLowerCase() === "desktop" ||
          segment.toLowerCase().includes("desktop")
      );
    };

    // Listen for file system changes
    const unsubscribeAdd = eventBus.subscribe(
      "vfs:itemsAdded",
      (data: { path: string[] }) => {
        console.log("[DesktopIcons] VFS items added to path:", data.path);
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeDelete = eventBus.subscribe(
      "vfs:itemDeleted",
      (data: { path: string[] }) => {
        console.log("[DesktopIcons] VFS item deleted from path:", data.path);
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeRename = eventBus.subscribe(
      "vfs:itemRenamed",
      (data: { path: string[] }) => {
        console.log("[DesktopIcons] VFS item renamed in path:", data.path);
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeMove = eventBus.subscribe(
      "vfs:itemMoved",
      (data: { fromPath: string[]; toPath: string[] }) => {
        console.log(
          "[DesktopIcons] VFS item moved from:",
          data.fromPath,
          "to:",
          data.toPath
        );
        if (
          pathIncludesDesktop(data.fromPath) ||
          pathIncludesDesktop(data.toPath)
        ) {
          handleVFSChange();
        }
      }
    );

    return () => {
      unsubscribeAdd();
      unsubscribeDelete();
      unsubscribeRename();
      unsubscribeMove();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("[DesktopIcons] FileSystem state:", fileSystem);
    console.log(
      "[DesktopIcons] Available folders:",
      fileSystem.children
        ?.filter((item) => item.type === "folder")
        .map((f) => ({ id: f.id, name: f.name }))
    );

    const desktop = fileSystem.children?.find(
      (item) =>
        (item.id === "desktop" || item.id === "Desktop") &&
        item.type === "folder"
    );
    console.log("[DesktopIcons] Desktop folder found by ID:", desktop);

    if (!desktop) {
      const desktopByName = fileSystem.children?.find(
        (item) =>
          (item.name === "desktop" || item.name === "Desktop") &&
          item.type === "folder"
      );
      console.log(
        "[DesktopIcons] Desktop folder found by name:",
        desktopByName
      );
    }
  }, [fileSystem, refreshTrigger]);

  // Find Desktop folder in VFS
  const desktopFolder = useMemo(() => {
    console.log(
      "[DesktopIcons] Searching for Desktop folder, refreshTrigger:",
      refreshTrigger
    );
    console.log(
      "[DesktopIcons] FileSystem children IDs:",
      fileSystem.children?.map((c) => c.id)
    );

    // Try "Desktop" with capital D first (this is what VFS events use)
    let folder = fileSystem.children?.find(
      (item) => item.id === "Desktop" && item.type === "folder"
    );

    if (!folder) {
      // Try lowercase as fallback
      folder = fileSystem.children?.find(
        (item) => item.id === "desktop" && item.type === "folder"
      );
    }

    if (!folder) {
      // Also try by name instead of id
      folder = fileSystem.children?.find(
        (item) =>
          (item.name === "Desktop" || item.name === "desktop") &&
          item.type === "folder"
      );
    }

    console.log("[DesktopIcons] Desktop folder search result:", folder);
    return folder;
  }, [fileSystem, refreshTrigger]);

  // Get desktop items (files and folders in /Desktop)
  const desktopItems = useMemo(() => {
    const items = desktopFolder?.children || [];
    console.log("[DesktopIcons] Desktop folder:", desktopFolder);
    console.log("[DesktopIcons] Raw desktop items count:", items.length);
    console.log(
      "[DesktopIcons] Raw desktop items:",
      items.map((item) => ({ id: item.id, name: item.name, type: item.type }))
    );
    return items;
  }, [desktopFolder, refreshTrigger]);

  // Helper function to get shortcut icon
  const getShortcutIcon = (shortcut: DesktopShortcut): React.ReactNode => {
    if (shortcut.iconType === "plugin" && shortcut.icon) {
      // Get icon from plugin manifest
      const plugin = loadedPlugins.find((p) => p.id === shortcut.icon);
      return plugin?.manifest.icon || getDefaultIcon(shortcut.name);
    } else if (shortcut.iconType === "url" && shortcut.icon) {
      // Use image URL
      return (
        <img src={shortcut.icon} className="w-8 h-8" alt={shortcut.name} />
      );
    } else if (shortcut.iconType === "file" && shortcut.icon) {
      // Use file from public folder or VFS
      const iconSrc = shortcut.icon.startsWith("/")
        ? shortcut.icon
        : `/icons/${shortcut.icon}`;
      return <img src={iconSrc} className="w-8 h-8" alt={shortcut.name} />;
    } else {
      return getDefaultIcon(shortcut.name);
    }
  };

  const getDefaultIcon = (name: string) => (
    <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
      {name.charAt(0).toUpperCase()}
    </div>
  );

  // Parse and process desktop items
  const processedItems = useMemo((): ProcessedDesktopItem[] => {
    console.log(
      "[DesktopIcons] Processing",
      desktopItems.length,
      "desktop items"
    );

    const items = desktopItems.map((item) => {
      if (item.type === "file" && item.name.endsWith(".json")) {
        // Try to parse as shortcut manifest
        try {
          const shortcut: DesktopShortcut = JSON.parse(item.content || "{}");
          console.log("[DesktopIcons] Parsed shortcut:", shortcut);
          return {
            id: item.id,
            name: item.name,
            displayName: shortcut.name,
            displayIcon: getShortcutIcon(shortcut),
            isShortcut: true,
            shortcut,
            originalItem: item,
          };
        } catch (error) {
          console.warn(`Failed to parse shortcut ${item.name}:`, error);
          return {
            id: item.id,
            name: item.name,
            displayName: item.name,
            displayIcon: getFileIcon(item),
            isShortcut: false,
            originalItem: item,
          };
        }
      } else {
        // Regular file or .exe folder
        console.log(
          "[DesktopIcons] Processing regular item:",
          item.name,
          item.type
        );
        return {
          id: item.id,
          name: item.name,
          displayName: item.name,
          displayIcon: getFileIcon(item),
          isShortcut: false,
          originalItem: item,
        };
      }
    });

    console.log("[DesktopIcons] Final processed items count:", items.length);
    return items;
  }, [desktopItems, loadedPlugins, refreshTrigger]);

  // Handle double-click on desktop items
  const handleItemDoubleClick = async (item: ProcessedDesktopItem) => {
    if (item.isShortcut && item.shortcut) {
      const shortcut = item.shortcut;

      if (shortcut.target.startsWith("vfs://")) {
        // Open file from VFS
        const appId = getAppForFileExtension(
          shortcut.target.replace("vfs://", "")
        );
        openWindow(appId || "file-explorer", shortcut.target);
      } else {
        // Open plugin/app
        const initUrl = shortcut.args
          ? `data:${JSON.stringify(shortcut.args)}`
          : undefined;
        openWindow(shortcut.target, initUrl);
      }
    } else if (
      item.originalItem.type === "folder" &&
      item.originalItem.name.endsWith(".exe")
    ) {
      // .exe folder - open with app-preview
      const appPath = `app://PublishedApps/${item.originalItem.name}`;
      openWindow("app-preview", appPath);
    } else if (item.originalItem.type === "file") {
      // Regular file - open with appropriate app
      const vfsPath = `vfs://${item.originalItem.id}`;
      const appId = getAppForFileExtension(item.originalItem.name);
      if (appId) {
        openWindow(appId, vfsPath);
      }
    } else if (item.originalItem.type === "folder") {
      // Regular folder - open file explorer
      openWindow("file-explorer", `vfs://${item.originalItem.id}`);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if desktop icons should be visible
  useEffect(() => {
    const checkShowIconsSettings = () => {
      // Default to true if setting doesn't exist
      const shouldShowIcons =
        localStorage.getItem("show-desktop-icons") !== "false";
      setShowIcons(shouldShowIcons);
    };

    // Initial check
    checkShowIconsSettings();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "show-desktop-icons") {
        setShowIcons(e.newValue !== "false");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check the document's custom property for visibility changes
    const observeVisibilityProperty = () => {
      const visibilityValue = getComputedStyle(document.documentElement)
        .getPropertyValue("--desktop-icons-visibility")
        .trim();
      setShowIcons(visibilityValue !== "hidden");
    };

    // Create a MutationObserver to watch for style attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "style") {
          observeVisibilityProperty();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Handle context menu
  const handleContextMenu = (
    e: React.MouseEvent,
    item: ProcessedDesktopItem
  ) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      visible: true,
    });
  };

  // Copy app launch URL (for shortcuts only)
  const copyAppLaunchUrl = (item: ProcessedDesktopItem) => {
    if (item.isShortcut && item.shortcut) {
      const url = getAppLaunchUrl(item.shortcut.target);
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log(`URL copied: ${url}`);
        })
        .catch((err) => {
          console.error("Could not copy URL: ", err);
        });
    }
    setContextMenu(null);
  };

  // Delete item from desktop
  const deleteFromDesktop = (item: ProcessedDesktopItem) => {
    // Determine the correct Desktop path
    const desktopPath =
      desktopFolder?.id === "Desktop"
        ? ["root", "Desktop"]
        : ["root", "desktop"];
    console.log(
      "[DesktopIcons] Deleting item using desktop path:",
      desktopPath
    );

    deleteItem(desktopPath, item.id);
    console.log(`[DesktopIcons] Deleted ${item.displayName} from desktop`);
    setContextMenu(null);
  };

  // Drag and drop handlers for desktop area
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[DesktopIcons] Drag enter detected");
    console.log(
      "[DesktopIcons] Drag enter - DataTransfer types:",
      e.dataTransfer.types
    );
    console.log(
      "[DesktopIcons] Drag enter - effectAllowed:",
      e.dataTransfer.effectAllowed
    );
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("[DesktopIcons] Drag over detected");
    console.log(
      "[DesktopIcons] Drag over - effectAllowed:",
      e.dataTransfer.effectAllowed
    );

    // Match the dropEffect to the effectAllowed from the source
    if (e.dataTransfer.effectAllowed === "move") {
      e.dataTransfer.dropEffect = "move";
    } else if (e.dataTransfer.effectAllowed === "copy") {
      e.dataTransfer.dropEffect = "copy";
    } else if (e.dataTransfer.effectAllowed === "copyMove") {
      e.dataTransfer.dropEffect = "copy"; // Prefer copy for copyMove
    } else {
      e.dataTransfer.dropEffect = "copy"; // Default fallback
    }

    console.log(
      "[DesktopIcons] Drag over - dropEffect set to:",
      e.dataTransfer.dropEffect
    );

    // Keep drag state active
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set isDragOver to false if we're leaving the desktop area entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      console.log("[DesktopIcons] Drag leave - exiting desktop area");
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    console.log("[DesktopIcons] Drop event detected");
    console.log("[DesktopIcons] DataTransfer types:", e.dataTransfer.types);
    console.log("[DesktopIcons] Files count:", e.dataTransfer.files.length);

    // Debug: Try to access all possible data types
    console.log(
      "[DesktopIcons] Trying to get text/plain:",
      e.dataTransfer.getData("text/plain")
    );
    console.log(
      "[DesktopIcons] Trying to get application/vfs-item:",
      e.dataTransfer.getData("application/vfs-item")
    );

    // Check all available types
    for (let i = 0; i < e.dataTransfer.types.length; i++) {
      const type = e.dataTransfer.types[i];
      const data = e.dataTransfer.getData(type);
      console.log(`[DesktopIcons] DataTransfer[${type}]:`, data);
    }

    // Determine the correct Desktop path
    const desktopPath =
      desktopFolder?.id === "Desktop"
        ? ["root", "Desktop"]
        : ["root", "desktop"];
    console.log("[DesktopIcons] Using desktop path:", desktopPath);

    // Handle internal drag from file explorer first
    const vfsItemData = e.dataTransfer.getData("application/vfs-item");
    if (vfsItemData) {
      try {
        const dragData = JSON.parse(vfsItemData);
        console.log("[DesktopIcons] Internal VFS drag detected:", dragData);

        // Find the dragged item in the VFS
        const findItemByPath = (
          fs: FileSystemItem,
          path: string[],
          itemId: string
        ): FileSystemItem | null => {
          let current = fs;
          for (let i = 1; i < path.length; i++) {
            current =
              current.children?.find((child) => child.id === path[i]) ||
              current;
          }
          return current.children?.find((child) => child.id === itemId) || null;
        };

        const draggedItem = findItemByPath(
          fileSystem,
          dragData.currentPath,
          dragData.itemId
        );
        if (draggedItem) {
          // Create a copy of the item for the desktop
          const desktopItem = createDesktopCopy(draggedItem);

          // Add to Desktop folder using correct path
          addItems(desktopPath, [desktopItem]);
          console.log(
            `[DesktopIcons] Copied ${draggedItem.name} to desktop using path:`,
            desktopPath
          );
        } else {
          console.error("[DesktopIcons] Could not find dragged item in VFS");
        }
      } catch (error) {
        console.error("[DesktopIcons] Error parsing VFS drag data:", error);
      }
      return;
    }

    // Try to get text/plain as fallback for internal drags
    const textData = e.dataTransfer.getData("text/plain");
    if (textData && textData !== "") {
      console.log(
        "[DesktopIcons] Found text/plain data, trying as item ID:",
        textData
      );

      // Try to find item by ID in current file system
      const findItemById = (
        fs: FileSystemItem,
        id: string
      ): { item: FileSystemItem; path: string[] } | null => {
        if (fs.id === id) {
          return { item: fs, path: ["root"] };
        }

        if (fs.children) {
          for (const child of fs.children) {
            if (child.id === id) {
              return { item: child, path: ["root", fs.id] };
            }

            // Recursively search in child folders
            if (child.type === "folder") {
              const result = findItemById(child, id);
              if (result) {
                return {
                  item: result.item,
                  path: ["root", fs.id, ...result.path.slice(1)],
                };
              }
            }
          }
        }

        return null;
      };

      const found = findItemById(fileSystem, textData);
      if (found) {
        console.log(
          "[DesktopIcons] Found item by text ID:",
          found.item.name,
          "at path:",
          found.path
        );
        const desktopItem = createDesktopCopy(found.item);
        addItems(desktopPath, [desktopItem]);
        console.log(
          `[DesktopIcons] Copied ${found.item.name} to desktop using fallback method`
        );
        return;
      }
    }

    // Handle external file drops
    const files = Array.from(e.dataTransfer.files);
    console.log("[DesktopIcons] External files detected:", files.length);

    if (files.length > 0) {
      try {
        // Process external files dropped onto desktop
        const newFiles: FileSystemItem[] = [];

        for (const file of files) {
          console.log(
            "[DesktopIcons] Processing file:",
            file.name,
            file.type,
            file.size
          );

          let content: string;

          // Determine if it's a text file or binary
          if (
            file.type.startsWith("text/") ||
            [".txt", ".json", ".md", ".js", ".css", ".html", ".xml"].some(
              (ext) => file.name.toLowerCase().endsWith(ext)
            )
          ) {
            content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => reject(reader.error);
              reader.readAsText(file);
            });
          } else {
            // For binary files, just store a placeholder
            content = "[Binary file content]";
          }

          newFiles.push({
            id: `desktop_file_${Date.now()}_${Math.random()
              .toString(36)
              .slice(2, 9)}`,
            name: file.name,
            type: "file",
            size: file.size,
            content,
          });
        }

        // Add files directly to Desktop folder using correct path
        addItems(desktopPath, newFiles);
        console.log(
          `[DesktopIcons] Added ${newFiles.length} file(s) to desktop using path:`,
          desktopPath
        );
      } catch (error) {
        console.error("[DesktopIcons] Error handling dropped files:", error);
      }
    } else {
      console.log("[DesktopIcons] No files or VFS data found in drop event");
    }
  };

  // Force refresh handler for debugging
  const handleForceRefresh = async () => {
    console.log("[DesktopIcons] Force refreshing VFS...");
    await forceReload();
    setRefreshTrigger((prev) => prev + 1);
    console.log("[DesktopIcons] VFS force refreshed");
  };

  // Create default desktop shortcuts
  const createDefaultShortcuts = () => {
    console.log("[DesktopIcons] Creating default desktop shortcuts...");

    const shortcuts = [
      {
        name: "File Explorer",
        description: "Browse files and folders",
        target: "file-explorer",
        iconType: "plugin",
        icon: "file-explorer",
      },
      {
        name: "Notepad",
        description: "Simple text editor",
        target: "notepad",
        iconType: "plugin",
        icon: "notepad",
      },
      {
        name: "Calculator",
        description: "Perform calculations",
        target: "calculator",
        iconType: "plugin",
        icon: "calculator",
      },
      {
        name: "Browser",
        description: "Browse the web",
        target: "browser",
        iconType: "plugin",
        icon: "browser",
      },
    ];

    const shortcutFiles = shortcuts.map((shortcut, index) => ({
      id: `default_shortcut_${index}_${Date.now()}`,
      name: `${shortcut.name}.json`,
      type: "file" as const,
      content: JSON.stringify(shortcut, null, 2),
      size: JSON.stringify(shortcut, null, 2).length,
    }));

    addItems(["root", "Desktop"], shortcutFiles);
    console.log(
      "[DesktopIcons] Created",
      shortcutFiles.length,
      "default shortcuts"
    );
  };

  // Test function to create a test file directly
  const createTestFile = () => {
    console.log("[DesktopIcons] Creating test file...");
    const desktopPath =
      desktopFolder?.id === "Desktop"
        ? ["root", "Desktop"]
        : ["root", "desktop"];

    const testFile: FileSystemItem = {
      id: `test_file_${Date.now()}`,
      name: "test-drag-drop.txt",
      type: "file",
      size: 25,
      content: "This is a test file!",
    };

    addItems(desktopPath, [testFile]);
    console.log("[DesktopIcons] Created test file using path:", desktopPath);
  };

  // Mouse event handlers for debugging
  const handleMouseEnter = () => {
    console.log("[DesktopIcons] Mouse entered desktop area");
  };

  const handleMouseLeave = () => {
    console.log("[DesktopIcons] Mouse left desktop area");
  };

  // If icons should be hidden, don't render anything
  if (!showIcons) {
    console.log("[DesktopIcons] Icons are hidden, not rendering");
    return null;
  }

  console.log(
    "[DesktopIcons] About to render desktop with",
    processedItems.length,
    "items"
  );
  console.log("[DesktopIcons] Desktop folder exists:", !!desktopFolder);
  console.log("[DesktopIcons] Processed items:", processedItems);

  return (
    <div
      className={`desktop-icons ${isDragOver ? "drag-over" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundColor: isDragOver ? "rgba(59, 130, 246, 0.1)" : "transparent",
        border: isDragOver ? "2px dashed #3b82f6" : "2px dashed transparent",
        transition: "all 0.2s ease-in-out",
        // Ensure the drop zone is active and properly sized
        minHeight: "100%",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Explicit drop zone overlay when dragging */}
      {isDragOver && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "2px dashed #3b82f6",
          }}
        >
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Drop files here to add to Desktop
          </div>
        </div>
      )}

      {/* Debug element to show that the component is rendering */}
      {processedItems.length === 0 && (
        <div className="absolute top-4 left-4 bg-yellow-200 text-black p-4 rounded text-sm z-20">
          <div>
            Desktop: {desktopFolder ? "Found" : "Not Found"} | Items:{" "}
            {processedItems.length}
          </div>
          <div>
            All Folders:{" "}
            {fileSystem.children
              ?.filter((item) => item.type === "folder")
              .map((f) => f.id)
              .join(", ")}
          </div>
          <div className="mt-2 space-x-2">
            <button
              onClick={handleForceRefresh}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Force Refresh VFS
            </button>
            <button
              onClick={createDefaultShortcuts}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs"
            >
              Create Shortcuts
            </button>
            <button
              onClick={createTestFile}
              className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
            >
              Create Test File
            </button>
          </div>
        </div>
      )}

      {processedItems.map((item) => (
        <div
          key={item.id}
          className="desktop-icon"
          onDoubleClick={() => handleItemDoubleClick(item)}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => handleContextMenu(e, item)}
          title={
            item.isShortcut ? item.shortcut?.description : item.displayName
          }
        >
          {item.displayIcon}
          <div className="desktop-icon-label">{item.displayName}</div>
        </div>
      ))}

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div
          ref={menuRef}
          className="absolute bg-white shadow-md rounded-md py-1 z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              handleItemDoubleClick(contextMenu.item);
              setContextMenu(null);
            }}
          >
            Open
          </div>
          {contextMenu.item.isShortcut && (
            <div
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => copyAppLaunchUrl(contextMenu.item)}
            >
              Copy Launch URL
            </div>
          )}
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => {
              // Open file explorer to the Desktop folder
              openWindow("file-explorer", "vfs://desktop");
              setContextMenu(null);
            }}
          >
            Open Desktop Folder
          </div>
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            onClick={() => deleteFromDesktop(contextMenu.item)}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

function areEqual(prev: DesktopIconsProps, next: DesktopIconsProps): boolean {
  // Only compare the openWindow callback now
  return prev.openWindow === next.openWindow;
}

export default React.memo(DesktopIcons, areEqual);

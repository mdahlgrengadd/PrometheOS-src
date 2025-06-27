import React, { useEffect, useMemo, useState } from "react";

import { eventBus } from "../../../../api/core/EventBus";
import { useFileSystemStore } from "../../../../store/fileSystem";
import { usePlugins } from "../../../PluginContext";
import {
  DesktopShortcut,
  FileSystemItem,
} from "../../file-explorer/types/fileSystem";
import { DesktopIconData } from "../data/iconData";
import { getIconPathForTitle } from "../utils/iconMapper";

interface VFSDesktopItem extends DesktopIconData {
  id: string;
  isShortcut: boolean;
  shortcut?: DesktopShortcut;
  originalItem: FileSystemItem;
  pluginId?: string;
}

/**
 * Hook to integrate VFS /Desktop folder reading into the 3D desktop system
 * Similar to how the old desktop system works, but adapted for 3D desktop data structure
 */
export const useVFSDesktopIcons = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get plugin manager and file system
  const { loadedPlugins } = usePlugins();
  const fileSystem = useFileSystemStore((state) => state.fs);
  const initFileSystem = useFileSystemStore((state) => state.init);
  const addItems = useFileSystemStore((state) => state.addItems);

  // Initialize VFS on mount
  useEffect(() => {
    const initVFS = async () => {
      console.log("[useVFSDesktopIcons] Initializing VFS...");
      await initFileSystem();

      // Check if Desktop folder exists, if not create it
      const currentFs = useFileSystemStore.getState().fs;
      const hasDesktop = currentFs.children?.some(
        (item) =>
          (item.id === "Desktop" || item.id === "desktop") &&
          item.type === "folder"
      );

      if (!hasDesktop) {
        console.log(
          "[useVFSDesktopIcons] Desktop folder not found, creating it..."
        );
        const desktopFolder: FileSystemItem = {
          id: "Desktop",
          name: "Desktop",
          type: "folder",
          children: [],
        };
        addItems(["root"], [desktopFolder]);
      }

      console.log("[useVFSDesktopIcons] VFS initialized");
    };
    initVFS();
  }, [initFileSystem, addItems]);

  // Listen for VFS changes that affect the Desktop folder
  useEffect(() => {
    const handleVFSChange = () => {
      console.log(
        "[useVFSDesktopIcons] VFS change detected, refreshing desktop icons"
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
        console.log("[useVFSDesktopIcons] VFS items added to path:", data.path);
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeDelete = eventBus.subscribe(
      "vfs:itemDeleted",
      (data: { path: string[] }) => {
        console.log(
          "[useVFSDesktopIcons] VFS item deleted from path:",
          data.path
        );
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeRename = eventBus.subscribe(
      "vfs:itemRenamed",
      (data: { path: string[] }) => {
        console.log(
          "[useVFSDesktopIcons] VFS item renamed in path:",
          data.path
        );
        if (pathIncludesDesktop(data.path)) {
          handleVFSChange();
        }
      }
    );

    const unsubscribeMove = eventBus.subscribe(
      "vfs:itemMoved",
      (data: { fromPath: string[]; toPath: string[] }) => {
        console.log(
          "[useVFSDesktopIcons] VFS item moved from:",
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

  // Find Desktop folder in VFS
  const desktopFolder = useMemo(() => {
    console.log(
      "[useVFSDesktopIcons] Searching for Desktop folder, refreshTrigger:",
      refreshTrigger
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

    console.log("[useVFSDesktopIcons] Desktop folder search result:", folder);
    return folder;
  }, [fileSystem, refreshTrigger]);

  // Get desktop items (files and folders in /Desktop)
  const desktopItems = useMemo(() => {
    const items = desktopFolder?.children || [];
    console.log("[useVFSDesktopIcons] Desktop folder:", desktopFolder);
    console.log("[useVFSDesktopIcons] Raw desktop items count:", items.length);
    return items;
  }, [desktopFolder, refreshTrigger]);

  // Parse and process desktop items into 3D desktop format
  const vfsDesktopIcons = useMemo((): VFSDesktopItem[] => {
    console.log(
      "[useVFSDesktopIcons] Processing",
      desktopItems.length,
      "desktop items"
    );

    const items = desktopItems.map((item, index) => {
      // Calculate grid position (similar to original iconData pattern)
      const col = (index % 5) + 1;
      const row = Math.floor(index / 5) + 1;

      if (item.type === "file" && item.name.endsWith(".json")) {
        // Try to parse as shortcut manifest
        try {
          const shortcut: DesktopShortcut = JSON.parse(item.content || "{}");
          console.log("[useVFSDesktopIcons] Parsed shortcut:", shortcut);

          // Get plugin ID if this is a plugin shortcut
          const pluginId = shortcut.target.startsWith("vfs://")
            ? undefined
            : shortcut.target;

          // Create a stable icon identifier that doesn't depend on loadedPlugins
          let iconIdentifier = shortcut.name;
          if (shortcut.iconType === "plugin" && shortcut.icon) {
            // Use the plugin ID directly instead of looking up the loaded plugin
            iconIdentifier = shortcut.icon;
          }

          return {
            id: item.id,
            title: shortcut.name,
            description: shortcut.description || `Launch ${shortcut.name}`,
            stat: "1.0",
            gridCoord: [col, row] as [number, number],
            iconPath: getIconPathForTitle(iconIdentifier),
            isShortcut: true,
            shortcut,
            originalItem: item,
            pluginId: pluginId,
          };
        } catch (error) {
          console.warn(`Failed to parse shortcut ${item.name}:`, error);
          return {
            id: item.id,
            title: item.name.replace(".json", ""),
            description: `File: ${item.name}`,
            stat: "1.0",
            gridCoord: [col, row] as [number, number],
            iconPath: getIconPathForTitle(item.name),
            isShortcut: false,
            originalItem: item,
          };
        }
      } else {
        // Regular file or .exe folder
        console.log(
          "[useVFSDesktopIcons] Processing regular item:",
          item.name,
          item.type
        );

        const title =
          item.type === "folder" && item.name.endsWith(".exe")
            ? item.name.replace(".exe", "")
            : item.name;

        return {
          id: item.id,
          title: title,
          description:
            item.type === "folder"
              ? `Folder: ${item.name}`
              : `File: ${item.name}`,
          stat: "1.0",
          gridCoord: [col, row] as [number, number],
          iconPath: getIconPathForTitle(title),
          isShortcut: false,
          originalItem: item,
        };
      }
    });

    console.log(
      "[useVFSDesktopIcons] Final processed items count:",
      items.length
    );
    return items;
  }, [desktopItems, refreshTrigger]); // Removed loadedPlugins dependency to prevent unnecessary re-renders

  return {
    vfsDesktopIcons,
    desktopFolder,
    refreshTrigger,
  };
};

import { Copy, ExternalLink, FileText, Trash2 } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

import { useFileSystemStore } from '../../../../store/fileSystem';
import { getAppLaunchUrl } from '../../../../utils/url';
import { DesktopShortcut, FileSystemItem } from '../../file-explorer/types/fileSystem';

interface VFSDesktopItem {
  id: string;
  title: string;
  description: string;
  stat: string;
  gridCoord: [number, number];
  iconPath?: string;
  isShortcut: boolean;
  shortcut?: DesktopShortcut;
  originalItem: FileSystemItem;
  pluginId?: string;
}

interface DesktopContextMenuProps {
  /** Menu position */
  x: number;
  y: number;
  /** Selected desktop item */
  item: VFSDesktopItem;
  /** Whether menu is visible */
  visible: boolean;
  /** Called when menu should close */
  onClose: () => void;
  /** Called when item should be opened */
  onOpen: (item: VFSDesktopItem) => void;
}

export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({
  x,
  y,
  item,
  visible,
  onClose,
  onOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteItem = useFileSystemStore((state) => state.deleteItem);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  const handleOpen = () => {
    onOpen(item);
    onClose();
  };

  const handleCopyUrl = () => {
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
    } else if (item.pluginId) {
      const url = getAppLaunchUrl(item.pluginId);
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log(`Plugin URL copied: ${url}`);
        })
        .catch((err) => {
          console.error("Could not copy URL: ", err);
        });
    }
    onClose();
  };

  const handleDelete = () => {
    // Determine the correct Desktop path
    const desktopPath = ["root", "Desktop"];

    deleteItem(desktopPath, item.id);
    console.log(`[DesktopContextMenu] Deleted ${item.title} from desktop`);
    onClose();
  };

  // Calculate menu position to keep it within viewport
  const menuStyle = {
    position: "fixed" as const,
    left: x,
    top: y,
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl py-2 min-w-48"
      style={menuStyle}
    >
      {/* Open */}
      <button
        onClick={handleOpen}
        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
      >
        <ExternalLink size={16} />
        Open
      </button>

      {/* Separator */}
      <div className="border-t border-white/10 my-1" />

      {/* Copy App Launch URL (only for shortcuts and plugins) */}
      {(item.isShortcut || item.pluginId) && (
        <button
          onClick={handleCopyUrl}
          className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
        >
          <Copy size={16} />
          Copy Launch URL
        </button>
      )}

      {/* Properties */}
      <button
        onClick={() => {
          // For now, just log the item properties
          console.log("Item properties:", item);
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
      >
        <FileText size={16} />
        Properties
      </button>

      {/* Separator */}
      <div className="border-t border-white/10 my-1" />

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-3 transition-colors"
      >
        <Trash2 size={16} />
        Delete from Desktop
      </button>
    </div>
  );
};

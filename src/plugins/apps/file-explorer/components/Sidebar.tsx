import { ChevronDown, ChevronRight, Download, Folder, Home } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import { ideSettings } from '../../builder/utils/esbuild-settings';
import { FileSystemItem } from '../types/fileSystem';
import { getFileIcon } from '../utils/fileUtils';

interface SidebarProps {
  fileSystem: FileSystemItem;
  expandedFolders: Set<string>;
  selectedItems: Set<string>;
  navigateToQuickAccess: (folderId: string) => void;
  toggleFolder: (folderId: string) => void;
  setSelectedItems: (items: Set<string>) => void;
  handleFolderDragOver?: (folderId: string, e: React.DragEvent) => void;
  handleFolderDragLeave?: () => void;
  handleFolderDrop?: (folderId: string, e: React.DragEvent) => void;
  dragOverFolder?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  fileSystem,
  expandedFolders,
  selectedItems,
  navigateToQuickAccess,
  toggleFolder,
  setSelectedItems,
  handleFolderDragOver,
  handleFolderDragLeave,
  handleFolderDrop,
  dragOverFolder,
}) => {
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
      .split(/\r?\n/) // split lines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }, [ignoreFile]);
  const ignoreMatchers = useMemo(
    () =>
      ignorePatterns.map((pattern) => {
        const isDir = pattern.endsWith("/");
        const base = isDir ? pattern.slice(0, -1) : pattern;
        let regex = base
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\?/g, ".");
        if (isDir) regex = `${regex}(/.*)?`;
        return new RegExp(`^${regex}$`);
      }),
    [ignorePatterns]
  );

  // Filter and sort helper
  const filterAndSort = useCallback(
    (items: FileSystemItem[]) => {
      return items
        .filter((child) => {
          if (child.name === ".vfsignore") return false;
          if (!ideSettings.showHiddenFiles && child.name.startsWith("."))
            return false;
          if (ignoreMatchers.some((rx) => rx.test(child.id))) return false;
          return true;
        })
        .sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
    },
    [ignoreMatchers]
  );

  // Render tree item for sidebar navigation
  const renderTreeItem = (
    item: FileSystemItem,
    level: number = 0
  ): JSX.Element => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedItems.has(item.id);
    const hasChildren =
      item.type === "folder" && item.children && item.children.length > 0;
    const isHighlighted = dragOverFolder === item.id;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors ${
            isSelected ? "bg-blue-100 text-blue-700" : ""
          } ${isHighlighted ? "bg-blue-100 border-blue-400" : ""}`}
          style={{ paddingLeft: `${level * 20 + 4}px` }}
          onClick={() => {
            if (item.type === "folder") {
              toggleFolder(item.id);
              setSelectedItems(new Set([item.id]));
            }
          }}
          onDoubleClick={() => {
            if (item.type === "folder") {
              navigateToQuickAccess(item.id);
            }
          }}
          onDragOver={(e) =>
            item.type === "folder" &&
            handleFolderDragOver &&
            handleFolderDragOver(item.id, e)
          }
          onDragLeave={() =>
            item.type === "folder" &&
            handleFolderDragLeave &&
            handleFolderDragLeave()
          }
          onDrop={(e) =>
            item.type === "folder" &&
            handleFolderDrop &&
            handleFolderDrop(item.id, e)
          }
        >
          {item.type === "folder" && (
            <div className="w-4 h-4 flex items-center justify-center">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )
              ) : (
                <div className="w-3 h-3" />
              )}
            </div>
          )}
          {getFileIcon(item)}
          <span className="text-sm truncate flex-1">{item.name}</span>
        </div>
        {item.type === "folder" && isExpanded && item.children && (
          <div>
            {filterAndSort(item.children).map((child) =>
              renderTreeItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          Quick Access
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => navigateToQuickAccess("desktop")}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) =>
              handleFolderDragOver && handleFolderDragOver("desktop", e)
            }
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop("desktop", e)}
          >
            <Home className="w-4 h-4 text-blue-500" />
            Desktop
          </button>
          <button
            onClick={() => navigateToQuickAccess("documents")}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) =>
              handleFolderDragOver && handleFolderDragOver("documents", e)
            }
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop("documents", e)}
          >
            <Folder className="w-4 h-4 text-blue-500" />
            Documents
          </button>
          <button
            onClick={() => navigateToQuickAccess("downloads")}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) =>
              handleFolderDragOver && handleFolderDragOver("downloads", e)
            }
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop("downloads", e)}
          >
            <Download className="w-4 h-4 text-blue-500" />
            Downloads
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">This PC</h3>
        <div className="text-sm">{renderTreeItem(fileSystem)}</div>
      </div>
    </div>
  );
};

export default Sidebar;

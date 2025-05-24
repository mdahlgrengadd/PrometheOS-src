
import React from 'react';
import { Home, Folder, Download, ChevronDown, ChevronRight } from 'lucide-react';
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
  dragOverFolder
}) => {
  // Render tree item for sidebar navigation
  const renderTreeItem = (item: FileSystemItem, level: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedItems.has(item.id);
    const hasChildren = item.type === 'folder' && item.children && item.children.length > 0;
    const isHighlighted = dragOverFolder === item.id;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-100 text-blue-700' : ''
          } ${isHighlighted ? 'bg-blue-100 border-blue-400' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.id);
              setSelectedItems(new Set([item.id]));
            }
          }}
          onDoubleClick={() => {
            if (item.type === 'folder') {
              navigateToQuickAccess(item.id);
            }
          }}
          onDragOver={(e) => item.type === 'folder' && handleFolderDragOver && handleFolderDragOver(item.id, e)}
          onDragLeave={() => item.type === 'folder' && handleFolderDragLeave && handleFolderDragLeave()}
          onDrop={(e) => item.type === 'folder' && handleFolderDrop && handleFolderDrop(item.id, e)}
        >
          {item.type === 'folder' && (
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
        {item.type === 'folder' && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Access</h3>
        <div className="space-y-1">
          <button 
            onClick={() => navigateToQuickAccess('desktop')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) => handleFolderDragOver && handleFolderDragOver('desktop', e)}
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop('desktop', e)}
          >
            <Home className="w-4 h-4 text-blue-500" />
            Desktop
          </button>
          <button 
            onClick={() => navigateToQuickAccess('documents')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) => handleFolderDragOver && handleFolderDragOver('documents', e)}
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop('documents', e)}
          >
            <Folder className="w-4 h-4 text-blue-500" />
            Documents
          </button>
          <button 
            onClick={() => navigateToQuickAccess('downloads')}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-200 rounded text-left transition-colors"
            onDragOver={(e) => handleFolderDragOver && handleFolderDragOver('downloads', e)}
            onDragLeave={() => handleFolderDragLeave && handleFolderDragLeave()}
            onDrop={(e) => handleFolderDrop && handleFolderDrop('downloads', e)}
          >
            <Download className="w-4 h-4 text-blue-500" />
            Downloads
          </button>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">This PC</h3>
        <div className="text-sm">
          {renderTreeItem(fileSystem)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

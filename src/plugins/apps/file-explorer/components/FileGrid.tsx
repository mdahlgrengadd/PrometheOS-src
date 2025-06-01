
import React from 'react';
import { FileSystemItem } from '../types/fileSystem';
import { getFileIcon, formatSize } from '../utils/fileUtils';

interface FileGridProps {
  items: FileSystemItem[];
  selectedItems: Set<string>;
  setSelectedItems: (items: Set<string>) => void;
  navigateToFolder: (folderId: string) => void;
  setShowContextMenu: (menu: { x: number, y: number, itemId: string } | null) => void;
  handleDragStart?: (itemId: string, e: React.DragEvent) => void;
  handleFolderDragOver?: (folderId: string, e: React.DragEvent) => void;
  handleFolderDragLeave?: () => void;
  handleFolderDrop?: (folderId: string, e: React.DragEvent) => void;
  dragOverFolder?: string | null;
  selectionBox?: { top: number, left: number, width: number, height: number } | null;
  openFile?: (file: FileSystemItem) => Promise<void>;
}

const FileGrid: React.FC<FileGridProps> = ({
  items,
  selectedItems,
  setSelectedItems,
  navigateToFolder,
  setShowContextMenu,
  handleDragStart,
  handleFolderDragOver,
  handleFolderDragLeave,
  handleFolderDrop,
  dragOverFolder,
  selectionBox,
  openFile
}) => {
  return (
    <div
      className="mb-8"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '1rem',
        alignItems: 'start',
      }}
    >
      {items.map(item => (
        <div
          key={item.id}
          data-item-id={item.id}
          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 ${
            selectedItems.has(item.id) 
              ? 'bg-blue-50 border-blue-300 shadow-sm' 
              : 'border-gray-200'
          } ${dragOverFolder === item.id ? 'bg-blue-100 border-blue-400' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            
            // If ctrl/cmd is pressed, toggle selection
            if (e.ctrlKey || e.metaKey) {
              const updated = new Set(selectedItems);
              if (updated.has(item.id)) {
                updated.delete(item.id);
              } else {
                updated.add(item.id);
              }
              setSelectedItems(updated);
            } else if (e.shiftKey && selectedItems.size > 0) {
              // If shift is pressed, select range
              const itemsList = items.map(i => i.id);
              const lastSelectedItem = Array.from(selectedItems).pop();
              const lastSelectedIndex = itemsList.indexOf(lastSelectedItem || '');
              const currentIndex = itemsList.indexOf(item.id);
              
              if (lastSelectedIndex >= 0) {
                const start = Math.min(lastSelectedIndex, currentIndex);
                const end = Math.max(lastSelectedIndex, currentIndex);
                const itemsToSelect = itemsList.slice(start, end + 1);
                
                setSelectedItems(new Set(itemsToSelect));
              }
            } else {
              // Normal click, select only this item
              setSelectedItems(new Set([item.id]));
            }
          }}          onDoubleClick={(e) => {
            e.stopPropagation();
            if (item.type === 'folder' && item.name.endsWith('.exe')) {
              // .exe folders are published apps - open them instead of navigating
              if (openFile) {
                openFile(item);
              }
            } else if (item.type === 'folder') {
              navigateToFolder(item.id);
            } else if (item.type === 'file' && openFile) {
              openFile(item);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // If the item isn't already selected, make it the only selection
            if (!selectedItems.has(item.id)) {
              setSelectedItems(new Set([item.id]));
            }
            
            setShowContextMenu({ x: e.clientX, y: e.clientY, itemId: item.id });
          }}
          draggable={true}
          onDragStart={(e) => handleDragStart && handleDragStart(item.id, e)}
          onDragOver={(e) => item.type === 'folder' && handleFolderDragOver && handleFolderDragOver(item.id, e)}
          onDragLeave={() => item.type === 'folder' && handleFolderDragLeave && handleFolderDragLeave()}
          onDrop={(e) => item.type === 'folder' && handleFolderDrop && handleFolderDrop(item.id, e)}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 flex items-center justify-center mb-2">
              {React.cloneElement(getFileIcon(item), { 
                className: `w-8 h-8 ${selectedItems.has(item.id) ? 'drop-shadow-sm' : ''}` 
              })}
            </div>
            <span 
              className="text-sm truncate w-full font-medium" 
              title={item.name}
            >
              {item.name}
            </span>
            {item.type === 'file' && item.size !== undefined && (
              <span className="text-xs text-gray-500 mt-1">
                {formatSize(item.size)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGrid;

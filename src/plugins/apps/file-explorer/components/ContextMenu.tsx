import { Edit3, Link, Trash2 } from 'lucide-react';
import React from 'react';

interface ContextMenuProps {
  position: { x: number; y: number };
  itemId: string;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateShortcut?: (id: string) => void;
  setShowContextMenu: (
    menu: { x: number; y: number; itemId: string } | null
  ) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  itemId,
  onRename,
  onDelete,
  onCreateShortcut,
  setShowContextMenu,
}) => {
  return (
    <div
      className="absolute bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-48"
      style={{ left: position.x, top: position.y }}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRename(itemId);
          setShowContextMenu(null);
        }}
      >
        <Edit3 className="w-4 h-4" />
        Rename
      </button>
      {onCreateShortcut && (
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onCreateShortcut(itemId);
            setShowContextMenu(null);
          }}
        >
          <Link className="w-4 h-4" />
          Create Desktop Shortcut
        </button>
      )}
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(itemId);
        }}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

export default ContextMenu;

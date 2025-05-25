
import React from 'react';

interface DialogProps {
  title: string;
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  inputValue,
  onInputChange,
  onCancel,
  onKeyDown,
  children
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <input
          type="text"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Enter name..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

interface NewItemDialogProps {
  newItemName: string;
  setNewItemName: (name: string) => void;
  setShowNewItemDialog: (show: boolean) => void;
  createNewItem: (type: 'file' | 'folder') => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export const NewItemDialog: React.FC<NewItemDialogProps> = ({
  newItemName,
  setNewItemName,
  setShowNewItemDialog,
  createNewItem,
  handleKeyDown
}) => {
  return (
    <Dialog
      title="Create New Item"
      inputValue={newItemName}
      onInputChange={(e) => setNewItemName(e.target.value)}
      onCancel={() => {
        setShowNewItemDialog(false);
        setNewItemName('');
      }}
      onKeyDown={handleKeyDown}
    >
      <button
        onClick={() => createNewItem('folder')}
        disabled={!newItemName.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Create Folder
      </button>
      <button
        onClick={() => createNewItem('file')}
        disabled={!newItemName.trim()}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Create File
      </button>
    </Dialog>
  );
};

interface RenameDialogProps {
  newItemName: string;
  setNewItemName: (name: string) => void;
  setShowRenameDialog: (id: string | null) => void;
  renameItem: (id: string, name: string) => void;
  showRenameDialog: string;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  newItemName,
  setNewItemName,
  setShowRenameDialog,
  renameItem,
  showRenameDialog
}) => {
  return (
    <Dialog
      title="Rename Item"
      inputValue={newItemName}
      onInputChange={(e) => setNewItemName(e.target.value)}
      onCancel={() => {
        setShowRenameDialog(null);
        setNewItemName('');
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && newItemName.trim()) {
          renameItem(showRenameDialog, newItemName);
        } else if (e.key === 'Escape') {
          setShowRenameDialog(null);
          setNewItemName('');
        }
      }}
    >
      <button
        onClick={() => renameItem(showRenameDialog, newItemName)}
        disabled={!newItemName.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Rename
      </button>
    </Dialog>
  );
};

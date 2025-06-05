import { File, Folder, Search, Settings as SettingsIcon } from 'lucide-react';
import React, { useState } from 'react';

interface SearchPopupProps {
  onClose?: () => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = [
    {
      icon: File,
      name: "Desktop3D.tsx",
      type: "File",
      path: "src/components/",
    },
    { icon: Folder, name: "components", type: "Folder", path: "src/" },
    { icon: SettingsIcon, name: "Layout Settings", type: "Action", path: "" },
  ].filter(
    (item) =>
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search size={16} className="text-white/60" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white/10 text-white placeholder-white/60 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/40"
          autoFocus
        />
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-1">
          {searchResults.map((result, index) => (
            <button
              key={index}
              className="w-full text-left p-2 hover:bg-white/10 rounded transition-colors flex items-center gap-3"
              onClick={onClose}
            >
              <result.icon size={16} className="text-white/60" />
              <div className="flex-1">
                <div className="text-white text-sm">{result.name}</div>
                <div className="text-white/50 text-xs">
                  {result.type} {result.path && `• ${result.path}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="text-white/60 text-sm text-center py-4">
          No results found
        </div>
      )}
    </div>
  );
};

export default SearchPopup;

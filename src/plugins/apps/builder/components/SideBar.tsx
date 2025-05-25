import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import useIdeStore from '../store/ide-store';
import { FileSystemItem } from '../types';

const SideBar: React.FC = () => {
  const { sidebarVisible, toggleSidebar, activeView } = useIdeStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate delta from starting position
      const delta = e.clientX - startX;
      // Apply delta to starting width with constraints
      const newWidth = Math.max(200, Math.min(500, startWidth + delta));

      setSidebarWidth(newWidth);

      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, startX, startWidth]);

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(sidebarRef.current?.offsetWidth || 240);
    e.preventDefault(); // Prevent text selection
  };

  if (!sidebarVisible) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className="side-bar relative flex flex-col"
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="p-2 font-medium flex items-center justify-between border-b border-sidebar-border">
        <div className="uppercase text-xs tracking-wider">
          {activeView === "explorer" && "Explorer"}
          {activeView === "search" && "Search"}
          {activeView === "git" && "Source Control"}
          {activeView === "extensions" && "Extensions"}
        </div>
      </div>

      <div className="px-2 py-1 flex-1 overflow-auto">
        {activeView === "explorer" && <ExplorerView />}
        {activeView === "search" && <SearchView />}
        {activeView === "git" && <GitView />}
        {activeView === "extensions" && <ExtensionsView />}
      </div>

      <div className="resize-handle" onMouseDown={startResizing} />
    </div>
  );
};

const ExplorerView: React.FC = () => {
  const { fileSystem } = useIdeStore();

  return (
    <div className="explorer-tree">
      {fileSystem.map((item) => (
        <TreeItem key={item.id} item={item} level={0} />
      ))}
    </div>
  );
};

interface TreeItemProps {
  item: FileSystemItem;
  level: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, level }) => {
  const [expanded, setExpanded] = React.useState(true);
  const { openTab } = useIdeStore();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "folder") {
      setExpanded(!expanded);
    }
  };

  const handleClick = () => {
    if (item.type === "file") {
      openTab(item.id);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <div
        className="tree-item"
        onClick={handleClick}
        style={{ paddingLeft: `${level * 8 + 4}px` }}
      >
        <span className="flex items-center">
          {item.type === "folder" && (
            <span
              className="mr-1 text-sidebar-foreground"
              onClick={handleToggle}
            >
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}

          {item.type === "folder" ? (
            <Folder size={16} className="mr-1 text-sidebar-foreground" />
          ) : (
            <FileText size={16} className="mr-1 text-sidebar-foreground" />
          )}

          <span className="truncate">{item.name}</span>
        </span>
      </div>

      {expanded && item.type === "folder" && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const SearchView: React.FC = () => {
  return (
    <div className="p-2">
      <input
        type="text"
        className="w-full p-1 bg-input rounded text-sm mb-2"
        placeholder="Search in files..."
      />
      <div className="text-sm text-muted-foreground mt-2">
        No results found. Try searching for something.
      </div>
    </div>
  );
};

const GitView: React.FC = () => {
  return (
    <div className="p-2">
      <div className="text-sm font-medium mb-2">Changes</div>
      <div className="text-sm text-muted-foreground">
        No changes detected in your workspace.
      </div>
    </div>
  );
};

const ExtensionsView: React.FC = () => {
  return (
    <div className="p-2">
      <input
        type="text"
        className="w-full p-1 bg-input rounded text-sm mb-2"
        placeholder="Search Extensions..."
      />
      <div className="text-sm text-muted-foreground mt-2">
        No extensions installed. Search for extensions in the marketplace.
      </div>
    </div>
  );
};

export default SideBar;

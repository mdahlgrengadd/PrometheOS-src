import React, { useEffect } from 'react';

import { useFileSystemStore } from '@/store/fileSystem';

import CommandPalette from '../components/CommandPalette';
import EditorArea from '../components/EditorArea';
import SideBar from '../components/SideBar';
import StatusBar from '../components/StatusBar';
import useIdeStore from '../store/ide-store';

const IdeLayout: React.FC = () => {
  const {
    theme,
    toggleCommandPalette,
    toggleSidebar,
    togglePanel,
    togglePreviewPanel,
    sidebarVisible,
  } = useIdeStore();

  const initFileSystem = useFileSystemStore((state) => state.init);

  // Initialize file system on component mount
  useEffect(() => {
    initFileSystem();
  }, [initFileSystem]);

  // Apply theme to document
  useEffect(() => {
    // Find the closest ide-builder-app container and apply theme there
    const ideContainer = document.querySelector(".ide-builder-app");
    if (ideContainer) {
      ideContainer.classList.toggle("light", theme === "light");
      ideContainer.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette (Ctrl+Shift+P)
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        toggleCommandPalette();
      }

      // Toggle sidebar (Ctrl+B)
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }

      // Toggle terminal (Ctrl+`)
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        togglePanel();
      }

      // Toggle preview panel (Ctrl+Shift+V)
      if (e.ctrlKey && e.shiftKey && e.key === "V") {
        e.preventDefault();
        togglePreviewPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleCommandPalette, toggleSidebar, togglePanel, togglePreviewPanel]);

  return (
    <div className="ide-container">
      {/* <ActivityBar /> */}
      {sidebarVisible && <SideBar />}
      <EditorArea />
      <StatusBar />
      <CommandPalette />
    </div>
  );
};

export default IdeLayout;

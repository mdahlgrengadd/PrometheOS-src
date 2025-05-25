import React, { useEffect } from 'react';

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

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
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

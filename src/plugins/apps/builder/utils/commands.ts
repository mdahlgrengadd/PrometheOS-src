import useIdeStore from '../store/ide-store';
import { Command } from '../types';

export const commands: Command[] = [
  {
    id: "toggle-sidebar",
    title: "View: Toggle Side Bar",
    category: "View",
    shortcut: "Ctrl+B",
    handler: () => useIdeStore.getState().toggleSidebar(),
  },
  {
    id: "toggle-terminal",
    title: "View: Toggle Terminal",
    category: "View",
    shortcut: "Ctrl+`",
    handler: () => useIdeStore.getState().togglePanel(),
  },
  {
    id: "toggle-preview",
    title: "View: Toggle Preview",
    category: "View",
    shortcut: "Ctrl+Shift+V",
    handler: () => useIdeStore.getState().togglePreviewPanel(),
  },
  {
    id: "toggle-theme",
    title: "Preferences: Toggle Theme",
    category: "Preferences",
    handler: () => useIdeStore.getState().toggleTheme(),
  },
  {
    id: "build-active-file",
    title: "Build: Bundle Active File",
    category: "Build",
    handler: () => {
      useIdeStore.getState().togglePreviewPanel();
      // The actual build happens in PreviewPanel component
    },
  },
  {
    id: "build-bundle-app",
    title: "Build: Bundle App (app.jsx)",
    category: "Build",
    handler: () => {
      useIdeStore.getState().togglePreviewPanel();
      // The actual build happens in PreviewPanel component
    },
  },
];

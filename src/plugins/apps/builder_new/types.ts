export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileSystemItem[];
  content?: string;
  language?: string;
}

export interface Tab {
  id: string;
  title: string;
  fileId: string;
  language: string;
  isDirty: boolean;
}

export interface Command {
  id: string;
  title: string;
  category?: string;
  shortcut?: string;
  icon?: string;
  handler: () => void;
}

export type ViewType = "explorer" | "search" | "git" | "extensions";

export interface AppState {
  activeView: ViewType;
  sidebarVisible: boolean;
  panelVisible: boolean;
  previewPanelVisible: boolean;
  activeTab: string | null;
  tabs: Tab[];
  fileSystem: FileSystemItem[];
  theme: "dark" | "light";
  commandPaletteOpen: boolean;
  // Build-related state
  buildOutput: string;
  buildError: string | null;
  isBuilding: boolean;
}

import { create } from "zustand";

import { AppState, FileSystemItem, Tab, ViewType } from "../types";
import { mockFileSystem } from "../utils/mock-data";
import { loadShadowFolder } from "../vfs/virtual-fs";

interface IdeStore extends AppState {
  toggleSidebar: () => void;
  togglePanel: () => void;
  togglePreviewPanel: () => void;
  toggleCommandPalette: () => void;
  setActiveView: (view: ViewType) => void;
  setActiveTab: (tabId: string) => void;
  openTab: (fileId: string) => void;
  closeTab: (tabId: string) => void;
  toggleTheme: () => void;
  getFileById: (id: string) => FileSystemItem | undefined;
  getTabById: (id: string) => Tab | undefined;
  setTabDirty: (tabId: string, isDirty: boolean) => void;
  saveFile: (fileId: string, content: string) => void;
  setBuildOutput: (output: string) => void;
  setBuildError: (error: string | null) => void;
  setIsBuilding: (isBuilding: boolean) => void;
  setFileSystem: (fs: FileSystemItem[]) => void;
  initFileSystem: (source?: "shadow" | "mock") => Promise<void>;
}

// Default state
const initialState: AppState = {
  activeView: "explorer",
  sidebarVisible: true,
  panelVisible: false,
  previewPanelVisible: false,
  activeTab: null,
  tabs: [],
  fileSystem: mockFileSystem,
  theme: "dark",
  commandPaletteOpen: false,
  buildOutput: "",
  buildError: null,
  isBuilding: false,
};

const useIdeStore = create<IdeStore>((set, get) => ({
  ...initialState,

  setFileSystem: (fs) => set({ fileSystem: fs }),

  // Initialize the file system from shadow or mock
  initFileSystem: async (source = "shadow") => {
    let fs: FileSystemItem[] = [];
    if (source === "shadow") {
      fs = await loadShadowFolder();
      if (!fs || fs.length === 0) {
        // fallback to mock if shadow is empty
        fs = mockFileSystem;
      }
    } else {
      fs = mockFileSystem;
    }
    set({ fileSystem: fs });
  },

  toggleSidebar: () =>
    set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),

  togglePreviewPanel: () =>
    set((state) => ({ previewPanelVisible: !state.previewPanelVisible })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  setActiveView: (view) => set({ activeView: view }),

  setActiveTab: (tabId) => set({ activeTab: tabId }),

  openTab: (fileId) => {
    const file = get().getFileById(fileId);
    if (!file || file.type !== "file") return;

    set((state) => {
      // Check if tab already exists
      const existingTab = state.tabs.find((tab) => tab.fileId === fileId);
      if (existingTab) {
        return { activeTab: existingTab.id };
      }

      // Create a new tab
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        fileId,
        title: file.name,
        language: file.language || "javascript",
        isDirty: false,
      };

      return {
        tabs: [...state.tabs, newTab],
        activeTab: newTab.id,
      };
    });
  },

  closeTab: (tabId) => {
    set((state) => {
      // Find the tab's index
      const tabIndex = state.tabs.findIndex((tab) => tab.id === tabId);
      if (tabIndex === -1) return state;

      const newTabs = state.tabs.filter((tab) => tab.id !== tabId);

      // Update active tab if needed
      let newActiveTab = state.activeTab;
      if (state.activeTab === tabId) {
        if (newTabs.length === 0) {
          newActiveTab = null;
        } else if (tabIndex < newTabs.length) {
          newActiveTab = newTabs[tabIndex].id;
        } else {
          newActiveTab = newTabs[newTabs.length - 1].id;
        }
      }

      return {
        tabs: newTabs,
        activeTab: newActiveTab,
      };
    });
  },

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "dark" ? "light" : "dark",
    })),

  getFileById: (id) => {
    const findInTree = (
      items: FileSystemItem[]
    ): FileSystemItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findInTree(item.children);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findInTree(get().fileSystem);
  },

  getTabById: (id) => {
    return get().tabs.find((tab) => tab.id === id);
  },

  setTabDirty: (tabId, isDirty) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, isDirty } : tab
      ),
    }));
  },

  saveFile: (fileId, content) => {
    // Update the file content in the file system
    set((state) => {
      // Create a deep copy of the file system
      const updateFileSystem = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map((item) => {
          if (item.id === fileId && item.type === "file") {
            return { ...item, content };
          }
          if (item.children) {
            return {
              ...item,
              children: updateFileSystem(item.children),
            };
          }
          return item;
        });
      };

      const newFileSystem = updateFileSystem(state.fileSystem);

      // Find the tab for this file and mark it as not dirty
      const newTabs = state.tabs.map((tab) => {
        if (tab.fileId === fileId) {
          return { ...tab, isDirty: false };
        }
        return tab;
      });

      return {
        fileSystem: newFileSystem,
        tabs: newTabs,
      };
    });
  },

  setBuildOutput: (output) => set({ buildOutput: output }),
  setBuildError: (error) => set({ buildError: error }),
  setIsBuilding: (isBuilding) => set({ isBuilding }),
}));

export default useIdeStore;

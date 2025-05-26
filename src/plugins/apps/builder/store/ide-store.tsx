import { create } from 'zustand';

import { useFileSystemStore } from '../../../../store/fileSystem';
import { AppState, FileSystemItem, Tab, ViewType } from '../types';

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
  setBuildCode: (code: string) => void;
  setIsBuilding: (isBuilding: boolean) => void;
  runBuild: (command?: string) => Promise<void>;
}

// Default state
const initialState: AppState = {
  activeView: "explorer",
  sidebarVisible: true,
  panelVisible: false,
  previewPanelVisible: false,
  activeTab: null,
  tabs: [],
  theme: "light",
  commandPaletteOpen: false,
  buildOutput: "",
  buildError: null,
  isBuilding: false,
  buildCode: "", // Clean JavaScript code for preview
  panelVisibilityBeforePreview: false,
};

const useIdeStore = create<IdeStore>((set, get) => ({
  ...initialState,

  toggleSidebar: () =>
    set((state) => ({ sidebarVisible: !state.sidebarVisible })),

  togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),
  togglePreviewPanel: () =>
    set((state) => {
      const newPreviewVisible = !state.previewPanelVisible;

      // Import settings to check configuration
      import("../utils/esbuild-settings").then(({ ideSettings }) => {
        if (ideSettings.hideTerminalDuringPreview) {
          if (newPreviewVisible) {
            // Store current panel visibility before hiding it
            set((currentState) => ({
              panelVisibilityBeforePreview: currentState.panelVisible,
              panelVisible: false,
            }));
          } else {
            // Restore previous panel visibility
            set((currentState) => ({
              panelVisible: currentState.panelVisibilityBeforePreview,
            }));
          }
        }
      });

      return { previewPanelVisible: newPreviewVisible };
    }),

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
    // Use the shared store to find files
    const findInTree = (item: FileSystemItem): FileSystemItem | undefined => {
      if (item.id === id) return item;
      if (item.children) {
        for (const child of item.children) {
          const found = findInTree(child);
          if (found) return found;
        }
      }
      return undefined;
    };

    // Get the file tree from the shared store
    const fileSystem = useFileSystemStore.getState().fs;
    return findInTree(fileSystem);
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
    // Find the file path
    const findFilePath = (
      item: FileSystemItem,
      path: string[] = ["root"]
    ): string[] | null => {
      if (item.id === fileId) return path;
      if (!item.children) return null;

      for (const child of item.children) {
        const childPath = findFilePath(child, [...path, child.id]);
        if (childPath) return childPath;
      }

      return null;
    };

    // Get file system from shared store
    const fileSystem = useFileSystemStore.getState().fs;
    const path = findFilePath(fileSystem);

    if (path) {
      // Get the folder path (parent path)
      const parentPath = path.slice(0, -1);

      // Update file content in shared store
      useFileSystemStore
        .getState()
        .updateFileContent(parentPath, fileId, content);

      // Mark tab as not dirty
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.fileId === fileId ? { ...tab, isDirty: false } : tab
        ),
      }));
    }
  },
  setBuildOutput: (output) => set({ buildOutput: output }),
  setBuildError: (error) => set({ buildError: error }),
  setBuildCode: (code) => set({ buildCode: code }),
  setIsBuilding: (isBuilding) => set({ isBuilding }),
  runBuild: async (command?: string) => {
    const state = get();

    // Import settings to check configuration
    const { ideSettings } = await import("../utils/esbuild-settings");

    // Ensure panel is visible and switch to output tab (only if not in preview mode)
    if (
      ideSettings.showTerminalOnBuild &&
      !state.previewPanelVisible &&
      !state.panelVisible
    ) {
      state.togglePanel();
    }

    // Import build utilities
    const { buildCode, parseEsbuildCommand, addToVirtualFs } = await import(
      "../utils/esbuild-service"
    );
    state.setIsBuilding(true);
    state.setBuildError(null);
    state.setBuildOutput("");
    state.setBuildCode(""); // Clear the previous build code

    // Get active file content
    const getActiveFileContent = () => {
      if (!state.activeTab) return null;
      const tab = state.getTabById(state.activeTab);
      if (!tab) return null;
      const file = state.getFileById(tab.fileId);
      if (!file || file.type !== "file") return null;
      return {
        filePath: file.id,
        content: file.content || "",
      };
    };

    const activeFile = getActiveFileContent();

    if (!activeFile) {
      state.setBuildError("No active file to build");
      state.setIsBuilding(false);
      return;
    }

    // Add all files to virtual FS
    const addAllFilesToVirtualFs = (item: FileSystemItem, parentPath = "") => {
      const filePath = item.id;
      if (item.type === "file" && item.content !== undefined) {
        addToVirtualFs(filePath, item.content);
      }
      if (item.type === "folder" && item.children) {
        item.children.forEach((child) => {
          addAllFilesToVirtualFs(child, filePath);
        });
      }
    };

    // Get the file system from the shared store
    const fileSystem = useFileSystemStore.getState().fs;
    addAllFilesToVirtualFs(fileSystem);

    let buildOptions;

    if (command) {
      buildOptions = parseEsbuildCommand(command);
      if (!buildOptions) {
        state.setBuildError("Invalid esbuild command");
        state.setIsBuilding(false);
        return;
      }
      buildOptions.content = activeFile.content;
    } else {
      buildOptions = {
        entryPoint: activeFile.filePath,
        content: activeFile.content,
        options: {
          bundle: true,
          minify: true,
          format: "esm",
        },
      };
    }
    try {
      const result = await buildCode(buildOptions);
      if (result.error) {
        state.setBuildError(result.error);
      } else {
        // Store the clean JavaScript code for preview
        state.setBuildCode(result.code);
        // Store formatted output for display in the output panel
        state.setBuildOutput(
          `Build successful!\nOutput: ${result.code.slice(0, 1000)}${
            result.code.length > 1000 ? "..." : ""
          }`
        );

        // Auto-switch to preview tab if preview panel is visible and build succeeded
        if (
          ideSettings.autoFocusPreview &&
          state.previewPanelVisible &&
          state.activeTab !== "preview"
        ) {
          state.setActiveTab("preview");
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      state.setBuildError(`Build failed: ${errorMessage}`);
    } finally {
      state.setIsBuilding(false);
    }
  },
}));

export default useIdeStore;

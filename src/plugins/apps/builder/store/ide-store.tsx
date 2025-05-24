
import { create } from 'zustand';
import { AppState, Tab, FileSystemItem, ViewType } from '../types';
import { mockFileSystem } from '../utils/mock-data';

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
}

// Default state
const initialState: AppState = {
  activeView: 'explorer',
  sidebarVisible: true,
  panelVisible: false,
  previewPanelVisible: false,
  activeTab: null,
  tabs: [],
  fileSystem: mockFileSystem,
  theme: 'dark',
  commandPaletteOpen: false,
};

const useIdeStore = create<IdeStore>((set, get) => ({
  ...initialState,
  
  toggleSidebar: () => set((state) => ({ sidebarVisible: !state.sidebarVisible })),
  
  togglePanel: () => set((state) => ({ panelVisible: !state.panelVisible })),
  
  togglePreviewPanel: () => set((state) => ({ previewPanelVisible: !state.previewPanelVisible })),
  
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  
  setActiveView: (view) => set({ activeView: view }),
  
  setActiveTab: (tabId) => set({ activeTab: tabId }),
  
  openTab: (fileId) => {
    const file = get().getFileById(fileId);
    if (!file || file.type !== 'file') return;
    
    set((state) => {
      // Check if tab already exists
      const existingTab = state.tabs.find(tab => tab.fileId === fileId);
      if (existingTab) {
        return { activeTab: existingTab.id };
      }
      
      // Create a new tab
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        fileId,
        title: file.name,
        language: file.language || 'javascript',
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
      const tabIndex = state.tabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return state;
      
      const newTabs = state.tabs.filter(tab => tab.id !== tabId);
      
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
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  
  getFileById: (id) => {
    const findInTree = (items: FileSystemItem[]): FileSystemItem | undefined => {
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
    return get().tabs.find(tab => tab.id === id);
  },
}));

export default useIdeStore;

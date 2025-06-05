import { create } from "zustand";

interface WindowPosition {
  x: number;
  y: number;
  z: number;
}

interface WindowState {
  position: WindowPosition;
  isMaximized: boolean;
  originalState?: {
    position: WindowPosition;
    size: { width: number; height: number };
  };
}

interface WindowStore {
  windowStates: Map<string, WindowState>;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowState: (windowId: string, state: Partial<WindowState>) => void;
  getWindowPosition: (windowId: string) => WindowPosition | undefined;
  getWindowState: (windowId: string) => WindowState | undefined;
  removeWindow: (windowId: string) => void;
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windowStates: new Map(),

  updateWindowPosition: (windowId: string, position: WindowPosition) => {
    console.log(
      `[WindowStore] Updating position for window ${windowId}:`,
      position
    );
    set((state) => {
      const newStates = new Map(state.windowStates);
      const existingState = newStates.get(windowId) || {
        position: { x: 0, y: 0, z: 0 },
        isMaximized: false,
      };
      newStates.set(windowId, { ...existingState, position });
      console.log(`[WindowStore] Position updated for window ${windowId}`);
      return { windowStates: newStates };
    });
  },

  updateWindowState: (windowId: string, state: Partial<WindowState>) => {
    console.log(`[WindowStore] Updating state for window ${windowId}:`, state);
    set((currentState) => {
      const newStates = new Map(currentState.windowStates);
      const existingState = newStates.get(windowId) || {
        position: { x: 0, y: 0, z: 0 },
        isMaximized: false,
      };
      newStates.set(windowId, { ...existingState, ...state });
      console.log(
        `[WindowStore] State updated for window ${windowId}:`,
        newStates.get(windowId)
      );
      return { windowStates: newStates };
    });
  },

  getWindowPosition: (windowId: string) => {
    const state = get().windowStates.get(windowId);
    const position = state?.position;
    console.log(
      `[WindowStore] Getting position for window ${windowId}:`,
      position
    );
    return position;
  },

  getWindowState: (windowId: string) => {
    const state = get().windowStates.get(windowId);
    console.log(`[WindowStore] Getting state for window ${windowId}:`, state);
    return state;
  },

  removeWindow: (windowId: string) => {
    console.log(`[WindowStore] Removing window ${windowId} from store`);
    set((state) => {
      const newStates = new Map(state.windowStates);
      newStates.delete(windowId);
      return { windowStates: newStates };
    });
  },
}));

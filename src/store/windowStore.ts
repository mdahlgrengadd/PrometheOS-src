import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

import { WindowsDict, WindowState, WindowStore } from '@/types/window';

// Helper function to find the highest z-index in the window dictionary
// Guarantees a valid z-index even if windows are missing zIndex or have invalid values
const findHighestZIndex = (windows: WindowsDict): number => {
  if (!windows || Object.keys(windows).length === 0) return 0;

  const zIndices = Object.values(windows).map((w) => {
    // Handle undefined, null, zero, or negative zIndex values
    const zIndex = w?.zIndex;
    return typeof zIndex === "number" && zIndex > 0 ? zIndex : 1;
  });

  return Math.max(...zIndices, 0);
};

// ---------- Implementation ----------
export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        windows: {},
        highestZ: 1,

        registerWindow: (w) =>
          set((s) => {
            const existingWindow = s.windows[w.id];
            const newZIndex = ++s.highestZ;

            // If window exists but is being re-registered with a new position,
            // prioritize the new position (from getSmartPosition) over persisted position
            if (existingWindow) {
              return {
                windows: {
                  ...s.windows,
                  [w.id]: {
                    ...existingWindow,
                    ...w, // New registration data takes precedence
                    zIndex: newZIndex,
                  },
                },
              };
            } else {
              // New window registration
              return {
                windows: { ...s.windows, [w.id]: { ...w, zIndex: newZIndex } },
              };
            }
          }),

        setOpen: (id, open) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], isOpen: open },
              },
            };
          }),

        minimize: (id, v) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], isMinimized: v ?? true },
              },
            };
          }),

        maximize: (id: string) => {
          const window = get().windows[id];
          if (!window) return;

          // If not already maximized, store current position and size
          if (!window.isMaximized) {
            set((state) => ({
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: true,
                  // Store current position and size for restore
                  previousPosition: { ...window.position },
                  previousSize: { ...window.size },
                },
              },
            }));
          } else {
            // Restore previous position and size if available
            const previousPosition = window.previousPosition || {
              x: 100,
              y: 100,
            };
            const previousSize = window.previousSize || {
              width: 400,
              height: 300,
            };

            set((state) => ({
              windows: {
                ...state.windows,
                [id]: {
                  ...window,
                  isMaximized: false,
                  position: previousPosition,
                  size: previousSize,
                },
              },
            }));
          }
        },

        move: (id, pos) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], position: pos },
              },
            };
          }),

        resize: (id, size) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], size },
              },
            };
          }),

        focus: (id) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            const newHighestZ = s.highestZ + 1;
            return {
              highestZ: newHighestZ,
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], zIndex: newHighestZ },
              },
            };
          }),

        close: (id) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], isOpen: false },
              },
            };
          }),

        // Reset the store to initial state
        reset: () =>
          set({
            windows: {} as WindowsDict,
            highestZ: 1,
          }),

        // Create a proper updateWindow function that doesn't affect z-index
        updateWindow: (id: string, updates: Partial<WindowState>) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            return {
              windows: {
                ...s.windows,
                [id]: { ...s.windows[id], ...updates },
              },
            };
          }),

        // Add a bulk update function for synchronizing windows without affecting z-index
        updateWindows: (updates: Record<string, Partial<WindowState>>) =>
          set((s) => {
            const updatedWindows = { ...s.windows };

            // Apply each update preserving z-index
            Object.entries(updates).forEach(([id, update]) => {
              if (updatedWindows[id]) {
                updatedWindows[id] = { ...updatedWindows[id], ...update };
              }
            });

            return { windows: updatedWindows };
          }),
      }),
      {
        name: "desktop-window-state", // localStorage key
        partialize: (state) => ({
          // Drop the React.ReactNode from each window so nothing non-serializable is stored
          windows: Object.fromEntries(
            Object.entries(state.windows).map(([id, w]) => {
              const { content, ...rest } = w;
              return [id, rest];
            })
          ),
        }),
        onRehydrateStorage: (state) => {
          // When state is rehydrated from localStorage
          return (rehydratedState, error) => {
            if (error) {
              console.error("Error rehydrating window state:", error);
              return;
            }

            if (rehydratedState && rehydratedState.windows) {
              // Find the highest z-index among persisted windows
              const highestPersistedZ = findHighestZIndex(
                rehydratedState.windows
              );

              // Set the highestZ to be at least the highest persisted z-index
              rehydratedState.highestZ = Math.max(1, highestPersistedZ);
            }
          };
        },
      }
    )
  )
);

// Add a function to process URL query parameters for opening windows
export const processWindowUrlParams = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const openParam = params.get("open");

    if (openParam) {
      const windowIds = openParam.split(",");
      const store = useWindowStore.getState();

      windowIds.forEach((id) => {
        // If the window exists in the store, open it
        if (store.windows[id]) {
          store.setOpen(id, true);
          store.focus(id);
        }
      });
    }
  } catch (error) {
    console.error("Error processing window URL params:", error);
  }
};

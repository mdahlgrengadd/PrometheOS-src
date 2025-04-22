import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import { WindowsDict, WindowState, WindowStore } from "@/types/window";

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
          set((s) => ({
            windows: { ...s.windows, [w.id]: { ...w, zIndex: ++s.highestZ } },
          })),

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

        maximize: (id) =>
          set((s) => {
            // Check if window exists
            if (!s.windows[id]) return s;

            const w = s.windows[id];
            return {
              windows: {
                ...s.windows,
                [id]: { ...w, isMaximized: !w.isMaximized },
              },
            };
          }),

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

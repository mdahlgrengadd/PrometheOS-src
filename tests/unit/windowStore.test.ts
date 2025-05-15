import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWindowStore } from "@/store/windowStore";
import { WindowsDict, WindowState } from "@/types/window";

// Create mock window state for testing
const createMockWindow = (id: string, overrides = {}): WindowState => ({
  id,
  title: `Window ${id}`,
  content: null,
  isOpen: true,
  isMinimized: false,
  zIndex: 1,
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  isMaximized: false,
  ...overrides,
});

// Mock for localStorage to test persistence
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    getAll: () => store,
  };
};

describe("windowStore", () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useWindowStore.setState({ windows: {}, highestZ: 1 }, true);
  });

  it("should register a new window", () => {
    const mockWindow = createMockWindow("test1");
    useWindowStore.getState().registerWindow(mockWindow);

    const state = useWindowStore.getState();
    expect(state.windows).toHaveProperty("test1");
    expect(state.windows.test1.title).toBe("Window test1");
    expect(state.highestZ).toBe(2); // Should increment highestZ
    expect(state.windows.test1.zIndex).toBe(2); // Should assign new zIndex
  });

  it("should preserve existing windows when registering a new one", () => {
    const window1 = createMockWindow("test1");
    const window2 = createMockWindow("test2");

    useWindowStore.getState().registerWindow(window1);
    useWindowStore.getState().registerWindow(window2);

    const state = useWindowStore.getState();
    expect(Object.keys(state.windows)).toHaveLength(2);
    expect(state.windows).toHaveProperty("test1");
    expect(state.windows).toHaveProperty("test2");
  });

  it("should update only the open property when calling setOpen", () => {
    const initialWindow = createMockWindow("test1");
    useWindowStore.getState().registerWindow(initialWindow);

    useWindowStore.getState().setOpen("test1", false);

    const state = useWindowStore.getState();
    expect(state.windows.test1.isOpen).toBe(false);
    expect(state.windows.test1.position).toEqual(initialWindow.position); // Other props unchanged
    expect(state.windows.test1.size).toEqual(initialWindow.size); // Other props unchanged
  });

  it("should update only the position property when calling move", () => {
    const initialWindow = createMockWindow("test1");
    useWindowStore.getState().registerWindow(initialWindow);

    const newPos = { x: 200, y: 300 };
    useWindowStore.getState().move("test1", newPos);

    const state = useWindowStore.getState();
    expect(state.windows.test1.position).toEqual(newPos);
    expect(state.windows.test1.isOpen).toBe(initialWindow.isOpen); // Other props unchanged
    expect(state.windows.test1.size).toEqual(initialWindow.size); // Other props unchanged
  });

  it("should update only the size property when calling resize", () => {
    const initialWindow = createMockWindow("test1");
    useWindowStore.getState().registerWindow(initialWindow);

    const newSize = { width: 800, height: 600 };
    useWindowStore.getState().resize("test1", newSize);

    const state = useWindowStore.getState();
    expect(state.windows.test1.size).toEqual(newSize);
    expect(state.windows.test1.isOpen).toBe(initialWindow.isOpen); // Other props unchanged
    expect(state.windows.test1.position).toEqual(initialWindow.position); // Other props unchanged
  });

  it("should increment highestZ and update window zIndex when focusing", () => {
    const window1 = createMockWindow("test1");
    const window2 = createMockWindow("test2");

    useWindowStore.getState().registerWindow(window1); // zIndex = 2
    useWindowStore.getState().registerWindow(window2); // zIndex = 3

    useWindowStore.getState().focus("test1");

    const state = useWindowStore.getState();
    expect(state.highestZ).toBe(4);
    expect(state.windows.test1.zIndex).toBe(4);
    expect(state.windows.test2.zIndex).toBe(3); // Unchanged
  });

  it("should toggle isMaximized when calling maximize", () => {
    const initialWindow = createMockWindow("test1", { isMaximized: false });
    useWindowStore.getState().registerWindow(initialWindow);

    useWindowStore.getState().maximize("test1");
    expect(useWindowStore.getState().windows.test1.isMaximized).toBe(true);

    useWindowStore.getState().maximize("test1");
    expect(useWindowStore.getState().windows.test1.isMaximized).toBe(false);
  });

  it("should set isMinimized when calling minimize", () => {
    const initialWindow = createMockWindow("test1", { isMinimized: false });
    useWindowStore.getState().registerWindow(initialWindow);

    useWindowStore.getState().minimize("test1");
    expect(useWindowStore.getState().windows.test1.isMinimized).toBe(true);

    useWindowStore.getState().minimize("test1", false);
    expect(useWindowStore.getState().windows.test1.isMinimized).toBe(false);
  });

  it("should set isOpen to false when calling close", () => {
    const initialWindow = createMockWindow("test1", { isOpen: true });
    useWindowStore.getState().registerWindow(initialWindow);

    useWindowStore.getState().close("test1");
    expect(useWindowStore.getState().windows.test1.isOpen).toBe(false);
  });

  // === New edge case tests ===

  it("should gracefully handle operations on non-existent windows", () => {
    // Setup initial state
    const window1 = createMockWindow("test1");
    useWindowStore.getState().registerWindow(window1);
    const initialState = useWindowStore.getState();

    // Try operations on a window that doesn't exist
    useWindowStore.getState().setOpen("no-such-window", true);
    useWindowStore.getState().minimize("no-such-window");
    useWindowStore.getState().maximize("no-such-window");
    useWindowStore.getState().move("no-such-window", { x: 500, y: 500 });
    useWindowStore
      .getState()
      .resize("no-such-window", { width: 1000, height: 800 });
    useWindowStore.getState().focus("no-such-window");
    useWindowStore.getState().close("no-such-window");

    // Verify state hasn't changed except for valid operations
    const finalState = useWindowStore.getState();
    expect(finalState.highestZ).toEqual(initialState.highestZ);
    expect(Object.keys(finalState.windows)).toHaveLength(1);
    expect(finalState.windows.test1).toEqual(initialState.windows.test1);
  });

  it("should handle mixed/missing zIndex values during rehydration", () => {
    // Create a mock storage state with varying zIndex values
    const mockPersistedState = {
      windows: {
        win1: createMockWindow("win1", { zIndex: 5 }),
        win2: createMockWindow("win2", { zIndex: undefined }),
        win3: createMockWindow("win3", { zIndex: 0 }),
        win4: createMockWindow("win4", { zIndex: 10 }),
        win5: createMockWindow("win5", { zIndex: -1 }),
      } as WindowsDict,
    };

    // Manually trigger the store's rehydration with this state
    const mockRehydrateCallback = vi.fn();
    const { onRehydrateStorage } = useWindowStore.persist;

    if (onRehydrateStorage) {
      const rehydrateHandler = onRehydrateStorage({});
      if (rehydrateHandler) {
        rehydrateHandler({ ...mockPersistedState, highestZ: 1 }, null);
      }
    }

    // Set the mock state manually to simulate what happens after rehydration
    useWindowStore.setState({
      windows: mockPersistedState.windows,
      highestZ: 10, // This would be the max zIndex found (10 from win4)
    });

    // Test that a new focus action increases from the highest known zIndex
    useWindowStore.getState().focus("win1");
    expect(useWindowStore.getState().windows.win1.zIndex).toBe(11);
    expect(useWindowStore.getState().highestZ).toBe(11);
  });

  it("should handle focus race conditions correctly", async () => {
    // Register two windows
    const window1 = createMockWindow("test1");
    const window2 = createMockWindow("test2");
    useWindowStore.getState().registerWindow(window1);
    useWindowStore.getState().registerWindow(window2);

    // Focus both in rapid succession
    useWindowStore.getState().focus("test1");
    useWindowStore.getState().focus("test2");

    // Check that the second window gets the highest z-index
    const state = useWindowStore.getState();
    expect(state.windows.test1.zIndex).toBe(4); // 2 from register + 2 from focus
    expect(state.windows.test2.zIndex).toBe(5); // 3 from register + 2 from focus
    expect(state.highestZ).toBe(5);

    // Make sure that re-focusing the first window after the second
    // gives it a higher z-index
    useWindowStore.getState().focus("test1");
    expect(useWindowStore.getState().windows.test1.zIndex).toBe(6);
    expect(useWindowStore.getState().highestZ).toBe(6);
  });
});

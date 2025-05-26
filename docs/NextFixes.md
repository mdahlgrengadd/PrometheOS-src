# State Management Fixes for Desktop System

## Current Issues

After refactoring Phase 1 and Phase 2 from the roadmap, there are remaining issues with state persistence and management:

1. `localStorage.clear()` doesn't properly reset the desktop state
2. Windows remain in the taskbar even after storage is cleared
3. No unified way to reset to a "clean" initial state
4. Multiple persistence mechanisms create race conditions

## Root Causes

The desktop state is stored across multiple locations:

1. **Window store state**: Persisted via Zustand (`desktop-window-state` in localStorage)
2. **Dynamic plugins**: Stored in `dynamicPluginManifests` localStorage key
3. **URL Query params**: `?open=...` parameters feed into `activeWindows`
4. **Feature flags**: Various settings like `show-desktop-icons` and `taskbar-autohide`

When `localStorage.clear()` is called, the in-memory Zustand store is still populated, and your Desktop component immediately re-registers ALL static plugins. Also, URL query parameters are unaffected.

## Solution: Create a Unified Reset Utility

Add a proper "Reset Desktop" utility that cleans all state:

```typescript
// path: src/utils/resetDesktop.ts
import { useWindowStore } from "@/store/windowStore";
import { STORAGE_KEY as DYN_KEY } from "@/plugins/dynamicRegistry";

export function resetDesktopState() {
  // 1) Clear localStorage keys
  localStorage.removeItem("desktop-window-state");
  localStorage.removeItem(DYN_KEY);
  localStorage.removeItem("show-desktop-icons");
  localStorage.removeItem("taskbar-autohide");
  // ...any other keys you care about...

  // 2) Reset URL (drop all query params)
  window.history.replaceState({}, document.title, window.location.pathname);

  // 3) Reset the in-memory Zustand store
  //    (we'll add a `reset` action next)
  useWindowStore.getState().reset();

  // 4) (Optional) Hard reload to re‑run PluginContext, AppOpener, etc.
  // window.location.reload();
}
```

## Add Reset Action to Window Store

```typescript
// path: src/store/windowStore.ts
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { WindowsDict, WindowState, WindowStore } from "@/types/window";

export const useWindowStore = create<WindowStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        windows: {},
        highestZ: 1,
        // ... your existing actions ...

        // NEW: reset everything back to initial
        reset: () =>
          set({
            windows: {} as WindowsDict,
            highestZ: 1,
          }),
      }),
      {
        name: "desktop-window-state",
        partialize: (state) => ({
          windows: Object.fromEntries(
            Object.entries(state.windows).map(([id, w]) => {
              const { content, ...rest } = w;
              return [id, rest];
            })
          ),
        }),
        // ... your onRehydrateStorage handler ...
      }
    )
  )
);
```

## Add UI Integration

Add a reset button to Settings or a debug panel:

```tsx
// path: src/components/SomeSettingsPanel.tsx
import React from "react";
import { resetDesktopState } from "@/utils/resetDesktop";

export function DebugSettings() {
  return (
    <button
      className="btn btn-destructive"
      onClick={() => {
        if (
          confirm(
            "Completely reset your desktop to a fresh state?\nThis will clear all layouts, open windows, and installed dynamic plugins."
          )
        ) {
          resetDesktopState();
        }
      }}
    >
      Reset Desktop
    </button>
  );
}
```

## Benefits of This Approach

This solution will properly clean:

- All window positions, sizes, and visibility states
- Any dynamic plugin manifests
- URL query parameter bindings
- Feature flag preferences

The desktop will return to a clean initial state as if freshly loaded for the first time.

## Implementation Notes

1. Update the `WindowStore` interface in `types/window.ts` to include the new `reset` action.
2. Consider adding this reset functionality to the Settings app as a "Factory Reset" option.
3. You may need to add additional localStorage keys to the reset function as new features are developed. 
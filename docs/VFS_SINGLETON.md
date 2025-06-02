# Virtual File System (VFS) Singleton

## Overview

The Virtual File System is now implemented as a **global singleton** to prevent runtime-created files (like published apps) from being destroyed when different apps reinitialize.

## Architecture

### Before (Problematic)
- Each app (builder, file-explorer) maintained its own VFS state
- Apps would call `init()` and reload from shadow folder, destroying runtime files
- Published apps would disappear when switching between apps

### After (Fixed)
- Single global `VirtualFS` instance in `/src/utils/virtual-fs.ts`
- Zustand store in `/src/store/fileSystem.ts` uses the singleton as backing storage
- Only initializes from shadow folder **once** on first access
- Runtime-created files persist across app switches

## Key Components

### 1. VirtualFS Class (`/src/utils/virtual-fs.ts`)
```typescript
export class VirtualFS {
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  
  async initializeOnce(): Promise<void> {
    // Only loads from shadow on first call
    // Subsequent calls return immediately
  }
  
  async forceReloadFromShadow(): Promise<void> {
    // Use carefully - destroys runtime files!
  }
}

// Global singleton
export const virtualFs = new VirtualFS();
```

### 2. Zustand Store (`/src/store/fileSystem.ts`)
- Now uses `virtualFs` singleton as backing storage
- All operations (add, delete, rename, etc.) operate directly on singleton
- Triggers Zustand updates after modifications

### 3. Debug Panel (`/src/components/debug/VFSDebugPanel.tsx`)
- Shows VFS initialization status
- Displays file count
- Provides emergency "Force Reload" button (destroys runtime files)
- Accessible via Database icon in Builder status bar

## Usage

### Normal Operation
```typescript
// In any app
const { init } = useFileSystemStore();
await init(); // Safe - only loads shadow once globally
```

### Emergency Reset (Development)
```typescript
// Force reload from shadow (destroys published apps!)
const { forceReload } = useFileSystemStore();
await forceReload();
```

### Accessing VFS Directly
```typescript
import { virtualFs } from '@/utils/virtual-fs';

// Check status
if (virtualFs.isInitialized()) {
  // VFS is ready
}

// Direct file operations (advanced usage)
virtualFs.addItems(['root', 'published-apps'], [newApp]);
```

## Benefits

1. **Persistence**: Published apps and user-created files survive app switches
2. **Performance**: No redundant shadow loading after first initialization  
3. **Consistency**: Single source of truth for all file operations
4. **Debug Tools**: Clear visibility into VFS state during development

## Migration Notes

- **No breaking changes** to app code using `useFileSystemStore`
- Builder and File Explorer work exactly the same from user perspective
- Published apps now persist as expected
- Debug panel helps troubleshoot VFS issues during development

## Debugging

- Use the Database icon in Builder status bar to access VFS debug panel
- Check browser console for VFS initialization logs:
  - `[VirtualFS] First-time initialization from shadow folder`
  - `[VirtualFS] Already initialized, skipping shadow reload`
- Emergency force reload available if VFS gets corrupted

## Best Practices

1. Always use `useFileSystemStore.init()` instead of direct VFS calls
2. Only use `forceReload()` during development for testing
3. Check `virtualFs.isInitialized()` before critical operations
4. Monitor debug panel during development for unexpected reloads 
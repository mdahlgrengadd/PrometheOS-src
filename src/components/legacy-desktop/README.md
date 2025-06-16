# Legacy Desktop System Refactoring

This document describes the refactoring of the legacy desktop system into a relocatable structure that can coexist with the new 3D desktop environment.

## Overview

The legacy desktop system has been moved from being scattered across the `src/components` directory to a self-contained `src/components/legacy-desktop` directory. This allows both the legacy 2D desktop and the new 3D desktop to coexist in the same application.

## Directory Structure

```
src/components/legacy-desktop/
├── index.ts                  # Barrel export file
├── LegacyDesktop.tsx        # Main legacy desktop component
├── AppWindow.tsx            # Window management for legacy desktop
├── DesktopIcon.tsx          # Individual desktop icon component
├── DesktopIcons.tsx         # Desktop icons container
├── StartButton.tsx          # Start menu button
├── StartMenu.tsx            # Start menu component
├── StartMenuItem.tsx        # Individual start menu items
├── Taskbar.css              # Taskbar styling
└── Taskbar.tsx              # Taskbar component
```

## Key Changes

### 1. Component Relocation
- Moved all legacy desktop components from `src/components` to `src/components/legacy-desktop`
- Updated all internal import paths to use relative imports within the legacy-desktop folder
- Created barrel exports in `index.ts` for easy importing

### 2. Main Desktop Component Updates
- **Desktop.tsx** now supports both 3D and legacy desktop environments
- Added a toggle button in the top-right corner to switch between environments
- Uses localStorage to persist the user's desktop environment preference
- Defaults to 3D desktop unless explicitly set to legacy

### 3. Import Path Updates
All components in the legacy-desktop folder have been updated to use correct relative paths:
- Plugin context imports: `'../../plugins/PluginContext'`
- Hook imports: `'../../hooks/useWebRTCStatus'`
- Component imports within the folder use relative paths: `'./ComponentName'`

### 4. Legacy Desktop Component
- Renamed from `Desktop` to `LegacyDesktop` to avoid naming conflicts
- Contains all the original desktop functionality:
  - URL parameter processing for app launching
  - Window management (open, close, minimize, maximize, focus)
  - Desktop icons display
  - Taskbar with start menu
  - BeOS theme support with maximized window tabs
  - Frameless plugin support

## Usage

### Switching Between Desktop Environments
Users can switch between the 3D and legacy desktop environments using the toggle button in the top-right corner. The preference is automatically saved to localStorage.

### Importing Legacy Components
```tsx
// Import the main legacy desktop
import LegacyDesktop from '@/components/legacy-desktop';

// Import specific components
import { Taskbar, DesktopIcons, AppWindow } from '@/components/legacy-desktop';
```

### Desktop Environment Detection
```tsx
const [use3DDesktop, setUse3DDesktop] = useState(() => {
  const saved = localStorage.getItem('desktop-environment');
  return saved !== 'legacy'; // Default to 3D unless explicitly set to legacy
});
```

## Benefits

1. **Clean Separation**: Legacy and 3D desktop systems are completely separate
2. **Maintainability**: Each system can be maintained independently
3. **User Choice**: Users can choose their preferred desktop environment
4. **Backward Compatibility**: All existing functionality is preserved
5. **Future-Proof**: Easy to add new desktop environments or remove the legacy system

## Technical Details

### Component Dependencies
- All legacy components depend on the same shared stores and contexts:
  - `useWindowStore` for window state management
  - `usePlugins` for plugin management
  - `useTheme` for theming
  - `useFileSystemStore` for file system operations

### Shared Resources
The legacy desktop system continues to use shared resources:
- Window management system
- Plugin system
- Theme system
- File system (VFS)
- Event bus

### Styling
- Taskbar.css is included in the legacy-desktop folder
- All theme-specific styling continues to work
- Component-scoped CSS modules are preserved

## Migration Path

If you need to make changes to the legacy desktop system:

1. Navigate to `src/components/legacy-desktop/`
2. Make your changes to the appropriate component
3. Test with the legacy desktop environment enabled
4. Ensure imports are using the correct relative paths

## Future Considerations

- The legacy desktop system can be deprecated and removed in future versions
- New desktop environments can be added alongside the existing ones
- The toggle mechanism can be extended to support multiple desktop environments
- Performance optimizations can be applied independently to each system

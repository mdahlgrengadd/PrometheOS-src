
# Responsive Desktop Shell

This project implements a responsive desktop shell that adapts between:

1. **Mobile Experience (Small Screens)**
   - iOS-like interface with swipeable homescreen pages
   - Full-screen applications
   - Bottom dock for quick access
   - Single app visible at a time

2. **Desktop Experience (Large Screens)**
   - macOS-like interface with draggable windows
   - Multi-window capability with window management
   - Desktop with icons
   - Dock at the bottom for quick access

## Features

- Responsive design that adapts based on screen size
- Draggable windows on desktop with focus management
- Swipeable homescreens on mobile
- App launching system that works in both modes
- Window management (minimize, focus, close)
- Animated transitions

## Implementation

The shell is built using React and Tailwind CSS with the following components:

- `Shell.tsx` - Main shell container that detects screen size
- Desktop components:
  - `DesktopShell.tsx` - Desktop interface
  - `Window.tsx` - Draggable window component
  - `Dock.tsx` - Bottom dock
- Mobile components:
  - `MobileShell.tsx` - Mobile interface
  - `HomeScreen.tsx` - Swipeable home screens
  - `AppScreen.tsx` - Full-screen application view
  - `DockBar.tsx` - Bottom navigation bar
- Shared components:
  - `AppIcon.tsx` - App icon component
  - `AppWindow.tsx` - Application window content

The system uses the `useWindowManager` hook for window management and the `ShellContext` for state management.

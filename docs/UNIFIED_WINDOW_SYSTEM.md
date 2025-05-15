# Unified Window System

This document outlines the new unified window system for the Draggable Desktop Dreamscape.

## Overview

The unified window system is a set of components that provide a consistent interface for creating and managing windows in the application. The system consists of:

- `UnifiedWindowShell`: The core component that handles window behavior
- `WindowShell`: A wrapper that delegates to either `UnifiedWindowShell` or `WindowsWindow` based on theme
- Data-draggable mechanism: A flexible system for defining draggable areas

## Components

### UnifiedWindowShell

The `UnifiedWindowShell` is the main component for creating windows. It provides:

- Drag and resize functionality
- Theme-aware styling
- Focus and active states
- Window controls (minimize, maximize, close)
- Data-draggable mechanism

#### Props

```typescript
interface WindowShellProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  
  // Window state
  zIndex?: number;
  position?: { x: number; y: number };
  size?: { width: number | string; height: number | string };
  isMaximized?: boolean;
  isOpen?: boolean;
  isMinimized?: boolean;
  isFocused?: boolean;
  
  // Window behavior
  active?: boolean;
  activeOnHover?: boolean;
  activeTarget?: "window" | "titlebar";
  
  // Window controls
  controls?: Array<"minimize" | "maximize" | "close">;
  controlsPosition?: "left" | "right";
  
  // Event handlers
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number | string; height: number | string }) => void;
}
```

### WindowShell

The `WindowShell` component is a wrapper that delegates to either `UnifiedWindowShell` or `WindowsWindow` based on the current theme. For Windows themes (win98, winxp, win7), it uses `WindowsWindow`. For all other themes, it uses `UnifiedWindowShell`.

This component will eventually be fully replaced by `UnifiedWindowShell` for all themes.

## Data-Draggable Mechanism

The data-draggable mechanism allows for flexible definition of draggable areas within a window. Any element with the `data-draggable="true"` attribute will be treated as a drag handle.

### Example

```jsx
<div className="my-header" data-draggable="true">
  This entire area can be used to drag the window
</div>

<div className="content">
  <p>This is not draggable</p>
  <div className="drag-handle" data-draggable="true">
    But this area is!
  </div>
</div>
```

## Theme Integration

The unified window system is designed to work with all themes in the application. It preserves:

- Theme-specific active state behavior (Windows themes activate on hover)
- Theme-specific scrollbar styling
- BeOS-specific header behavior when maximized

## Migration Guide

If you're using the old `WindowsWindow` component directly, you should:

1. Switch to using `WindowShell` instead
2. Pass all required props (id, title, position, size, etc.)
3. Add the `data-draggable="true"` attribute to any areas that should be draggable

## Demo

Check out the demo page at `/window-demo` to see the unified window system in action.

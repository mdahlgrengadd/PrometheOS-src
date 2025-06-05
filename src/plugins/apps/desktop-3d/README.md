# Desktop 3D Module

A self-contained 3D desktop environment module that can be dropped into any Vite/Tailwind/React/ShadCN project.

## Features

- 🎯 **3D Desktop Icons** - Interactive icons arranged in various 3D layouts (grid, sphere, helix, table, columns)
- 🪟 **3D Windows** - Draggable, resizable windows with CSS3D transforms
- 🎮 **Camera Controls** - Customizable camera controls with rotation, pan, and zoom
- 🎨 **Animated Layouts** - Smooth transitions between different layout arrangements
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔧 **Highly Configurable** - Extensive customization options

## Installation

1. Copy the `desktop-3d` folder into your `src` directory
2. Install required dependencies:
   ```bash
   npm install three @react-three/fiber @react-three/drei lucide-react zustand
   ```
3. Import the CSS styles in your main app:
   ```tsx
   import './desktop-3d/styles/index.css';
   import './desktop-3d/styles/App.css';
   ```

## Usage

### Basic Usage

```tsx
import { Desktop3D } from './desktop-3d';

function App() {
  return (
    <div className="w-full h-screen">
      <Desktop3D />
    </div>
  );
}
```

### Advanced Usage with Custom Configuration

```tsx
import { Desktop3D, AnimatedDesktopIcons } from './desktop-3d';
import { useRef } from 'react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleIconClick = (title: string, content: React.ReactNode) => {
    console.log('Icon clicked:', title);
  };

  const cameraControls = {
    enabled: true,
    enableRotate: true,
    enablePan: true,
    enableZoom: true,
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 0.8,
  };

  return (
    <div ref={containerRef} className="w-full h-screen">
      <AnimatedDesktopIcons
        containerRef={containerRef}
        onIconClick={handleIconClick}
        maxRandomDelay={400}
        speedVariation={0.5}
        cameraControls={cameraControls}
      />
    </div>
  );
}
```

## Components

### Desktop3D
The main component that provides a complete 3D desktop environment.

### AnimatedDesktopIcons
Standalone component for 3D animated icons with layout switching.

**Props:**
- `containerRef` - React ref to the container element
- `onIconClick` - Callback when an icon is clicked
- `maxRandomDelay` - Maximum random delay for animations (ms)
- `speedVariation` - Speed variation for animations (0-1)
- `cameraControls` - Camera control configuration

### Background3D
Configurable 3D background component.

**Props:**
- `containerRef` - React ref to the container element
- `use3D` - Enable 3D environment rendering
- `environmentFiles` - Custom HDR environment files
- `environmentPath` - Path to environment files

## Camera Controls

```tsx
interface CameraControlOptions {
  enabled?: boolean;          // Enable/disable all controls
  enableRotate?: boolean;     // Enable rotation
  enablePan?: boolean;        // Enable panning
  enableZoom?: boolean;       // Enable zooming
  lockRotationX?: boolean;    // Lock X-axis rotation
  lockRotationY?: boolean;    // Lock Y-axis rotation
  lockRotationZ?: boolean;    // Lock Z-axis rotation
  lockPanX?: boolean;         // Lock X-axis panning
  lockPanY?: boolean;         // Lock Y-axis panning
  minDistance?: number;       // Minimum zoom distance
  maxDistance?: number;       // Maximum zoom distance
  rotateSpeed?: number;       // Rotation speed multiplier
  zoomSpeed?: number;         // Zoom speed multiplier
  panSpeed?: number;          // Pan speed multiplier
}
```

## Layout Types

- **Grid** - Icons arranged in a 3D grid pattern
- **Table** - Periodic table-like layout
- **Sphere** - Icons distributed on a sphere surface
- **Helix** - Spiral arrangement of icons
- **Columns** - Traditional desktop column layout

## Keyboard Shortcuts

- `1` - Switch to Grid layout
- `2` - Switch to Table layout
- `3` - Switch to Sphere layout
- `4` - Switch to Helix layout
- `5` - Switch to Columns layout

## Data Configuration

### Icon Data
Customize icons by modifying `data/iconData.ts`:

```tsx
export const desktopIcons: DesktopIconData[] = [
  { 
    title: "App", 
    description: "My App", 
    stat: "v1.0", 
    gridCoord: [1, 1] 
  },
  // ... more icons
];
```

### Icon Objects (with Lucide icons)
```tsx
export const iconObjects: IconData[] = [
  {
    id: "my-app",
    title: "My App",
    label: "App",
    icon: MyLucideIcon,
    grid: [0, 0],
    color: "#3b82f6",
  },
  // ... more icon objects
];
```

## Styling

The module includes pre-configured styles that work with Tailwind CSS. Key CSS classes:

- `.desktop-3d-container` - Main container
- `.element` - 3D icon elements
- `.desktop-3d-taskbar` - Taskbar styling
- `.desktop-3d-window` - Window styling

## Dependencies

- **React** - ^18.0.0
- **Three.js** - ^0.160.0
- **@react-three/fiber** - ^8.15.0
- **@react-three/drei** - ^9.95.0
- **Lucide React** - ^0.263.0
- **Zustand** - ^4.4.0
- **Tailwind CSS** - ^3.4.0

## Browser Compatibility

- Chrome 51+
- Firefox 45+
- Safari 10+
- Edge 79+

## Performance Tips

1. Limit the number of icons for better performance on lower-end devices
2. Use `speedVariation` and `maxRandomDelay` to create natural-feeling animations
3. Disable camera controls if not needed to improve performance
4. Consider using the non-3D background mode on mobile devices

## Troubleshooting

### Icons not clickable
Ensure the container has `pointer-events: auto` and the icons layer has higher z-index than the background.

### Poor performance
Reduce the number of icons or disable some visual effects like shadows and blur.

### Layout not switching
Check that the target layout has been properly initialized and contains the correct number of targets.

## License

This module is designed to be integrated into existing projects and follows the same license as your host project. 
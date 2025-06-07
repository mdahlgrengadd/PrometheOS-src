import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

import { WindowData } from '../types/Window';

interface WindowLayerProps {
  /** Array of window data to render */
  windows: WindowData[];
  /** CSS3D renderer instance */
  css3dRenderer: CSS3DRenderer | null;
  /** Orthographic camera for 1:1 pixel mapping */
  orthoCamera: THREE.OrthographicCamera | null;
  /** CSS3D scene to add windows to */
  css3dScene: THREE.Scene | null;
  /** Window event handlers */
  onWindowDrag: (
    id: string,
    position: { x: number; y: number; z: number }
  ) => void;
  onWindowClose: (id: string) => void;
  onWindowMinimize: (id: string) => void;
  onWindowMaximize: (id: string) => void;
  onWindowFocus: (id: string) => void;
  /** Callback to trigger CSS3D render */
  renderCSS3D: () => void;
}

interface DragState {
  isDragging: boolean;
  draggedWindowId: string | null;
  dragOffset: { x: number; y: number };
  lastMousePos: { x: number; y: number };
}

/**
 * WindowLayer - Manages CSS3D windows with orthographic camera for pixel-perfect rendering
 *
 * Each window is rendered as a CSS3DObject with HTML content, providing native DOM
 * interaction while maintaining 3D positioning capabilities. Uses orthographic camera
 * for 1:1 pixel mapping between screen and world coordinates.
 */
export const WindowLayer: React.FC<WindowLayerProps> = ({
  windows,
  css3dRenderer,
  orthoCamera,
  css3dScene,
  onWindowDrag,
  onWindowClose,
  onWindowMinimize,
  onWindowMaximize,
  onWindowFocus,
  renderCSS3D,
}) => {
  const windowObjectsRef = useRef<Map<string, CSS3DObject>>(new Map());
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    draggedWindowId: null,
    dragOffset: { x: 0, y: 0 },
    lastMousePos: { x: 0, y: 0 },
  });

  // Track portal containers for each window
  const [portalContainers, setPortalContainers] = useState<
    Map<string, Element>
  >(new Map());
  /**
   * Constrains window position within the viewport bounds
   * CSS3D positioning is center-based, so we need to account for that
   */
  const constrainWindowPosition = useCallback(
    (
      position: { x: number; y: number; z: number },
      size: { width: number; height: number },
      isMaximized = false
    ) => {
      const paddingLeft = 0;
      const paddingRight = 0;
      const paddingTop = 0;
      const paddingBottom = 48; // Space for taskbar

      // For maximized windows, don't constrain - they should fill the screen
      if (isMaximized) {
        return {
          x: position.x,
          y: position.y,
          z: position.z,
        };
      }

      // CSS3D positions based on center of element, so we need to account for half the window size
      const halfWidth = size.width / 2;
      const halfHeight = size.height / 2;

      // Constrain to actual viewport bounds (no artificial offsets)
      const minX = paddingLeft + halfWidth;
      const maxX = window.innerWidth - paddingRight - halfWidth;
      const constrainedX = Math.max(minX, Math.min(maxX, position.x));

      const minY = paddingTop + halfHeight;
      const maxY = window.innerHeight - paddingBottom - halfHeight;
      const constrainedY = Math.max(minY, Math.min(maxY, position.y));

      return {
        x: constrainedX,
        y: constrainedY,
        z: position.z,
      };
    },
    []
  );

  /**
   * Creates a CSS3D window element with interactive controls
   */
  const createCSS3DWindow = useCallback(
    (window: WindowData): CSS3DObject => {
      // Calculate actual window size and position based on maximized state
      const taskbarHeight = 48;
      const actualWidth = window.isMaximized
        ? globalThis.window.innerWidth
        : window.size.width;
      const actualHeight = window.isMaximized
        ? globalThis.window.innerHeight - taskbarHeight
        : window.size.height;

      // Create window container
      const windowElement = document.createElement("div");
      windowElement.style.width = actualWidth + "px";
      windowElement.style.height = actualHeight + "px";
      windowElement.style.background = "rgba(255, 255, 255, 0.95)";
      windowElement.style.backdropFilter = "blur(16px)";
      windowElement.style.borderRadius = window.isMaximized ? "0px" : "12px";
      windowElement.style.border = window.isMaximized
        ? "none"
        : "1px solid rgba(255, 255, 255, 0.3)";
      windowElement.style.boxShadow = window.isMaximized
        ? "none"
        : "0 25px 50px -12px rgba(0, 0, 0, 0.4)";
      windowElement.style.pointerEvents = "auto";
      windowElement.style.overflow = "hidden";
      windowElement.style.fontFamily = "system-ui, sans-serif";

      // Create window header
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.padding = "16px 20px";
      header.style.background =
        "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))";
      header.style.borderBottom = "1px solid rgba(0, 0, 0, 0.1)";
      header.style.cursor = window.isMaximized ? "default" : "grab";

      // Window controls (traffic lights)
      const controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.gap = "8px";

      const controlColors = ["#ff5f57", "#ffbd2e", "#28ca42"];
      const controlActions = [
        () => onWindowClose(window.id),
        () => onWindowMinimize(window.id),
        () => onWindowMaximize(window.id),
      ];

      controlColors.forEach((color, index) => {
        const button = document.createElement("div");
        button.style.width = "14px";
        button.style.height = "14px";
        button.style.borderRadius = "50%";
        button.style.backgroundColor = color;
        button.style.cursor = "pointer";
        button.style.transition = "transform 0.1s ease";

        button.addEventListener("mouseenter", () => {
          button.style.transform = "scale(1.1)";
        });

        button.addEventListener("mouseleave", () => {
          button.style.transform = "scale(1)";
        });

        button.addEventListener("click", (e) => {
          e.stopPropagation();
          controlActions[index]();
        });

        controls.appendChild(button);
      });

      // Window title
      const titleContainer = document.createElement("div");
      titleContainer.style.display = "flex";
      titleContainer.style.alignItems = "center";
      titleContainer.style.gap = "12px";

      const title = document.createElement("span");
      title.textContent = window.title;
      title.style.fontSize = "16px";
      title.style.fontWeight = "600";
      title.style.color = "#1f2937";

      titleContainer.appendChild(controls);
      titleContainer.appendChild(title);

      // Spacer for centering title
      const spacer = document.createElement("div");
      spacer.style.width = "86px"; // Same as controls width

      header.appendChild(titleContainer);
      header.appendChild(spacer);

      // Window content area
      const contentArea = document.createElement("div");
      contentArea.style.padding = "0";
      contentArea.style.height = "calc(100% - 48px)"; // Correct header height: 16px + 16px padding + 14px controls + 2px buffer
      contentArea.style.overflow = "auto";
      contentArea.style.color = "#374151";
      contentArea.style.fontSize = "14px";
      contentArea.style.lineHeight = "1.6";

      // Use the actual window content (PluginWrapper) - will be rendered via portal
      if (window.content && React.isValidElement(window.content)) {
        // Create a container div for React content
        const reactContainer = document.createElement("div");
        reactContainer.style.width = "100%";
        reactContainer.style.height = "100%";
        reactContainer.id = `window-content-${window.id}`; // Unique ID for portal targeting
        contentArea.appendChild(reactContainer);

        // Register the container for portal rendering
        setPortalContainers((prev) => {
          const newMap = new Map(prev);
          newMap.set(window.id, reactContainer);
          return newMap;
        });
      } else {
        // Fallback for windows without React content
        contentArea.innerHTML = `
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">${window.title}</h3>
            <p>Loading ${window.title}...</p>
          </div>
        `;
      }

      // Assemble window
      windowElement.appendChild(header);
      windowElement.appendChild(contentArea);

      // Drag functionality
      const startWindowDrag = (
        mouseX: number,
        mouseY: number,
        windowX: number,
        windowY: number
      ) => {
        if (window.isMaximized) return;

        const dragState = dragStateRef.current;
        dragState.isDragging = true;
        dragState.draggedWindowId = window.id;
        dragState.dragOffset = {
          x: mouseX - windowX,
          y: mouseY - windowY,
        };
        dragState.lastMousePos = { x: windowX, y: windowY };

        header.style.cursor = "grabbing";
        onWindowFocus(window.id);
      };

      header.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (window.isMaximized) return;

        const css3dObject = windowObjectsRef.current.get(window.id);
        if (!css3dObject) return;

        // CSS3D positions are center-based, so we use them directly
        const currentX = css3dObject.position.x;
        const currentY = -css3dObject.position.y; // Convert world Y to screen Y

        // Mouse coordinates are top-left based, but CSS3D expects center-based
        // So we pass screen coordinates directly - the drag logic will handle the conversion
        startWindowDrag(e.clientX, e.clientY, currentX, currentY);
      }); // Create CSS3DObject
      const css3dObject = new CSS3DObject(windowElement);

      // For maximized windows, calculate the center position for full viewport coverage
      let finalPosition;
      if (window.isMaximized) {
        const taskbarHeight = 48;
        const viewportWidth = globalThis.window.innerWidth;
        const viewportHeight = globalThis.window.innerHeight - taskbarHeight;

        // Position the center of the maximized window at the center of the available viewport
        finalPosition = {
          x: viewportWidth / 2,
          y: viewportHeight / 2,
          z: window.position.z,
        };
      } else {
        // Apply position constraints for normal windows
        finalPosition = constrainWindowPosition(
          window.position,
          window.size,
          window.isMaximized
        );
      }

      // Set initial position (convert screen Y to world Y coordinates)
      css3dObject.position.set(
        finalPosition.x,
        -finalPosition.y, // Negative Y for world coordinates
        finalPosition.z
      );

      // Animate window entrance (without conflicting transforms)
      windowElement.style.opacity = "0";
      windowElement.style.transition =
        "opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

      requestAnimationFrame(() => {
        windowElement.style.opacity = "1";
      });
      return css3dObject;
    },
    [
      onWindowClose,
      onWindowMinimize,
      onWindowMaximize,
      onWindowFocus,
      constrainWindowPosition,
    ]
  );
  /**
   * Update or create CSS3D windows based on window data
   */
  useEffect(() => {
    if (!css3dScene) {
      return;
    } // Remove windows that no longer exist
    const existingIds = new Set(windows.map((w) => w.id));
    const objectsToRemove: string[] = [];

    windowObjectsRef.current.forEach((css3dObject, id) => {
      if (!existingIds.has(id)) {
        css3dScene.remove(css3dObject);
        objectsToRemove.push(id);
      }
    });

    objectsToRemove.forEach((id) => {
      windowObjectsRef.current.delete(id);
      // Remove portal container
      setPortalContainers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    });

    // Add or update windows
    windows.forEach((window) => {
      if (window.isMinimized) {
        // Remove minimized windows from scene
        const existingObject = windowObjectsRef.current.get(window.id);
        if (existingObject) {
          css3dScene.remove(existingObject);
          windowObjectsRef.current.delete(window.id);
        }
        return;
      }

      const existingObject = windowObjectsRef.current.get(window.id);

      if (!existingObject) {
        // Create new window
        const css3dObject = createCSS3DWindow(window);
        css3dScene.add(css3dObject);
        windowObjectsRef.current.set(window.id, css3dObject);
      } else {
        // Update existing window position if not being dragged
        if (dragStateRef.current.draggedWindowId !== window.id) {
          existingObject.position.set(
            window.position.x,
            -window.position.y,
            window.position.z
          );
        }

        // Update window size for maximized state
        const currentWidth = parseInt(existingObject.element.style.width);
        const currentHeight = parseInt(existingObject.element.style.height);

        // Calculate expected width and height based on maximized state
        const taskbarHeight = 48;
        const expectedWidth = window.isMaximized
          ? globalThis.window.innerWidth
          : window.size.width;
        const expectedHeight = window.isMaximized
          ? globalThis.window.innerHeight - taskbarHeight
          : window.size.height;

        if (
          currentWidth !== expectedWidth ||
          currentHeight !== expectedHeight
        ) {
          // Recreate window with new size
          css3dScene.remove(existingObject);
          const newObject = createCSS3DWindow(window);
          css3dScene.add(newObject);
          windowObjectsRef.current.set(window.id, newObject);
        }
      }
    });

    // Trigger render
    renderCSS3D();
  }, [windows, css3dScene, createCSS3DWindow, renderCSS3D]);

  /**
   * Global mouse event handlers for smooth window dragging
   */
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging || !dragState.draggedWindowId) return;

      const window = windows.find((w) => w.id === dragState.draggedWindowId);
      if (window?.isMaximized) {
        dragState.isDragging = false;
        dragState.draggedWindowId = null;
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const css3dObject = windowObjectsRef.current.get(
        dragState.draggedWindowId
      );
      if (css3dObject && window) {
        // Calculate new position using mouse coordinates (which are consistent)
        const newX = e.clientX - dragState.dragOffset.x;
        const newY = e.clientY - dragState.dragOffset.y;

        // Constrain the position (constrainWindowPosition expects center-based coordinates)
        const constrainedPosition = constrainWindowPosition(
          { x: newX, y: newY, z: css3dObject.position.z },
          window.size,
          window.isMaximized
        );

        // Set CSS3D position (Y is negated for world coordinates)
        css3dObject.position.set(
          constrainedPosition.x,
          -constrainedPosition.y, // Convert to world coordinates
          css3dObject.position.z
        );

        // Store screen coordinates for consistency
        dragState.lastMousePos = {
          x: constrainedPosition.x,
          y: constrainedPosition.y,
        };

        renderCSS3D();
      }
    };

    const handleGlobalMouseUp = () => {
      const dragState = dragStateRef.current;
      if (dragState.isDragging && dragState.draggedWindowId) {
        const css3dObject = windowObjectsRef.current.get(
          dragState.draggedWindowId
        );
        const actualZ = css3dObject ? css3dObject.position.z : 0;

        onWindowDrag(dragState.draggedWindowId, {
          x: dragState.lastMousePos.x,
          y: dragState.lastMousePos.y,
          z: actualZ,
        });

        dragState.isDragging = false;
        dragState.draggedWindowId = null;

        // Reset cursor
        const draggedWindow = windowObjectsRef.current.get(
          dragState.draggedWindowId
        );
        if (draggedWindow) {
          const header = draggedWindow.element.querySelector(
            "div"
          ) as HTMLElement;
          if (header) {
            header.style.cursor = "grab";
          }
        }
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [windows, onWindowDrag, constrainWindowPosition, renderCSS3D]);

  // Render React content via portals to maintain context access
  return (
    <>
      {windows.map((window) => {
        const container = portalContainers.get(window.id);
        if (
          !container ||
          !window.content ||
          !React.isValidElement(window.content)
        ) {
          return null;
        }

        // Render the React content into the CSS3D container via portal
        return createPortal(window.content, container, `window-${window.id}`);
      })}
    </>
  );
};

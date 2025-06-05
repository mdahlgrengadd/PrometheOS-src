import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";

import { useWindowStore } from "../stores/windowStore";
import { WindowData } from "../types/Window";
import AnimatedDesktopIcons, {
  AnimatedDesktopIconsRef,
} from "./AnimatedDesktopIcons";
import Background3D from "./Background3D";
import Taskbar from "./Taskbar";
import Window3D from "./Window3D";

// Import the CameraControlOptions interface
interface CameraControlOptions {
  enabled?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  lockRotationX?: boolean;
  lockRotationY?: boolean;
  lockRotationZ?: boolean;
  lockPanX?: boolean;
  lockPanY?: boolean;
  minDistance?: number;
  maxDistance?: number;
  rotateSpeed?: number;
  zoomSpeed?: number;
  panSpeed?: number;
}

const Desktop3D: React.FC = () => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [currentLayout, setCurrentLayout] = useState<
    "table" | "sphere" | "helix" | "grid" | "columns"
  >("grid");
  const [animationRandomness, setAnimationRandomness] = useState({
    maxRandomDelay: 400,
    speedVariation: 0.5,
  });

  // Zustand store for window positions
  const {
    updateWindowPosition,
    updateWindowState,
    getWindowPosition,
    getWindowState,
    removeWindow,
  } = useWindowStore();

  // Camera control state
  const [cameraControls, setCameraControls] = useState<CameraControlOptions>({
    enabled: true,
    enableRotate: true,
    enablePan: true,
    enableZoom: true,
    lockRotationX: false,
    lockRotationY: false,
    lockRotationZ: true,
    lockPanX: false,
    lockPanY: false,
    minDistance: 500,
    maxDistance: 6000,
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 0.2,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<CSS3DRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const windowObjectsRef = useRef<Map<string, CSS3DObject>>(new Map());
  const animationFrameRef = useRef<number>();
  const iconsRef = useRef<AnimatedDesktopIconsRef>(null);
  const windowsRef = useRef<WindowData[]>(windows);

  // Keep windows ref updated
  useEffect(() => {
    windowsRef.current = windows;
    console.log(
      `[Desktop3D] windowsRef.current updated, total windows: ${windows.length}`
    );
    windows.forEach((w) => {
      console.log(
        `[Desktop3D] - Window ${w.id}: minimized=${w.isMinimized}, maximized=${w.isMaximized}`
      );
    });
  }, [windows]);

  // Drag state refs for performance
  const dragStateRef = useRef<{
    isDragging: boolean;
    draggedWindowId: string | null;
    dragOffset: { x: number; y: number };
    lastMousePos: { x: number; y: number };
  }>({
    isDragging: false,
    draggedWindowId: null,
    dragOffset: { x: 0, y: 0 },
    lastMousePos: { x: 0, y: 0 },
  });

  const createCamera = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cam = new THREE.OrthographicCamera(
      0, // left
      w, // right
      0, // top
      -h, // bottom (negative for Y-up coordinate system)
      0,
      10000
    );
    cam.position.z = 1000;
    return cam;
  };
  useEffect(() => {
    if (!containerRef.current) return;

    // Capture container ref to avoid stale closure warnings
    const container = containerRef.current;

    // Helper function to get current camera frustum bounds
    const getCameraFrustumBounds = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return {
        left: 0,
        right: w,
        top: 0,
        bottom: -h, // Negative for Y-up coordinate system
      };
    };

    // Helper function to constrain window position within camera frustum
    const constrainWindowPosition = (
      position: { x: number; y: number; z: number },
      size: { width: number; height: number }
    ) => {
      const bounds = getCameraFrustumBounds();

      // Individual padding for each edge
      const paddingLeft = 0; // Left edge padding
      const paddingRight = 0; // Right edge padding
      const paddingTop = 0; // Top edge padding
      const paddingBottom = 48; // Bottom edge padding (extra space for taskbar)

      // Add offsets to align constraint area with actual visible viewport
      // The CSS3DRenderer appears to have an offset from the theoretical camera frustum
      const offsetX = 300; // horizontal offset needed
      const offsetY = 200; // vertical offset needed for screen coordinates

      // Constrain X position (considering window width and individual left/right padding)
      const minX = bounds.left + paddingLeft + offsetX;
      const maxX = bounds.right - size.width - paddingRight + offsetX;
      const constrainedX = Math.max(minX, Math.min(maxX, position.x));

      // Constrain Y position (screen coordinates: top=0, bottom=positive)
      // The viewport constraint should match actual screen coordinates with individual top/bottom padding
      const minY = paddingTop + offsetY; // Top edge in screen coordinates
      const maxY = window.innerHeight - size.height - paddingBottom + offsetY; // Bottom edge with taskbar padding
      const constrainedY = Math.max(minY, Math.min(maxY, position.y));

      return {
        x: constrainedX,
        y: constrainedY,
        z: position.z,
      };
    };

    // Initialize Three.js scene for windows only
    const scene = new THREE.Scene();
    const camera = createCamera();

    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0"; // Align renderer to container origin
    renderer.domElement.style.zIndex = "2"; // Above icons layer
    renderer.domElement.style.pointerEvents = "none"; // Only allow pointer events on actual windows
    container.appendChild(renderer.domElement);
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Capture refs that will be used in cleanup
    const windowObjectsMap = windowObjectsRef.current;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Global mouse handlers for smooth dragging
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging || !dragState.draggedWindowId) return;

      // Check if the window being dragged is maximized - if so, stop dragging
      const draggedWindow = windowsRef.current.find(
        (w) => w.id === dragState.draggedWindowId
      );
      if (draggedWindow && draggedWindow.isMaximized) {
        dragState.isDragging = false;
        dragState.draggedWindowId = null;
        return;
      }

      // Prevent event from reaching other elements during drag
      e.stopPropagation();
      e.preventDefault();

      const css3dObject = windowObjectsRef.current.get(
        dragState.draggedWindowId
      );
      if (css3dObject) {
        const newX = e.clientX - dragState.dragOffset.x;
        const newY = e.clientY - dragState.dragOffset.y;

        // Find the window data to get its size for constraint calculation
        const windowData = windowsRef.current.find(
          (w) => w.id === dragState.draggedWindowId
        );
        if (windowData) {
          // Constrain the position within camera frustum
          const constrainedPosition = constrainWindowPosition(
            { x: newX, y: newY, z: css3dObject.position.z },
            windowData.size
          );

          // Re-invert Y when converting screen to world coordinates
          css3dObject.position.set(
            constrainedPosition.x,
            -constrainedPosition.y,
            css3dObject.position.z
          );

          // Store final position for state sync (keep DOM coordinates)
          dragState.lastMousePos = {
            x: constrainedPosition.x,
            y: constrainedPosition.y,
          };
        } else {
          // Fallback to unconstrained positioning if window data not found
          css3dObject.position.set(newX, -newY, css3dObject.position.z);
          dragState.lastMousePos = { x: newX, y: newY };
        }
      }
    };
    const handleGlobalMouseUp = () => {
      const dragState = dragStateRef.current;
      if (dragState.isDragging && dragState.draggedWindowId) {
        // Get the actual Z coordinate from the CSS3D object
        const css3dObject = windowObjectsRef.current.get(
          dragState.draggedWindowId
        );
        const actualZ = css3dObject ? css3dObject.position.z : 0;

        console.log(
          `[Desktop3D] Drag ended for window ${dragState.draggedWindowId}:`
        );
        console.log(
          `[Desktop3D] - Final drag position:`,
          dragState.lastMousePos
        );
        console.log(`[Desktop3D] - CSS3D Z coordinate:`, actualZ);

        // Update Zustand store with final position including correct Z
        updateWindowPosition(dragState.draggedWindowId, {
          x: dragState.lastMousePos.x,
          y: dragState.lastMousePos.y,
          z: actualZ,
        }); // Sync final position with React state
        setWindows((prev) =>
          prev.map((win) =>
            win.id === dragState.draggedWindowId
              ? {
                  ...win,
                  position: {
                    x: dragState.lastMousePos.x,
                    y: dragState.lastMousePos.y,
                    z: actualZ, // Use the same Z coordinate as in Zustand store
                  },
                }
              : win
          )
        );

        dragState.isDragging = false;
        dragState.draggedWindowId = null;

        // Re-enable pointer events on the icons renderer after drag ends
        const iconsRenderer = document.querySelector(
          '[style*="z-index: 1"]'
        ) as HTMLElement;
        if (iconsRenderer) {
          iconsRenderer.style.pointerEvents = "auto";
        }
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.left = 0;
      camera.right = w;
      camera.top = 0;
      camera.bottom = -h; // negative for Y-up coordinate system
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Constrain all existing windows to stay within new viewport bounds
      setWindows((prev) =>
        prev.map((win) => {
          const padding = 20;
          const minX = padding;
          const maxX = w - win.size.width - padding;
          const minY = padding;
          const maxY = h - win.size.height - padding;

          const constrainedPosition = {
            x: Math.max(minX, Math.min(maxX, win.position.x)),
            y: Math.max(minY, Math.min(maxY, win.position.y)),
            z: win.position.z,
          };

          // Update CSS3D object position if it exists
          const css3dObject = windowObjectsRef.current.get(win.id);
          if (css3dObject) {
            css3dObject.position.set(
              constrainedPosition.x,
              -constrainedPosition.y,
              constrainedPosition.z
            );
          }

          return {
            ...win,
            position: constrainedPosition,
          };
        })
      );
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      } // Capture refs at cleanup time to avoid stale closure warnings
      const currentRenderer = rendererRef.current;
      const currentScene = sceneRef.current; // Clean up all CSS3D objects
      windowObjectsMap.forEach((css3dObject) => {
        try {
          if (currentScene) {
            currentScene.remove(css3dObject);
          }
          // The element was created independently, so we can safely remove it
          if (css3dObject.element && css3dObject.element.parentNode) {
            css3dObject.element.parentNode.removeChild(css3dObject.element);
          }
        } catch (error) {
          // Silently handle object removal errors
        }
      });
      windowObjectsMap.clear(); // Clean up renderer
      if (currentRenderer && container) {
        try {
          if (currentRenderer.domElement.parentNode === container) {
            container.removeChild(currentRenderer.domElement);
          }
        } catch (error) {
          // Silently handle renderer removal errors
        }
      }
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, [updateWindowPosition]);

  // Use ref to avoid dependency chain that causes AnimatedDesktopIcons to reinitialize
  const nextZIndexRef = useRef(nextZIndex);
  nextZIndexRef.current = nextZIndex;

  const createWindow = useCallback(
    (title: string, content: React.ReactNode) => {
      const padding = 32; // keep away from edges
      const winW = 600;
      const winH = 400;
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;

      // Individual padding for each edge (matching constrainWindowPosition)
      const paddingLeft = 0; // Left edge padding
      const paddingRight = 0; // Right edge padding
      const paddingTop = 0; // Top edge padding
      const paddingBottom = 48; // Bottom edge padding (extra space for taskbar)

      // Add offsets to align initial position with actual visible viewport
      // These values match the offsets used in constrainWindowPosition
      const offsetX = 300; // horizontal offset needed
      const offsetY = 200; // vertical offset needed

      // Generate initial random position within safe bounds
      const newWindow: WindowData = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        position: {
          x: Math.max(
            paddingLeft + offsetX,
            Math.min(
              viewportW - winW - paddingRight + offsetX,
              Math.random() *
                (viewportW - winW - paddingLeft - paddingRight + offsetX) +
                paddingLeft +
                offsetX
            )
          ),
          y: Math.max(
            paddingTop + offsetY,
            Math.min(
              viewportH - winH - paddingBottom + offsetY,
              Math.random() *
                (viewportH - winH - paddingTop - paddingBottom + offsetY) +
                paddingTop +
                offsetY
            )
          ),
          z: 0,
        },
        size: {
          width: winW,
          height: winH,
        },
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZIndexRef.current,
      };
      try {
        setWindows((prev) => {
          const newState = [...prev, newWindow];
          return newState;
        });
        setNextZIndex((prev) => {
          return prev + 1;
        }); // Initialize window state in Zustand store
        updateWindowState(newWindow.id, {
          position: newWindow.position,
          isMaximized: false,
        });
      } catch (error) {
        // Silently handle creation errors
      }
    },
    [updateWindowState] // Add updateWindowState to dependencies
  );
  const handleLayoutChange = useCallback(
    (layout: "table" | "sphere" | "helix" | "grid" | "columns") => {
      setCurrentLayout(layout);
      if (iconsRef.current) {
        iconsRef.current.switchLayout(layout);
      }
    },
    []
  );
  const handleRandomnessChange = useCallback(
    (randomness: { maxRandomDelay: number; speedVariation: number }) => {
      setAnimationRandomness(randomness);
    },
    []
  );

  const startWindowDrag = useCallback(
    (
      windowId: string,
      mouseX: number,
      mouseY: number,
      windowX: number,
      windowY: number
    ) => {
      const dragState = dragStateRef.current;
      dragState.isDragging = true;
      dragState.draggedWindowId = windowId;
      dragState.dragOffset = {
        x: mouseX - windowX,
        y: mouseY - windowY,
      };
      dragState.lastMousePos = { x: windowX, y: windowY };

      // Temporarily disable pointer events on the icons renderer during drag
      const iconsRenderer = document.querySelector(
        '[style*="z-index: 1"]'
      ) as HTMLElement;
      if (iconsRenderer) {
        iconsRenderer.style.pointerEvents = "none";
      }

      // Bring window to front
      handleWindowFocus(windowId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleWindowDrag = useCallback(
    (id: string, position: { x: number; y: number; z: number }) => {
      setWindows((prev) =>
        prev.map((win) => (win.id === id ? { ...win, position } : win))
      );

      // Update CSS3D object position - re-invert Y when converting screen to world
      const css3dObject = windowObjectsRef.current.get(id);
      if (css3dObject) {
        css3dObject.position.set(position.x, -position.y, position.z);
      }
    },
    []
  );

  const createCSS3DWindow = useCallback(
    (window: WindowData) => {
      if (!sceneRef.current) {
        return;
      }

      // Create a completely independent DOM element for CSS3D
      const windowElement = document.createElement("div");
      windowElement.style.width = window.size.width + "px";
      windowElement.style.height = window.size.height + "px";
      windowElement.style.background = "rgba(255, 255, 255, 0.9)";
      windowElement.style.backdropFilter = "blur(12px)";
      windowElement.style.borderRadius = "8px";
      windowElement.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      windowElement.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
      windowElement.style.pointerEvents = "auto";

      // Create window header
      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.padding = "12px";
      header.style.background =
        "linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))";
      header.style.borderRadius = "8px 8px 0 0";
      header.style.cursor = window.isMaximized ? "default" : "grab";

      // Create window controls
      const controls = document.createElement("div");
      controls.style.display = "flex";
      controls.style.gap = "4px";

      ["#ef4444", "#eab308", "#22c55e"].forEach((color, index) => {
        const button = document.createElement("div");
        button.style.width = "12px";
        button.style.height = "12px";
        button.style.borderRadius = "50%";
        button.style.backgroundColor = color;
        button.style.cursor = "pointer";
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          if (index === 0) handleWindowClose(window.id);
          else if (index === 1) handleWindowMinimize(window.id);
          else if (index === 2) handleWindowMaximize(window.id);
        });
        controls.appendChild(button);
      });

      // Create title
      const title = document.createElement("span");
      title.textContent = window.title;
      title.style.fontSize = "14px";
      title.style.fontWeight = "500";
      title.style.color = "#1f2937";
      title.style.marginLeft = "8px";

      const headerLeft = document.createElement("div");
      headerLeft.style.display = "flex";
      headerLeft.style.alignItems = "center";
      headerLeft.appendChild(controls);
      headerLeft.appendChild(title);

      header.appendChild(headerLeft);

      // Create content area
      const contentArea = document.createElement("div");
      contentArea.style.padding = "16px";
      contentArea.style.height = "calc(100% - 60px)";
      contentArea.style.overflow = "auto";
      contentArea.innerHTML = `<div style="color: #1f2937; font-size: 14px;">3D View of ${window.title}</div>`;

      windowElement.appendChild(header);
      windowElement.appendChild(contentArea);

      // Fixed drag functionality - read live position from CSS3D object
      header.addEventListener("mousedown", (e) => {
        e.preventDefault();

        // Don't allow dragging if window is maximized
        if (window.isMaximized) {
          return;
        }

        header.style.cursor = "grabbing";

        // Get the live position from the CSS3D object instead of stale React state
        const obj = windowObjectsRef.current.get(window.id);
        if (!obj) return;

        // Convert world Y back to screen Y for drag calculations
        const currentX = obj.position.x;
        const currentY = -obj.position.y;

        startWindowDrag(window.id, e.clientX, e.clientY, currentX, currentY);
      });

      const css3dObject = new CSS3DObject(windowElement);

      // Set initial opacity to 0 for transition effect
      windowElement.style.opacity = "0";

      // Starting position: offset below target position with smaller scale
      const targetX = window.position.x;
      const targetY = -window.position.y;
      const targetZ = window.position.z;
      const startY = targetY - 100; // Start 100px below target (half distance)
      const startScale = 0.75; // Start at 75% scale
      const endScale = 1.0; // End at full scale

      // Set initial position and scale
      css3dObject.position.set(targetX, startY, targetZ);
      css3dObject.scale.setScalar(startScale);

      windowObjectsRef.current.set(window.id, css3dObject);
      sceneRef.current.add(css3dObject);

      // Animate window transition in
      const startTime = Date.now();
      const duration = 400; // 400ms transition (twice as fast)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      // Springy bounce easing for scale
      const easeOutBounce = (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      };

      const animateWindowIn = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const bounceProgress = easeOutBounce(progress);

        // Animate position from below to target (smooth ease)
        const currentY = startY + (targetY - startY) * easedProgress;
        css3dObject.position.setY(currentY);

        // Animate scale with springy bounce effect
        const currentScale =
          startScale + (endScale - startScale) * bounceProgress;
        css3dObject.scale.setScalar(currentScale);

        // Animate opacity from 0 to 1 (smooth ease)
        windowElement.style.opacity = easedProgress.toString();

        if (progress < 1) {
          requestAnimationFrame(animateWindowIn);
        }
      };

      // Start the animation
      requestAnimationFrame(animateWindowIn);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startWindowDrag]
  );
  const updateWindowInScene = useCallback(
    (window: WindowData) => {
      const existingObject = windowObjectsRef.current.get(window.id);

      if (!existingObject) {
        console.log(`[Desktop3D] Creating CSS3D window for ${window.id}:`);
        console.log(`[Desktop3D] - Window isMinimized:`, window.isMinimized);
        console.log(`[Desktop3D] - Window position:`, window.position);
        try {
          createCSS3DWindow(window);
        } catch (error) {
          // Silently handle creation errors
        }
      } else {
        // Only update if not currently being dragged
        if (dragStateRef.current.draggedWindowId !== window.id) {
          console.log(
            `[Desktop3D] Updating existing CSS3D window ${window.id} position to:`,
            window.position
          );
          existingObject.position.set(
            window.position.x,
            -window.position.y,
            window.position.z
          );
        }

        // Update size for maximized windows by recreating the window element
        // Also check if the current DOM element size doesn't match the expected size
        const currentWidth = parseInt(existingObject.element.style.width);
        const currentHeight = parseInt(existingObject.element.style.height);
        const needsRecreation =
          window.isMaximized ||
          currentWidth !== window.size.width ||
          currentHeight !== window.size.height;

        if (needsRecreation) {
          console.log(
            `[Desktop3D] Recreating window ${window.id} - isMaximized: ${
              window.isMaximized
            }, size mismatch: ${
              currentWidth !== window.size.width ||
              currentHeight !== window.size.height
            }`
          );
          // Remove the old object and create a new one with the correct size
          if (sceneRef.current) {
            sceneRef.current.remove(existingObject);
            // Clean up the DOM element
            if (existingObject.element && existingObject.element.parentNode) {
              existingObject.element.parentNode.removeChild(
                existingObject.element
              );
            }
            windowObjectsRef.current.delete(window.id);
            // Create new window with maximized size
            createCSS3DWindow(window);
          }
        }
      }
    },
    [createCSS3DWindow]
  );
  const removeWindowFromScene = useCallback((windowId: string) => {
    const css3dObject = windowObjectsRef.current.get(windowId);
    if (css3dObject && sceneRef.current) {
      try {
        sceneRef.current.remove(css3dObject);
        // Clean up the DOM element we created
        if (css3dObject.element && css3dObject.element.parentNode) {
          css3dObject.element.parentNode.removeChild(css3dObject.element);
        }
        windowObjectsRef.current.delete(windowId);
      } catch (error) {
        // Silently handle removal errors
      }
    }
  }, []);
  const handleWindowClose = useCallback(
    (id: string) => {
      removeWindowFromScene(id);
      removeWindow(id); // Remove from Zustand store
      setWindows((prev) => prev.filter((win) => win.id !== id));
    },
    [removeWindowFromScene, removeWindow]
  );
  const handleWindowMinimize = useCallback(
    (id: string) => {
      console.log(`[Desktop3D] Minimizing window ${id}`);

      // Get the most recent position from Zustand store (which gets updated on drag end)
      const storedPosition = getWindowPosition(id);
      console.log(`[Desktop3D] Stored position from Zustand:`, storedPosition);

      // Get the current actual position from the CSS3D object (which reflects dragged position)
      const css3dObject = windowObjectsRef.current.get(id);
      console.log(
        `[Desktop3D] CSS3D object for window ${id}:`,
        css3dObject?.position
      );

      // Use windowsRef.current to get the most up-to-date window data
      const currentWindow = windowsRef.current.find((w) => w.id === id);
      const currentActualPosition =
        storedPosition ||
        (css3dObject
          ? {
              x: css3dObject.position.x,
              y: -css3dObject.position.y,
              z: css3dObject.position.z,
            }
          : currentWindow?.position || { x: 0, y: 0, z: 0 });
      console.log(
        `[Desktop3D] Current actual position for window ${id}:`,
        currentActualPosition
      );
      console.log(
        `[Desktop3D] Window state position before minimize:`,
        currentWindow?.position
      );
      console.log(
        `[Desktop3D] Window is maximized:`,
        currentWindow?.isMaximized
      );

      // Update store to preserve maximize state and position
      const stateToStore = {
        position: currentActualPosition,
        isMaximized: currentWindow?.isMaximized || false,
        originalState: currentWindow?.originalState,
      };
      console.log(`[Desktop3D] Storing window state for ${id}:`, stateToStore);
      updateWindowState(id, stateToStore);

      // Update React state
      setWindows((prev) =>
        prev.map((win) => {
          if (win.id !== id) return win;
          return {
            ...win,
            isMinimized: true,
            position: currentActualPosition,
          };
        })
      );

      removeWindowFromScene(id);
    },
    [removeWindowFromScene, updateWindowState, getWindowPosition]
  );
  const handleWindowMaximize = useCallback(
    (id: string) => {
      setWindows((prev) =>
        prev.map((win) => {
          if (win.id !== id) return win;
          if (!win.isMaximized) {
            // Get the current actual position from the CSS3D object (which reflects dragged position)
            const css3dObject = windowObjectsRef.current.get(id);
            const currentActualPosition = css3dObject
              ? {
                  x: css3dObject.position.x,
                  y: -css3dObject.position.y,
                  z: css3dObject.position.z,
                }
              : win.position;

            // Store original state before maximizing using actual dragged position
            const originalState = {
              position: currentActualPosition,
              size: { ...win.size },
            };

            // Update Zustand store with maximize state and original state
            updateWindowState(id, {
              position: currentActualPosition,
              isMaximized: true,
              originalState,
            });

            // Calculate maximized dimensions with padding
            const paddingLeft = 0;
            const paddingRight = 0;
            const paddingTop = 0;
            const paddingBottom = 48; // Extra space for taskbar
            const offsetX = 300;
            const offsetY = 200;

            const maxWidth = window.innerWidth - paddingLeft - paddingRight;
            const maxHeight = window.innerHeight - paddingTop - paddingBottom;

            // Calculate center position for CSS3D (since CSS3D positions from center)
            // Apply additional offsets to align with visible area
            const centerX = paddingLeft + offsetX + maxWidth / 2 - 300; // -300 offset on the left
            const centerY = paddingTop + offsetY + maxHeight / 2 - 200; // -200 offset on the top

            // Update Zustand store again with the final maximized position
            const maximizedPosition = {
              x: centerX,
              y: centerY,
              z: win.position.z,
            };
            updateWindowState(id, {
              position: maximizedPosition,
              isMaximized: true,
              originalState,
            });

            return {
              ...win,
              isMaximized: true,
              originalState, // Store original state for restoration
              position: maximizedPosition,
              size: {
                width: maxWidth,
                height: maxHeight,
              },
            };
          } else {
            // Restore from maximized state - recreate CSS3D object immediately
            const restoredWindow: WindowData = {
              ...win,
              isMaximized: false,
              position: win.originalState?.position || win.position,
              size: win.originalState?.size || win.size,
              originalState: undefined, // Clear stored state
            };

            // Clear maximize state in Zustand store
            updateWindowState(id, {
              position: restoredWindow.position,
              isMaximized: false,
              originalState: undefined,
            });

            // Remove old object and recreate with restored state
            removeWindowFromScene(id);
            createCSS3DWindow(restoredWindow);
            return restoredWindow;
          }
        })
      );

      // Force immediate recreation of the CSS3D window with maximized size
      // Use setTimeout to ensure React state is updated first
      setTimeout(() => {
        const existingObject = windowObjectsRef.current.get(id);
        if (existingObject && sceneRef.current) {
          sceneRef.current.remove(existingObject);
          if (existingObject.element && existingObject.element.parentNode) {
            existingObject.element.parentNode.removeChild(
              existingObject.element
            );
          }
          windowObjectsRef.current.delete(id);
        }

        // Get the updated window data
        const updatedWindow = windowsRef.current.find((w) => w.id === id);
        if (updatedWindow) {
          createCSS3DWindow(updatedWindow);
        }
      }, 0);
    },
    [removeWindowFromScene, createCSS3DWindow, updateWindowState]
  );

  const handleWindowFocus = useCallback(
    (id: string) => {
      setWindows((prev) =>
        prev.map((win) =>
          win.id === id ? { ...win, zIndex: nextZIndex } : win
        )
      );
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );
  const handleWindowRestore = useCallback(
    (id: string) => {
      setWindows((prev) =>
        prev.map((win) => {
          if (win.id === id) {
            // Check if window was maximized before minimizing
            const storedState = getWindowState(id);

            if (storedState?.isMaximized) {
              // Window was maximized - restore to maximized state
              const paddingLeft = 0;
              const paddingRight = 0;
              const paddingTop = 0;
              const paddingBottom = 48; // Extra space for taskbar
              const offsetX = 300;
              const offsetY = 200;

              const maxWidth = window.innerWidth - paddingLeft - paddingRight;
              const maxHeight = window.innerHeight - paddingTop - paddingBottom;

              // Calculate center position for CSS3D (since CSS3D positions from center)
              const centerX = paddingLeft + offsetX + maxWidth / 2 - 300;
              const centerY = paddingTop + offsetY + maxHeight / 2 - 200;

              return {
                ...win,
                isMinimized: false,
                isMaximized: true,
                zIndex: nextZIndex,
                position: {
                  x: centerX,
                  y: centerY,
                  z: storedState.position.z,
                },
                size: {
                  width: maxWidth,
                  height: maxHeight,
                },
                originalState: storedState.originalState,
              };
            } else {
              // Window was not maximized - restore to normal position
              const restorePosition = storedState?.position || win.position;

              return {
                ...win,
                isMinimized: false,
                zIndex: nextZIndex,
                position: restorePosition,
              };
            }
          }
          return win;
        })
      );
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex, getWindowState]
  );
  const handleWindowToggle = useCallback(
    (id: string) => {
      console.log(`[Desktop3D] Toggling window ${id}`);
      const currentWindow = windowsRef.current.find((w) => w.id === id);

      if (currentWindow?.isMinimized) {
        // Restore the window - check if it was maximized before minimizing
        const storedState = getWindowState(id);
        console.log(`[Desktop3D] Restoring window ${id}:`);
        console.log(`[Desktop3D] - Stored state:`, storedState);
        console.log(`[Desktop3D] - Current window state:`, currentWindow);

        if (storedState?.isMaximized) {
          // Window was maximized before being minimized - restore to maximized state
          console.log(`[Desktop3D] - Restoring to maximized state`);

          // Calculate maximized dimensions with padding
          const paddingLeft = 0;
          const paddingRight = 0;
          const paddingTop = 0;
          const paddingBottom = 48; // Extra space for taskbar
          const offsetX = 300;
          const offsetY = 200;

          const maxWidth = window.innerWidth - paddingLeft - paddingRight;
          const maxHeight = window.innerHeight - paddingTop - paddingBottom;

          // Calculate center position for CSS3D (since CSS3D positions from center)
          const centerX = paddingLeft + offsetX + maxWidth / 2 - 300;
          const centerY = paddingTop + offsetY + maxHeight / 2 - 200;

          setWindows((prev) =>
            prev.map((win) => {
              if (win.id !== id) return win;
              return {
                ...win,
                isMinimized: false,
                isMaximized: true,
                zIndex: nextZIndex,
                position: {
                  x: centerX,
                  y: centerY,
                  z: storedState.position.z,
                },
                size: {
                  width: maxWidth,
                  height: maxHeight,
                },
                originalState: storedState.originalState,
              };
            })
          );

          // Force immediate recreation of the CSS3D window with maximized size
          // Use setTimeout to ensure React state is updated first
          setTimeout(() => {
            const existingObject = windowObjectsRef.current.get(id);
            if (existingObject && sceneRef.current) {
              sceneRef.current.remove(existingObject);
              if (existingObject.element && existingObject.element.parentNode) {
                existingObject.element.parentNode.removeChild(
                  existingObject.element
                );
              }
              windowObjectsRef.current.delete(id);
            }

            // Get the updated window data
            const updatedWindow = windowsRef.current.find((w) => w.id === id);
            if (updatedWindow) {
              createCSS3DWindow(updatedWindow);
            }
          }, 0);
        } else {
          // Window was not maximized - restore to normal position
          const restorePosition =
            storedState?.position || currentWindow.position;
          console.log(
            `[Desktop3D] - Restoring to normal position:`,
            restorePosition
          );

          setWindows((prev) =>
            prev.map((win) => {
              if (win.id !== id) return win;
              return {
                ...win,
                isMinimized: false,
                zIndex: nextZIndex,
                position: restorePosition,
              };
            })
          );
        }
      } else {
        // Minimize the window - preserve maximize state in store
        const storedState = getWindowState(id);
        console.log(
          `[Desktop3D] Minimizing window ${id} via toggle. Current state:`,
          storedState
        );

        // Get current position from CSS3D object as fallback
        const css3dObject = windowObjectsRef.current.get(id);
        const currentActualPosition =
          storedState?.position ||
          (css3dObject
            ? {
                x: css3dObject.position.x,
                y: -css3dObject.position.y,
                z: css3dObject.position.z,
              }
            : currentWindow?.position || { x: 0, y: 0, z: 0 });

        console.log(
          `[Desktop3D] - CSS3D object position:`,
          css3dObject?.position
        );
        console.log(
          `[Desktop3D] - Current actual position:`,
          currentActualPosition
        );
        console.log(
          `[Desktop3D] - Current window maximized:`,
          currentWindow?.isMaximized
        );

        // Update store to preserve maximize state and position
        const stateToStore = {
          position: currentActualPosition,
          isMaximized: currentWindow?.isMaximized || false,
          originalState: currentWindow?.originalState,
        };
        console.log(
          `[Desktop3D] Storing window state for ${id}:`,
          stateToStore
        );
        updateWindowState(id, stateToStore);

        // Remove from scene when minimizing
        removeWindowFromScene(id);

        setWindows((prev) =>
          prev.map((win) => {
            if (win.id !== id) return win;
            return {
              ...win,
              isMinimized: true,
              position: currentActualPosition,
            };
          })
        );
      }

      setNextZIndex((prev) => prev + 1);
    },
    [
      nextZIndex,
      removeWindowFromScene,
      getWindowState,
      updateWindowState,
      createCSS3DWindow,
    ]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-screen relative overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {" "}
      {/* 3D Background */}
      <Background3D containerRef={containerRef} use3D={false} />
      {/* Animated Desktop Icons */}{" "}
      <AnimatedDesktopIcons
        containerRef={containerRef}
        onIconClick={createWindow}
        maxRandomDelay={animationRandomness.maxRandomDelay}
        speedVariation={animationRandomness.speedVariation}
        cameraControls={cameraControls}
        ref={iconsRef}
      />{" "}
      {/* Hidden React Windows - only used for state management, not display */}
      {windows.map((window) => (
        <Window3D
          key={window.id}
          window={window}
          onDrag={handleWindowDrag}
          onClose={handleWindowClose}
          onMinimize={handleWindowMinimize}
          onMaximize={handleWindowMaximize}
          onFocus={handleWindowFocus}
          onUpdateInScene={updateWindowInScene}
          hideReactWindow={true}
        />
      ))}
      {/* Taskbar */}
      <Taskbar
        windows={windows}
        onWindowRestore={handleWindowToggle}
        onLayoutChange={handleLayoutChange}
        currentLayout={currentLayout}
        animationRandomness={animationRandomness}
        onRandomnessChange={handleRandomnessChange}
        cameraControls={cameraControls}
        onCameraControlsChange={setCameraControls}
      />
    </div>
  );
};

export default Desktop3D;

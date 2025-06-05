import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";

import { DesktopIconData, desktopIcons } from "../data/iconData";

interface CameraControlOptions {
  /** Enable/disable all camera controls (default: true) */
  enabled?: boolean;
  /** Enable/disable rotation (default: true) */
  enableRotate?: boolean;
  /** Enable/disable panning (default: true) */
  enablePan?: boolean;
  /** Enable/disable zooming (default: true) */
  enableZoom?: boolean;
  /** Lock rotation around X axis (default: false) */
  lockRotationX?: boolean;
  /** Lock rotation around Y axis (default: false) */
  lockRotationY?: boolean /** Lock rotation around Z axis (default: true) */;
  lockRotationZ?: boolean;
  /** Lock panning on X axis (default: false) */
  lockPanX?: boolean;
  /** Lock panning on Y axis (default: false) */
  lockPanY?: boolean;
  /** Minimum zoom distance (default: 500) */
  minDistance?: number;
  /** Maximum zoom distance (default: 6000) */
  maxDistance?: number;
  /** Rotation speed multiplier (default: 1.0) */
  rotateSpeed?: number;
  /** Zoom speed multiplier (default: 1.2) */
  zoomSpeed?: number;
  /** Pan speed multiplier (default: 0.8) */
  panSpeed?: number;
}

interface AnimatedDesktopIconsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onIconClick: (title: string, content: React.ReactNode) => void;
  /** Maximum random delay in milliseconds (default: 0) */
  maxRandomDelay?: number;
  /** Random speed variation multiplier range (default: 0, range: 0 to 1) */
  speedVariation?: number;
  /** Camera control options */
  cameraControls?: CameraControlOptions;
}

type LayoutType = "table" | "sphere" | "helix" | "grid" | "columns";

export interface AnimatedDesktopIconsRef {
  switchLayout: (layout: LayoutType) => void;
}

const AnimatedDesktopIcons = forwardRef<
  AnimatedDesktopIconsRef,
  AnimatedDesktopIconsProps
>(
  (
    {
      containerRef,
      onIconClick,
      maxRandomDelay = 0,
      speedVariation = 0,
      cameraControls = {},
    },
    ref
  ) => {
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<CSS3DRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<TrackballControls | null>(null);
    // Ref to always read latest cameraControls in override
    const cameraControlsStateRef = useRef<CameraControlOptions>(cameraControls);
    const objectsRef = useRef<CSS3DObject[]>([]);
    const targetsRef = useRef<Record<LayoutType, THREE.Object3D[]>>({
      table: [],
      sphere: [],
      helix: [],
      grid: [],
      columns: [],
    });
    const animationFrameRef = useRef<number>();
    const currentLayoutRef = useRef<LayoutType | null>(null);

    // Keep ref up to date for override
    useEffect(() => {
      cameraControlsStateRef.current = cameraControls;
    }, [cameraControls]);

    const createElementTile = useCallback(
      (element: DesktopIconData) => {
        const elementDiv = document.createElement("div");
        elementDiv.className = "element";
        elementDiv.style.width = "120px";
        elementDiv.style.height = "160px";
        elementDiv.style.boxShadow = "0px 0px 12px rgba(0, 255, 255, 0.5)";
        elementDiv.style.border = "1px solid rgba(127, 255, 255, 0.25)";
        elementDiv.style.fontFamily = "Helvetica, sans-serif";
        elementDiv.style.textAlign = "center";
        elementDiv.style.lineHeight = "normal";
        elementDiv.style.cursor = "default";
        elementDiv.style.backgroundColor = `rgba(0,127,127,${
          Math.random() * 0.5 + 0.25
        })`;
        // Essential CSS for pointer event handling
        elementDiv.style.pointerEvents = "auto";
        elementDiv.style.userSelect = "none";

        const number = document.createElement("div");
        number.className = "number";
        number.style.position = "absolute";
        number.style.top = "20px";
        number.style.right = "20px";
        number.style.fontSize = "12px";
        number.style.color = "rgba(127, 255, 255, 0.75)";
        number.textContent = element.stat;
        elementDiv.appendChild(number);

        const symbol = document.createElement("div");
        symbol.className = "symbol";
        symbol.style.position = "absolute";
        symbol.style.top = "40px";
        symbol.style.left = "0px";
        symbol.style.right = "0px";
        symbol.style.fontSize = "30px";
        symbol.style.fontWeight = "bold";
        symbol.style.color = "rgba(255, 255, 255, 0.75)";
        symbol.style.textShadow = "0 0 10px rgba(0, 255, 255, 0.95)";
        symbol.textContent = element.title;
        elementDiv.appendChild(symbol);

        const details = document.createElement("div");
        details.className = "details";
        details.style.position = "absolute";
        details.style.bottom = "15px";
        details.style.left = "0px";
        details.style.right = "0px";
        details.style.fontSize = "12px";
        details.style.color = "rgba(127, 255, 255, 0.75)";
        details.innerHTML = `${element.description}<br>${element.stat}`;
        elementDiv.appendChild(details);

        // Add hover effects
        elementDiv.addEventListener("mouseenter", () => {
          elementDiv.style.boxShadow = "0px 0px 12px rgba(0, 255, 255, 0.75)";
          elementDiv.style.border = "1px solid rgba(127, 255, 255, 0.75)";
        });

        elementDiv.addEventListener("mouseleave", () => {
          elementDiv.style.boxShadow = "0px 0px 12px rgba(0, 255, 255, 0.5)";
          elementDiv.style.border = "1px solid rgba(127, 255, 255, 0.25)";
        }); // Unified icon click handler
        const handleIconClick = () => {
          try {
            const content = (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {element.description} ({element.title})
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Symbol:</strong> {element.title}
                  </p>
                  <p>
                    <strong>Version:</strong> {element.stat}
                  </p>
                  <p>
                    <strong>Position:</strong> Row {element.gridCoord[1]},
                    Column {element.gridCoord[0]}
                  </p>
                </div>
              </div>
            );
            onIconClick(`${element.description} (${element.title})`, content);
          } catch (error) {
            // Silently handle any click errors
          }
        };

        // Unified event handling that works across all browsers
        // Use pointerdown/pointerup for reliable CSS3D compatibility
        let isPointerDown = false;

        elementDiv.addEventListener("pointerdown", (e) => {
          isPointerDown = true;
          e.preventDefault(); // Prevent CSS3D interference
          e.stopPropagation(); // Prevent TrackballControls interference
        });

        elementDiv.addEventListener("pointerup", (e) => {
          if (isPointerDown) {
            isPointerDown = false;
            e.preventDefault();
            e.stopPropagation();
            handleIconClick();
          }
        });

        // Reset state if pointer leaves the element
        elementDiv.addEventListener("pointerleave", () => {
          isPointerDown = false;
        });
        return elementDiv;
      },
      [onIconClick]
    );

    // Custom animation system to replace TWEEN.js
    const animationsRef = useRef<
      Array<{
        object: CSS3DObject;
        startPos: THREE.Vector3;
        startRot: THREE.Euler;
        targetPos: THREE.Vector3;
        targetRot: THREE.Euler;
        startTime: number;
        duration: number;
      }>
    >([]);

    // Easing function (exponential in-out)
    const easeInOutExpo = (t: number): number => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if (t < 0.5) {
        return Math.pow(2, 20 * t - 10) / 2;
      } else {
        return (2 - Math.pow(2, -20 * t + 10)) / 2;
      }
    };
    const transform = useCallback(
      (targets: THREE.Object3D[], baseDuration: number) => {
        // Clear any existing animations
        animationsRef.current = [];
        const currentTime = performance.now();

        for (let i = 0; i < objectsRef.current.length; i++) {
          const object = objectsRef.current[i];
          const target = targets[i];
          if (!target) {
            continue;
          }

          // Add customizable random delay and duration variation
          const randomDelay =
            maxRandomDelay > 0 ? Math.random() * maxRandomDelay : 0;
          const durationMultiplier =
            speedVariation > 0
              ? 1 - speedVariation / 2 + Math.random() * speedVariation
              : 1;
          const animationDuration = baseDuration * durationMultiplier;
          const startTime = currentTime + randomDelay;

          // Store animation data
          animationsRef.current.push({
            object,
            startPos: object.position.clone(),
            startRot: object.rotation.clone(),
            targetPos: target.position.clone(),
            targetRot: target.rotation.clone(),
            startTime,
            duration: animationDuration,
          });
        }
      },
      [maxRandomDelay, speedVariation]
    );

    // Animation update function
    const updateAnimations = useCallback((currentTime: number) => {
      let activeAnimations = 0;

      for (const animation of animationsRef.current) {
        const elapsed = currentTime - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        const easedProgress = easeInOutExpo(progress);

        // Update position
        animation.object.position.lerpVectors(
          animation.startPos,
          animation.targetPos,
          easedProgress
        );

        // Update rotation
        animation.object.rotation.x =
          animation.startRot.x +
          (animation.targetRot.x - animation.startRot.x) * easedProgress;
        animation.object.rotation.y =
          animation.startRot.y +
          (animation.targetRot.y - animation.startRot.y) * easedProgress;
        animation.object.rotation.z =
          animation.startRot.z +
          (animation.targetRot.z - animation.startRot.z) * easedProgress;
        if (progress < 1) {
          activeAnimations++;
        }
      }

      // Remove completed animations
      if (activeAnimations === 0) {
        animationsRef.current = [];
      }

      return activeAnimations > 0;
    }, []);
    const switchLayout = useCallback(
      (layout: LayoutType) => {
        if (currentLayoutRef.current === layout) {
          return;
        }
        if (!targetsRef.current[layout]?.length) {
          return;
        }

        currentLayoutRef.current = layout;
        transform(targetsRef.current[layout], 2000);
      },
      [transform]
    );

    useImperativeHandle(
      ref,
      () => ({
        switchLayout,
      }),
      [switchLayout]
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Initialize scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.z = 3000;

      // Initialize renderer
      const renderer = new CSS3DRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0";
      renderer.domElement.style.zIndex = "1";
      renderer.domElement.style.pointerEvents = "auto";
      container.appendChild(renderer.domElement);

      // Initialize controls with customizable options
      const {
        enabled = true,
        enableRotate = true,
        enablePan = true,
        enableZoom = true,
        lockRotationX = false,
        lockRotationY = false,
        lockRotationZ = true,
        lockPanX = false,
        lockPanY = false,
        minDistance = 500,
        maxDistance = 6000,
        rotateSpeed = 1.0,
        zoomSpeed = 1.2,
        panSpeed = 0.8,
      } = cameraControls;
      const controls = new TrackballControls(camera, renderer.domElement);

      // Apply control settings
      controls.enabled = enabled;
      controls.minDistance = minDistance;
      controls.maxDistance = maxDistance;
      controls.rotateSpeed = rotateSpeed;
      controls.zoomSpeed = zoomSpeed;
      controls.panSpeed = panSpeed;

      // Custom rotation and pan restrictions with override
      const originalUpdate = controls.update.bind(controls);
      controls.update = () => {
        // If rotation/pan/zoom are disabled, don't update
        if (!enableRotate && !enablePan && !enableZoom) {
          return;
        }

        // Store original camera state
        const originalPosition = camera.position.clone();
        const originalQuaternion = camera.quaternion.clone();

        // Temporarily disable specific controls by modifying the internal state
        const originalRotateSpeed = controls.rotateSpeed;
        const originalPanSpeed = controls.panSpeed;
        const originalZoomSpeed = controls.zoomSpeed;

        if (!enableRotate) controls.rotateSpeed = 0;
        if (!enablePan) controls.panSpeed = 0;
        if (!enableZoom) controls.zoomSpeed = 0;

        // Call original update
        originalUpdate();

        // Only invert panning if there was no rotation (quaternion unchanged)
        if (enablePan && originalQuaternion.equals(camera.quaternion)) {
          const deltaX = camera.position.x - originalPosition.x;
          const deltaY = camera.position.y - originalPosition.y;

          // Invert the panning movement only when not rotating
          camera.position.x = originalPosition.x - deltaX;
          camera.position.y = originalPosition.y - deltaY;
        }

        // Restore original speeds
        controls.rotateSpeed = originalRotateSpeed;
        controls.panSpeed = originalPanSpeed;
        controls.zoomSpeed = originalZoomSpeed;

        // Apply axis locks
        if (lockRotationX || lockRotationY || lockRotationZ) {
          // For rotation locks, we reset specific rotation components
          const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
          const originalEuler = new THREE.Euler().setFromQuaternion(
            originalQuaternion
          );

          if (lockRotationX) {
            euler.x = originalEuler.x;
          }
          if (lockRotationY) {
            euler.y = originalEuler.y;
          }
          if (lockRotationZ) {
            euler.z = originalEuler.z;
          }

          camera.quaternion.setFromEuler(euler);
        }

        // Apply pan locks (after inversion)
        if (lockPanX) {
          camera.position.x = originalPosition.x;
        }
        if (lockPanY) {
          camera.position.y = originalPosition.y;
        }
      };

      controls.addEventListener("change", () => {
        renderer.render(scene, camera);
      });

      // Store refs
      sceneRef.current = scene;
      rendererRef.current = renderer;
      cameraRef.current = camera;
      controlsRef.current = controls;

      const objects: CSS3DObject[] = [];
      const targets: Record<LayoutType, THREE.Object3D[]> = {
        table: [],
        sphere: [],
        helix: [],
        grid: [],
        columns: [],
      }; // Create CSS3D objects for each element
      for (let i = 0; i < desktopIcons.length; i++) {
        const element = desktopIcons[i];
        const elementDiv = createElementTile(element);

        const object = new CSS3DObject(elementDiv);
        // Start with random positions behind the camera for dramatic entrance effect
        // Camera is at z=3000, so place icons behind it (z > 3000)
        object.position.x = (Math.random() - 0.5) * 2000; // Random X between -1000 and 1000
        object.position.y = (Math.random() - 0.5) * 2000; // Random Y between -1000 and 1000
        object.position.z = 3500 + Math.random() * 2000; // Random Z between 3500 and 5500 (behind camera)
        scene.add(object);
        objects.push(object);

        // Table layout
        const tableTarget = new THREE.Object3D();
        tableTarget.position.x = (element.gridCoord[0] - 3) * 140; // Center around 0
        tableTarget.position.y = -(element.gridCoord[1] - 2.5) * 180; // Center around 0
        tableTarget.rotation.set(0, 0, 0);
        targets.table.push(tableTarget);
      }

      // Sphere layout
      const vector = new THREE.Vector3();
      for (let i = 0; i < objects.length; i++) {
        const phi = Math.acos(-1 + (2 * i) / objects.length);
        const theta = Math.sqrt(objects.length * Math.PI) * phi;

        const object = new THREE.Object3D();
        object.position.setFromSphericalCoords(800, phi, theta);
        vector.copy(object.position).multiplyScalar(2);
        object.lookAt(vector);
        targets.sphere.push(object);
      } // Helix layout - centered around origin
      const totalHeight = objects.length * 8; // Total height of helix
      for (let i = 0; i < objects.length; i++) {
        const theta = i * 0.175 + Math.PI;
        const y = -(i * 8) + totalHeight / 2; // Center vertically around 0

        const object = new THREE.Object3D();
        object.position.setFromCylindricalCoords(900, theta, y);
        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;
        object.lookAt(vector);
        targets.helix.push(object);
      } // Grid layout - centered around origin
      const gridCols = 5;
      const gridRows = Math.ceil(objects.length / gridCols);
      const gridLayers = Math.ceil(objects.length / (gridCols * 5)); // Max 5 rows per layer

      for (let i = 0; i < objects.length; i++) {
        const object = new THREE.Object3D();
        const col = i % gridCols;
        const row = Math.floor(i / gridCols) % 5;
        const layer = Math.floor(i / (gridCols * 5));

        // Center the grid around origin
        object.position.x = (col - (gridCols - 1) / 2) * 400; // Center horizontally
        object.position.y = (2 - row) * 400; // Center vertically (0-4 rows -> 2 to -2)
        object.position.z = (layer - (gridLayers - 1) / 2) * 1000; // Center depth
        object.rotation.set(0, 0, 0);
        targets.grid.push(object);
      } // Columns layout (classic desktop style) - centered around origin
      const itemHeight = 180; // Height per icon including spacing
      const columnWidth = 140; // Width between columns
      const itemsPerColumn = Math.ceil(
        objects.length / Math.ceil(objects.length / 8)
      ); // Distribute evenly
      const totalColumns = Math.ceil(objects.length / itemsPerColumn);

      for (let i = 0; i < objects.length; i++) {
        const columnIndex = Math.floor(i / itemsPerColumn);
        const rowIndex = i % itemsPerColumn;

        const object = new THREE.Object3D();
        // Center columns horizontally around origin
        object.position.x =
          (columnIndex - (totalColumns - 1) / 2) * columnWidth;
        // Center rows vertically around origin
        object.position.y = (itemsPerColumn / 2 - rowIndex - 0.5) * itemHeight;
        object.position.z = 0;
        object.rotation.set(0, 0, 0);
        targets.columns.push(object);
      } // Store refs
      objectsRef.current = objects;
      targetsRef.current = targets;

      // Set initial layout to grid and start animation from random positions
      currentLayoutRef.current = "grid";

      // Start animation to grid layout after a brief delay to ensure everything is initialized
      setTimeout(() => {
        transform(targets.grid, 3000); // 3 second animation for dramatic initial effect
      }, 100);

      // Animation loop
      function animate(time?: number) {
        animationFrameRef.current = requestAnimationFrame(animate);

        const currentTime = time || performance.now();

        // Update custom animations
        updateAnimations(currentTime);

        // Update controls
        controls.update();

        // Render scene
        renderer.render(scene, camera);
      }
      animate();

      // Handle resize
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
      }
      window.addEventListener("resize", onWindowResize); // Keyboard shortcuts for layouts
      const handleKeyPress = (event: KeyboardEvent) => {
        switch (event.key) {
          case "1":
            if (currentLayoutRef.current !== "grid") {
              currentLayoutRef.current = "grid";
              transform(targets.grid, 2000);
            }
            break;
          case "2":
            if (currentLayoutRef.current !== "table") {
              currentLayoutRef.current = "table";
              transform(targets.table, 2000);
            }
            break;
          case "3":
            if (currentLayoutRef.current !== "sphere") {
              currentLayoutRef.current = "sphere";
              transform(targets.sphere, 2000);
            }
            break;
          case "4":
            if (currentLayoutRef.current !== "helix") {
              currentLayoutRef.current = "helix";
              transform(targets.helix, 2000);
            }
            break;
          case "5":
            if (currentLayoutRef.current !== "columns") {
              currentLayoutRef.current = "columns";
              transform(targets.columns, 2000);
            }
            break;
        }
      };
      window.addEventListener("keydown", handleKeyPress);

      // Cleanup
      return () => {
        window.removeEventListener("resize", onWindowResize);
        window.removeEventListener("keydown", handleKeyPress);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Clear custom animations
        animationsRef.current = [];

        if (controlsRef.current) {
          controlsRef.current.dispose();
        }

        if (rendererRef.current && container) {
          try {
            if (rendererRef.current.domElement.parentNode === container) {
              container.removeChild(rendererRef.current.domElement);
            }
          } catch (error) {
            // Silently handle cleanup errors
          }
        }

        sceneRef.current = null;
        rendererRef.current = null;
        cameraRef.current = null;
        controlsRef.current = null;
        objectsRef.current = [];
      };
    }, [
      containerRef,
      createElementTile,
      transform,
      updateAnimations,
      cameraControls,
    ]);

    return null; // All rendering is done via CSS3DRenderer
  }
);

AnimatedDesktopIcons.displayName = "AnimatedDesktopIcons";

export default AnimatedDesktopIcons;

import { gsap } from 'gsap';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { ScreenSizer, ScreenSpace, Text, useTexture } from '@react-three/drei';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';

import { DesktopIconData, desktopIcons, MeshType } from '../data/iconData';
import { getIconPathForTitle } from '../utils/iconMapper';

export type LayoutType = "table" | "sphere" | "helix" | "grid" | "columns";
export type IconSize = "small" | "medium" | "large";

interface IconInstancesProps {
  /** Called when an icon is clicked (left click) */
  onIconClick: (iconData: DesktopIconData) => void;
  /** Called when an icon is right-clicked for context menu */
  onIconRightClick?: (
    event: { x: number; y: number },
    iconData: DesktopIconData
  ) => void;
  /** Current layout configuration */
  layout: LayoutType;
  /** Desktop icon size */
  iconSize?: IconSize;
  /** Maximum random delay for animations in milliseconds */
  maxRandomDelay?: number;
  /** Speed variation factor (0-1) */
  speedVariation?: number;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Use 3D mesh geometry instead of icon textures (global fallback) */
  use3DMesh?: boolean;
  /** Type of 3D mesh to use when use3DMesh is true (global fallback) */
  meshType?: MeshType;
  /** Enable rotation animation for 3D meshes (global fallback) */
  enableMeshRotation?: boolean;
  /** Custom icon data array (optional, defaults to desktopIcons) */
  iconData?: DesktopIconData[];
}

interface IconInstance {
  /** Icon data */
  data: DesktopIconData;
  /** Current world position */
  position: THREE.Vector3;
  /** Target position for current layout */
  targetPosition: THREE.Vector3;
  /** Current scale */
  scale: THREE.Vector3;
  /** Target scale */
  targetScale: THREE.Vector3;
  /** Current rotation */
  rotation: THREE.Euler;
  /** Target rotation */
  targetRotation: THREE.Euler;
  /** Instance matrix */
  matrix: THREE.Matrix4;
  /** Whether currently hovered */
  isHovered: boolean;
  /** Animation timeline */
  tween: gsap.core.Timeline | null;
  /** Whether the scale-up animation has completed */
  scaleUpCompleted: boolean;
}

/**
 * IconInstances - Renders desktop icons as instanced meshes for optimal performance
 *
 * Uses a single box geometry with instanced rendering for all icons.
 * Each icon gets a unique texture from an atlas and individual transform matrices.
 * Supports smooth layout transitions and hover effects via GSAP animations.
 */
export const IconInstances: React.FC<IconInstancesProps> = ({
  onIconClick,
  onIconRightClick,
  layout,
  iconSize = "large",
  maxRandomDelay = 0,
  speedVariation = 0,
  animationDuration = 2.0,
  use3DMesh = false,
  meshType = "dodecahedron",
  enableMeshRotation = true,
  iconData = desktopIcons,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cameraGroupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef<number | null>(null);
  const instancesRef = useRef<IconInstance[]>([]);
  const lastIconDataRef = useRef<DesktopIconData[]>([]);
  const isInitializedRef = useRef(false);

  // Helper function to get scale value based on icon size
  const getIconScale = useCallback((size: IconSize): number => {
    switch (size) {
      case "small":
        return 0.5;
      case "medium":
        return 0.7;
      case "large":
        return 1.0;
      default:
        return 1.0;
    }
  }, []);

  const { raycaster, pointer, camera, size } = useThree();
  // Store any active hover animations for cleanup
  const hoverAnimations = useRef<{ [key: number]: gsap.core.Tween[] }>({});

  // Track animation states for each icon
  const animationState = useRef<{
    [key: number]: {
      scaleUpInProgress: boolean;
      scaleUpCompleted: boolean;
      scaleDownPending: boolean;
    };
  }>({});
  /**
   * Generate paths for all icon textures
   */
  const iconPaths = useMemo(() => {
    return iconData.map((icon) => getIconPathForTitle(icon.title));
  }, [iconData]);
  /**
   * Load all icon textures at once using drei's useTexture hook
   */
  const iconTextures = useTexture(iconPaths);
  /**
   * Create the appropriate 3D geometry based on mesh type
   */
  const create3DGeometry = useCallback((type: MeshType) => {
    const size = 18; // Size to match icon dimensions

    switch (type) {
      case "dodecahedron":
        return <dodecahedronGeometry args={[size]} />;
      case "icosahedron":
        return <icosahedronGeometry args={[size]} />;
      case "octahedron":
        return <octahedronGeometry args={[size]} />;
      case "tetrahedron":
        return <tetrahedronGeometry args={[size]} />;
      case "cube":
        return <boxGeometry args={[size * 1.5, size * 1.5, size * 1.5]} />;
      case "teapot":
        // Teapot using a custom parametric geometry approximation
        return <sphereGeometry args={[size * 0.8, 12, 8]} />;
      case "suzanne":
        // Suzanne (Blender monkey) approximated with icosahedron
        return <icosahedronGeometry args={[size * 1.2, 2]} />;
      case "torusknot":
        return <torusKnotGeometry args={[size * 0.6, size * 0.2, 64, 8]} />;
      case "torus":
        return <torusGeometry args={[size * 0.8, size * 0.3, 16, 32]} />;
      case "cone":
        return <coneGeometry args={[size, size * 1.5, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[size, size, size * 1.2, 16]} />;
      default:
        return <dodecahedronGeometry args={[size]} />;
    }
  }, []);

  /**
   * Create 3D mesh material with color variations
   */
  const create3DMaterial = useCallback((index: number) => {
    // Create color variation based on index
    const hue = (index * 137.5) % 360; // Golden angle distribution
    const color = new THREE.Color().setHSL(hue / 360, 0.7, 0.6);

    return (
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        emissive={color.clone().multiplyScalar(0.1)}
      />
    );
  }, []);
  /**
   * Create icon instances with stable management to prevent reinitialization
   */
  const instances = useMemo(() => {
    // Create a stable ID for each icon to track across changes
    const getStableId = (icon: DesktopIconData): string => {
      // Use combination of title and description for stable ID
      return `${icon.title}_${icon.description}`;
    };

    const currentIconIds = iconData.map(getStableId);
    const previousIconIds = lastIconDataRef.current.map(getStableId);

    // If this is the first initialization, create all instances
    if (!isInitializedRef.current) {
      console.log("[IconInstances] Initial creation of instances");
      const newInstances: IconInstance[] = [];

      for (let i = 0; i < iconData.length; i++) {
        const iconDataItem = iconData[i];

        // Start with random positions behind camera for dramatic entrance
        const startPos = new THREE.Vector3(
          (Math.random() - 0.5) * 4000,
          (Math.random() - 0.5) * 4000,
          2000 + Math.random() * 2000
        );
        const instance: IconInstance = {
          data: iconDataItem,
          position: startPos.clone(),
          targetPosition: startPos.clone(),
          scale: new THREE.Vector3(0.1, 0.1, 0.1), // Start small
          targetScale: new THREE.Vector3(1, 1, 1),
          rotation: new THREE.Euler(0, 0, 0),
          targetRotation: new THREE.Euler(0, 0, 0),
          matrix: new THREE.Matrix4(),
          isHovered: false,
          tween: null,
          scaleUpCompleted: false,
        };

        newInstances.push(instance);
      }

      instancesRef.current = newInstances;
      lastIconDataRef.current = [...iconData];
      isInitializedRef.current = true;
      return newInstances;
    }

    // Check if icon data actually changed
    const hasChanges =
      currentIconIds.length !== previousIconIds.length ||
      currentIconIds.some((id, index) => id !== previousIconIds[index]);

    if (!hasChanges) {
      // No changes, return existing instances
      return instancesRef.current;
    }

    console.log(
      "[IconInstances] Detected icon changes, applying incremental updates"
    );

    // Create new instance array based on current iconData
    const updatedInstances: IconInstance[] = [];
    const existingInstancesMap = new Map<string, IconInstance>();

    // Map existing instances by their stable IDs
    instancesRef.current.forEach((instance, index) => {
      const id = getStableId(lastIconDataRef.current[index]);
      existingInstancesMap.set(id, instance);
    });

    // Process each current icon
    iconData.forEach((iconDataItem, newIndex) => {
      const stableId = getStableId(iconDataItem);
      const existingInstance = existingInstancesMap.get(stableId);

      if (existingInstance) {
        // Reuse existing instance (preserves position and state)
        existingInstance.data = iconDataItem; // Update data in case of changes
        updatedInstances.push(existingInstance);
        console.log(
          `[IconInstances] Reusing existing instance for: ${iconDataItem.title}`
        );
      } else {
        // Create new instance for added icon
        console.log(
          `[IconInstances] Creating new instance for: ${iconDataItem.title}`
        );

        // For new icons, start them at a position that won't disrupt the layout
        // We'll animate them in smoothly from off-screen
        const offScreenPos = new THREE.Vector3(
          (Math.random() - 0.5) * 1000, // Less random spread
          1000, // Start above the visible area
          -500 // In front of camera but off-screen
        );

        const newInstance: IconInstance = {
          data: iconDataItem,
          position: offScreenPos.clone(),
          targetPosition: offScreenPos.clone(), // Will be set by layout animation
          scale: new THREE.Vector3(0.1, 0.1, 0.1), // Start small
          targetScale: new THREE.Vector3(1, 1, 1),
          rotation: new THREE.Euler(0, 0, 0),
          targetRotation: new THREE.Euler(0, 0, 0),
          matrix: new THREE.Matrix4(),
          isHovered: false,
          tween: null,
          scaleUpCompleted: false,
        };

        updatedInstances.push(newInstance);

        // Don't schedule individual animations here - let the layout system handle it
      }
    });

    // Update refs
    instancesRef.current = updatedInstances;
    lastIconDataRef.current = [...iconData];

    // Log removed icons for debugging
    const removedIds = previousIconIds.filter(
      (id) => !currentIconIds.includes(id)
    );
    if (removedIds.length > 0) {
      console.log(`[IconInstances] Removed icons:`, removedIds);
    }

    return updatedInstances;
  }, [iconData]);
  /**
   * Text refs for animating labels
   */
  const textRefs = useRef<Array<React.RefObject<THREE.Object3D>>>(
    instances.map(() => React.createRef<THREE.Object3D>())
  );

  /**
   * Icon plane refs for animating individual icon planes
   */
  const iconPlaneRefs = useRef<Array<React.RefObject<THREE.Mesh>>>(
    instances.map(() => React.createRef<THREE.Mesh>())
  );

  /**
   * Calculate target positions for the specified layout
   */ const calculateLayoutPositions = useCallback(
    (layoutType: LayoutType): THREE.Vector3[] => {
      const positions: THREE.Vector3[] = [];
      const iconCount = iconData.length;

      switch (layoutType) {
        case "table": {
          // Periodic table style layout - adjusted for camera-relative positioning
          for (let i = 0; i < iconCount; i++) {
            const element = iconData[i];
            const pos = new THREE.Vector3(
              (element.gridCoord[0] - 10) * 50, // Smaller scale for camera-relative
              -(element.gridCoord[1] - 3) * 50, // Smaller scale for camera-relative
              -650 // Position in front of camera - increased distance for 35° FOV
            );
            positions.push(pos);
          }
          break;
        }
        case "sphere": {
          // Spherical layout - adjusted for camera-relative positioning
          for (let i = 0; i < iconCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / iconCount);
            const theta = Math.sqrt(iconCount * Math.PI) * phi;

            const pos = new THREE.Vector3();
            pos.setFromSphericalCoords(650, phi, theta); // Increased radius for 35° FOV
            pos.z -= 450; // Move in front of camera - increased distance
            positions.push(pos);
          }
          break;
        }
        case "helix": {
          // Taskbar layout - horizontal row at bottom above desktop taskbar

          // Calculate viewport dimensions in world units
          const distance = 750; // Same distance as desktop layout for consistency
          const isPerspectiveCamera = "fov" in camera;
          let viewportHeight: number, viewportWidth: number;

          if (isPerspectiveCamera) {
            const vFOV = THREE.MathUtils.degToRad(
              (camera as THREE.PerspectiveCamera).fov
            );
            viewportHeight = 2 * Math.tan(vFOV / 2) * distance;
            viewportWidth = viewportHeight * (size.width / size.height);
          } else {
            // Fallback for orthographic camera
            viewportHeight = 600;
            viewportWidth = viewportHeight * (size.width / size.height);
          }

          // Taskbar specific dimensions
          const taskbarHeight = 48; // Height above desktop taskbar in screen pixels
          const marginX = 20; // Small margin from screen edges
          const marginBottom = 60; // Distance from bottom edge (48px taskbar + padding)

          // Calculate available width for icons
          const availableWidth = viewportWidth - 2 * marginX;

          // Calculate icon spacing to fit all icons in one row
          const iconSpacing =
            iconCount > 1 ? availableWidth / (iconCount - 1) : 0;
          const maxIconSpacing = 80; // Maximum spacing between icons
          const actualIconSpacing = Math.min(iconSpacing, maxIconSpacing);

          // If icons would be too spread out, center them with max spacing
          const totalIconWidth = (iconCount - 1) * actualIconSpacing;
          const startX = -totalIconWidth / 2;

          // Y position at bottom of screen above taskbar
          const y = -viewportHeight / 2 + marginBottom;
          const z = -distance;

          for (let i = 0; i < iconCount; i++) {
            const x = startX + i * actualIconSpacing;
            const pos = new THREE.Vector3(x, y, z);
            positions.push(pos);
          }
          break;
        }
        case "grid": {
          // Tablet layout - 3D grid arrangement adjusted for camera-relative positioning
          const cols = 5;
          const layers = Math.ceil(iconCount / (cols * 5));

          for (let i = 0; i < iconCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols) % 5;
            const layer = Math.floor(i / (cols * 5));

            const pos = new THREE.Vector3(
              (col - (cols - 1) / 2) * 80, // Smaller spacing
              (2 - row) * 80, // Smaller spacing
              -650 + (layer - (layers - 1) / 2) * 150 // Increased distance for 35° FOV
            );
            positions.push(pos);
          }
          break;
        }
        case "columns": {
          // Desktop layout - traditional desktop columns optimized for more icons per column// Calculate viewport dimensions in world units
          const distance = 750; // Increased distance for 35° FOV - moved icons further from camera
          const isPerspectiveCamera = "fov" in camera;
          let viewportHeight: number, viewportWidth: number;

          if (isPerspectiveCamera) {
            const vFOV = THREE.MathUtils.degToRad(
              (camera as THREE.PerspectiveCamera).fov
            );
            viewportHeight = 2 * Math.tan(vFOV / 2) * distance;
            viewportWidth = viewportHeight * (size.width / size.height);
          } else {
            // Fallback for orthographic camera
            viewportHeight = 600;
            viewportWidth = viewportHeight * (size.width / size.height);
          }

          // Optimized icon and spacing dimensions for more compact layout
          const iconSize = 28; // Smaller icon size for more icons per column
          const iconSpacing = 40; // Reduced spacing between icons
          const columnSpacing = 70; // Reduced spacing between columns
          const marginX = 40; // Reduced left margin
          const marginY = 30; // Reduced top margin

          // Calculate how many icons fit vertically in viewport
          const availableHeight = viewportHeight - 2 * marginY;
          const itemsPerColumn = Math.max(
            1,
            Math.floor(availableHeight / iconSpacing)
          );

          // Calculate how many columns we can fit
          const availableWidth = viewportWidth - 2 * marginX;
          const maxColumns = Math.max(
            1,
            Math.floor(availableWidth / columnSpacing)
          );

          // Total columns needed
          const totalColumns = Math.min(
            maxColumns,
            Math.ceil(iconCount / itemsPerColumn)
          );

          for (let i = 0; i < iconCount; i++) {
            const columnIndex = Math.floor(i / itemsPerColumn);
            const rowIndex = i % itemsPerColumn;

            // Position from left edge, filling columns top to bottom
            const x =
              -viewportWidth / 2 + marginX + columnIndex * columnSpacing;
            const y = viewportHeight / 2 - marginY - rowIndex * iconSpacing;
            const z = -distance;

            const pos = new THREE.Vector3(x, y, z);
            positions.push(pos);
          }
          break;
        }

        default:
          // Fallback to grid
          return calculateLayoutPositions("grid");
      }
      return positions;
    },
    [camera, size.width, size.height, iconData]
  );
  /**
   * Animate instances to new layout positions
   */
  const animateToLayout = useCallback(
    (layoutType: LayoutType) => {
      const targetPositions = calculateLayoutPositions(layoutType);

      instances.forEach((instance, i) => {
        if (i >= targetPositions.length) return;

        // Kill existing animation
        if (instance.tween) {
          instance.tween.kill();
        }

        // Calculate animation delay and duration with randomness
        const delay =
          maxRandomDelay > 0 ? (Math.random() * maxRandomDelay) / 1000 : 0;
        const durationVariation =
          speedVariation > 0
            ? 1 - speedVariation / 2 + Math.random() * speedVariation
            : 1;
        const duration = animationDuration * durationVariation; // Update target transform
        instance.targetPosition.copy(targetPositions[i]);
        instance.targetScale.set(1, 1, 1);
        instance.targetRotation.set(0, 0, 0);

        // Create GSAP timeline for smooth animation
        const tl = gsap.timeline({ delay });

        // Animate position with expo ease
        tl.to(instance.position, {
          duration,
          x: instance.targetPosition.x,
          y: instance.targetPosition.y,
          z: instance.targetPosition.z,
          ease: "expo.inOut",
        });

        // Animate scale with bounce effect
        tl.to(
          instance.scale,
          {
            duration: duration * 0.8,
            x: instance.targetScale.x,
            y: instance.targetScale.y,
            z: instance.targetScale.z,
            ease: "back.out(1.7)",
          },
          0
        );

        instance.tween = tl;
      });
    },
    [
      calculateLayoutPositions,
      maxRandomDelay,
      speedVariation,
      animationDuration,
      instances,
    ]
  );

  /**
   * Helper function to start scale down animation for an icon
   */
  const startScaleDownAnimation = useCallback(
    (instanceId: number) => {
      if (
        !iconPlaneRefs.current[instanceId]?.current ||
        !textRefs.current[instanceId]?.current
      ) {
        return;
      }

      // Reset pending flag and animation state
      if (animationState.current[instanceId]) {
        animationState.current[instanceId].scaleDownPending = false;
        animationState.current[instanceId].scaleUpInProgress = false;
      } // Kill any existing animations
      if (hoverAnimations.current[instanceId]) {
        hoverAnimations.current[instanceId].forEach((tween) => tween.kill());
      }

      // Calculate scale for icon reset based on icon size
      const iconScale = getIconScale(iconSize); // Animate icon scale back to appropriate scale with a custom ease: slow start, speeds up, then slows again
      const iconScaleOut = gsap.to(
        iconPlaneRefs.current[instanceId].current.scale,
        {
          x: iconScale,
          y: iconScale,
          z: iconScale,
          duration: 1.4,
          ease: "cubic.out", // slow start, faster in middle, slow at end
        }
      );
      // Calculate scale for text reset based on icon size
      const textScale = getIconScale(iconSize);

      // Animate text scale back to appropriate scale with a custom ease: slow start, speeds up, then slows again
      const textScaleOut = gsap.to(textRefs.current[instanceId].current.scale, {
        x: textScale,
        y: textScale,
        z: textScale,
        duration: 1.5,
        ease: "cubic.out", // slow start, faster in middle, slow at end
      });

      // Store animations for potential cleanup
      hoverAnimations.current[instanceId] = [iconScaleOut, textScaleOut];
    },
    [getIconScale, iconSize]
  );

  /**
   * Handle layout changes
   */
  useEffect(() => {
    animateToLayout(layout);
  }, [layout, animateToLayout]);
  /**
   * Initial animation on mount - use the current layout prop instead of forcing grid
   * Only runs once when component first mounts, not when iconData changes
   */
  useEffect(() => {
    // Only run the initial animation if this is the very first initialization
    if (isInitializedRef.current && instancesRef.current.length > 0) {
      console.log("[IconInstances] Running initial layout animation");
      const timer = setTimeout(() => {
        animateToLayout(layout);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only runs once on mount

  /**
   * Detect when new icons are added and animate them to their layout positions
   * This runs after animateToLayout is defined to avoid hoisting issues
   */
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Check if we have new icons that need to be animated to their layout positions
    const newIconsToAnimate = instances.filter((instance) => {
      // New icons will have positions far from their target positions
      const distanceFromTarget = instance.position.distanceTo(
        instance.targetPosition
      );
      return distanceFromTarget > 500; // If more than 500 units away, it's likely a new icon
    });

    if (newIconsToAnimate.length > 0) {
      console.log(
        `[IconInstances] Animating ${newIconsToAnimate.length} new icons to layout positions`
      );

      // Trigger layout animation for all icons, but new ones will have the most dramatic movement
      setTimeout(() => {
        animateToLayout(layout);
      }, 50);
    }
  }, [instances, layout, animateToLayout]);

  // Cleanup any remaining animations when component unmounts
  useEffect(() => {
    // Store reference to the animations for cleanup
    const currentHoverAnimations = hoverAnimations.current;

    return () => {
      // Kill all hover animations on unmount
      Object.values(currentHoverAnimations).forEach((tweens) => {
        tweens.forEach((tween) => tween.kill());
      });
    };
  }, []);
  /**
   * Update text scale and position based on icon size
   */
  useEffect(() => {
    // Apply icon size-specific text transformations
    textRefs.current.forEach((textRef, i) => {
      if (!textRef.current) return;

      const instance = instances[i];
      if (!instance) return;

      // Use unified icon scale for text as well
      const textScale = getIconScale(iconSize);

      gsap.to(textRef.current.scale, {
        x: textScale,
        y: textScale,
        z: textScale,
        duration: animationDuration * 0.8, // Match icon animation duration
        ease: "back.out(1.7)",
      });
    });
  }, [iconSize, instances, animationDuration, getIconScale]);

  /**
   * Force update icon scales when iconSize changes (fixes hover state issue)
   */
  useEffect(() => {
    // Apply icon size-specific scaling to all icons, including those that have been hovered
    iconPlaneRefs.current.forEach((iconRef, i) => {
      if (!iconRef.current) return;

      const instance = instances[i];
      if (!instance) return;

      // Skip icons that are currently hovered or have ongoing animations
      if (instance.isHovered || animationState.current[i]?.scaleUpInProgress) {
        return;
      }

      // Kill any existing hover animations for this icon
      if (hoverAnimations.current[i]) {
        hoverAnimations.current[i].forEach((tween) => tween.kill());
        hoverAnimations.current[i] = [];
      }

      // Apply the new scale based on current iconSize
      const newScale = getIconScale(iconSize);

      gsap.to(iconRef.current.scale, {
        x: newScale,
        y: newScale,
        z: newScale,
        duration: animationDuration * 0.8, // Match animation duration
        ease: "back.out(1.7)",
      });
    });
  }, [iconSize, instances, animationDuration, getIconScale]);

  useFrame(() => {
    // Update camera group to follow camera position and rotation
    if (cameraGroupRef.current) {
      cameraGroupRef.current.position.copy(camera.position);
      cameraGroupRef.current.rotation.copy(camera.rotation);
    }

    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const matrix = new THREE.Matrix4();

    instances.forEach((instance, i) => {
      // Create transformation matrix from position, rotation, and scale
      matrix.compose(
        instance.position,
        new THREE.Quaternion().setFromEuler(instance.rotation),
        instance.scale
      );

      // Update instance matrix - hover effect now handled by GSAP animations
      mesh.setMatrixAt(i, matrix);
      instance.matrix.copy(matrix); // Update text position to follow the instance with size-appropriate offset
      const textRef = textRefs.current[i];
      if (textRef?.current) {
        // Use offset based on icon size for consistent visual hierarchy
        const sizeBasedOffset =
          iconSize === "small" ? 12 : iconSize === "medium" ? 18 : 25;

        textRef.current.position.set(
          instance.position.x,
          instance.position.y - sizeBasedOffset, // Size-based offset for consistent spacing
          instance.position.z + 8 // Closer to icons
        );
      } // Update icon plane position to follow the instance
      const iconPlaneRef = iconPlaneRefs.current[i];
      if (iconPlaneRef?.current) {
        iconPlaneRef.current.position.set(
          instance.position.x,
          instance.position.y,
          instance.position.z + 5 // Smaller offset for camera-relative positioning
        ); // Only apply icon size scaling if not hovered AND no animations are running
        if (!instance.isHovered && !hoverAnimations.current[i]) {
          const currentScale = getIconScale(iconSize);
          iconPlaneRef.current.scale.set(
            currentScale,
            currentScale,
            currentScale
          );
        }

        // Apply rotation for 3D meshes or copy instance rotation for 2D planes
        const shouldUse3DMesh = instance.data.use3DMesh ?? use3DMesh;
        const shouldRotate =
          instance.data.enableMeshRotation ?? enableMeshRotation;

        if (shouldUse3DMesh && shouldRotate) {
          // Continuous rotation for 3D meshes
          iconPlaneRef.current.rotation.x += 0.01;
          iconPlaneRef.current.rotation.y += 0.015;
          iconPlaneRef.current.rotation.z += 0.005;
        } else {
          iconPlaneRef.current.rotation.copy(instance.rotation);
        }
      }
    });

    // Mark instance matrix as needing update
    mesh.instanceMatrix.needsUpdate = true;
  });
  /**
   * Handle pointer interactions with raycasting
   */
  useFrame(() => {
    if (!meshRef.current || iconPlaneRefs.current.length === 0) return;

    // Update raycaster
    raycaster.setFromCamera(pointer, camera);

    // Collect all icon plane meshes for raycasting
    const iconPlanes: THREE.Mesh[] = [];
    iconPlaneRefs.current.forEach((ref, index) => {
      if (ref?.current) {
        // Add index as userData for identification
        ref.current.userData = { instanceId: index };
        iconPlanes.push(ref.current);
      }
    });

    // Check intersection with icon planes instead of instanced mesh
    const intersects = raycaster.intersectObjects(iconPlanes);
    if (intersects.length > 0) {
      const instanceId = intersects[0].object.userData?.instanceId;
      if (instanceId !== undefined && instanceId !== hoveredRef.current) {
        // Clear previous hover
        if (hoveredRef.current !== null) {
          const prevInstanceId = hoveredRef.current;
          instances[prevInstanceId].isHovered = false;

          // Check if scale-up is still in progress for the previous instance
          if (animationState.current[prevInstanceId]?.scaleUpInProgress) {
            // If scale-up is still in progress, mark it for scale-down when it completes
            animationState.current[prevInstanceId].scaleDownPending = true;
          } else {
            // If scale-up is done or not started, begin scale-down immediately
            startScaleDownAnimation(prevInstanceId);
          }
        }

        // Set new hover
        hoveredRef.current = instanceId;
        instances[instanceId].isHovered = true;

        // Kill any existing animations for this instance
        if (hoverAnimations.current[instanceId]) {
          hoverAnimations.current[instanceId].forEach((tween) => tween.kill());
        }

        // Initialize or reset animation state for this instance
        animationState.current[instanceId] = {
          scaleUpInProgress: true,
          scaleUpCompleted: false,
          scaleDownPending: false,
        };

        // Animate icon scale up with GSAP - slower ease in, even larger scale
        const iconScaleUp = gsap.to(
          iconPlaneRefs.current[instanceId].current.scale,
          {
            x: 1.38,
            y: 1.38,
            z: 1.38,
            duration: 0.45,
            ease: "power4.out", // slower ease in, more dramatic
            onComplete: () => {
              // Mark scale up as completed
              if (animationState.current[instanceId]) {
                animationState.current[instanceId].scaleUpInProgress = false;
                animationState.current[instanceId].scaleUpCompleted = true;

                // If there's a pending scale down, trigger it now
                if (animationState.current[instanceId].scaleDownPending) {
                  startScaleDownAnimation(instanceId);
                }
              }
            },
          }
        );

        // Animate text scale up with GSAP - slower ease in, even larger scale
        const textScaleUp = gsap.to(
          textRefs.current[instanceId].current.scale,
          {
            x: 1.55,
            y: 1.55,
            z: 1.55,
            duration: 0.5,
            ease: "power4.out",
            onComplete: () => {
              // Mark scale up as completed for text as well
              if (animationState.current[instanceId]) {
                animationState.current[instanceId].scaleUpCompleted = true;
              }
            },
          }
        );

        // Store animations for potential cleanup
        hoverAnimations.current[instanceId] = [iconScaleUp, textScaleUp];
      }
    } else {
      // Clear hover
      if (hoveredRef.current !== null) {
        const currentInstanceId = hoveredRef.current;
        if (instances[currentInstanceId]) {
          instances[currentInstanceId].isHovered = false;
        }

        // Check if scale-up is still in progress for this instance
        if (animationState.current[currentInstanceId]?.scaleUpInProgress) {
          // If scale-up is still in progress, mark it for scale-down when it completes
          animationState.current[currentInstanceId].scaleDownPending = true;
        } else {
          // If scale-up is done or not started, begin scale-down immediately
          startScaleDownAnimation(currentInstanceId);
        }

        hoveredRef.current = null;
      }
    }
  });
  /**
   * Handle click events (both left and right clicks)
   */
  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const instanceId = event.object.userData?.instanceId;
      if (instanceId !== undefined && instances[instanceId]) {
        const instance = instances[instanceId];
        const element = instance.data;

        // Check if this is a right click (button 2) or context menu event
        if (event.nativeEvent.button === 2 && onIconRightClick) {
          // Right click - show context menu
          event.stopPropagation();
          event.nativeEvent.preventDefault();

          onIconRightClick(
            { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY },
            element
          );
        } else if (event.nativeEvent.button === 0) {
          // Left click - open icon
          onIconClick(element);
        }
      }
    },
    [instances, onIconClick, onIconRightClick]
  );
  return (
    <group ref={cameraGroupRef}>
      {" "}
      {/* Instanced mesh for all icons - keeping for potential future use but not for interaction */}{" "}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, iconData.length]}
        visible={false} // Make completely invisible since we use individual planes for interaction
      >
        {/* Box geometry for all instances - smaller for camera-relative positioning */}
        <boxGeometry args={[40, 40, 8]} />
        {/* Invisible material */}
        <meshPhongMaterial color="#4a9eff" transparent opacity={0} />
      </instancedMesh>{" "}
      {/* Individual icon planes with PNG textures OR 3D meshes */}
      {instances.map((instance, i) => {
        // Determine if this specific icon should use 3D mesh
        const shouldUse3DMesh = instance.data.use3DMesh ?? use3DMesh;
        const iconMeshType = instance.data.meshType ?? meshType;
        const shouldRotate =
          instance.data.enableMeshRotation ?? enableMeshRotation;

        return (
          <mesh
            key={`icon-${i}`}
            ref={iconPlaneRefs.current[i]}
            position={[
              instance.position.x,
              instance.position.y,
              instance.position.z + 5,
            ]}
            scale={[instance.scale.x, instance.scale.y, instance.scale.z]} // Apply instance scale to mesh
            onPointerDown={(event) => {
              // Set userData for raycasting identification
              event.object.userData = { instanceId: i };
              handlePointerDown(event);
            }}
            onContextMenu={(event) => {
              // Handle right-click context menu
              if (onIconRightClick) {
                event.stopPropagation();
                event.nativeEvent.preventDefault();
                onIconRightClick(
                  {
                    x: event.nativeEvent.clientX,
                    y: event.nativeEvent.clientY,
                  },
                  instance.data
                );
              }
            }}
            onPointerEnter={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerLeave={() => {
              document.body.style.cursor = "default";
            }}
          >
            {shouldUse3DMesh ? (
              <>
                {create3DGeometry(iconMeshType)}
                {create3DMaterial(i)}
              </>
            ) : (
              <>
                <planeGeometry args={[35, 35]} />
                <meshBasicMaterial
                  map={
                    Array.isArray(iconTextures) ? iconTextures[i] : iconTextures
                  }
                  transparent
                  alphaTest={0.1}
                />
              </>
            )}
          </mesh>
        );
      })}
      {/* Text labels for each icon with custom drei Text settings */}
      {instances.map((instance, i) => (
        <Text
          key={i}
          ref={textRefs.current[i]}
          position={[
            instance.position.x,
            instance.position.y + 25, // Closer to icons for camera-relative positioning
            instance.position.z + 8,
          ]}
          scale={[1, 1, 1]} // Explicit initial scale for GSAP animations
          color="#f8f8f8"
          fontSize={8} // Smaller font for camera-relative positioning
          maxWidth={60} // Reduced from 80 to force better text wrapping
          lineHeight={1.1} // Slightly increased for better readability with wrapped text
          letterSpacing={0.02}
          textAlign="center" // Changed from "left" to "center" for better appearance
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.75}
          outlineColor="#222222"
          whiteSpace="normal" // Allow text wrapping
        >
          {instance.data.title}
        </Text>
      ))}
    </group>
  );
};

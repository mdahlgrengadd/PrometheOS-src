import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";

export interface DualRendererOptions {
  /** Container element for both renderers */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Orthographic camera for CSS3D windows */
  orthoCamera?: THREE.OrthographicCamera;
  /** Callback when renderers are ready */
  onReady?: (
    css3dRenderer: CSS3DRenderer,
    orthoCamera: THREE.OrthographicCamera
  ) => void;
}

export interface DualRendererReturn {
  /** CSS3D renderer for windows */
  css3dRenderer: CSS3DRenderer | null;
  /** CSS3D scene for windows */
  css3dScene: THREE.Scene | null;
  /** Orthographic camera for windows */
  orthoCamera: THREE.OrthographicCamera | null;
  /** Force a render of the CSS3D layer */
  renderCSS3D: () => void;
  /** Update renderer sizes on window resize */
  updateSize: (width: number, height: number) => void;
  /** Enable/disable pointer events on CSS3D layer */
  setPointerEvents: (enabled: boolean) => void;
}

/**
 * Custom hook for managing dual renderer setup:
 * - CSS3DRenderer with OrthographicCamera for HTML windows (1:1 pixel mapping)
 * - react-three-fiber Canvas with PerspectiveCamera for 3D icons and background
 */
export const useDualRenderer = (
  options: DualRendererOptions
): DualRendererReturn => {
  const { containerRef, onReady } = options;

  const css3dRendererRef = useRef<CSS3DRenderer | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const css3dSceneRef = useRef<THREE.Scene | null>(null);
  const onReadyRef = useRef(onReady);

  // Keep onReady ref updated
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  /**
   * Creates orthographic camera with 1:1 pixel mapping for CSS3D windows
   */
  const createOrthoCamera = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Orthographic camera: (left, right, top, bottom, near, far)
    // Maps screen coordinates directly to world coordinates
    const camera = new THREE.OrthographicCamera(
      0, // left
      w, // right
      0, // top
      -h, // bottom (negative for Y-up coordinate system)
      0, // near
      10000 // far
    );

    camera.position.z = 1000;
    return camera;
  }, []);

  /**
   * Initialize CSS3D renderer and camera
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create CSS3D scene and camera
    const scene = new THREE.Scene();
    const camera = createOrthoCamera(); // Create CSS3D renderer
    const renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "2"; // Above react-three-fiber canvas
    renderer.domElement.style.pointerEvents = "none"; // Start with no pointer events to allow 3D interaction

    container.appendChild(renderer.domElement); // Force size update after DOM append to ensure proper sizing
    requestAnimationFrame(() => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }); // Store refs
    css3dRendererRef.current = renderer;
    orthoCameraRef.current = camera;
    css3dSceneRef.current = scene; // Notify parent component (onReady called only once during initialization)
    onReadyRef.current?.(renderer, camera); // Cleanup
    return () => {
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      css3dRendererRef.current = null;
      orthoCameraRef.current = null;
      css3dSceneRef.current = null;
    };
  }, [containerRef, createOrthoCamera]); // Removed onReady from deps to prevent recreation

  /**
   * Handle window resize - update both renderer sizes and camera frustum
   */
  const updateSize = useCallback((width: number, height: number) => {
    // Update CSS3D renderer size
    if (css3dRendererRef.current) {
      css3dRendererRef.current.setSize(width, height);
    }

    // Update orthographic camera frustum for 1:1 pixel mapping
    if (orthoCameraRef.current) {
      orthoCameraRef.current.left = 0;
      orthoCameraRef.current.right = width;
      orthoCameraRef.current.top = 0;
      orthoCameraRef.current.bottom = -height; // Negative for Y-up
      orthoCameraRef.current.updateProjectionMatrix();
    }
  }, []);
  /**
   * Force render the CSS3D layer
   */ const renderCSS3D = useCallback(() => {
    if (
      css3dRendererRef.current &&
      orthoCameraRef.current &&
      css3dSceneRef.current
    ) {
      css3dRendererRef.current.render(
        css3dSceneRef.current,
        orthoCameraRef.current
      );
    }
  }, []);
  /**
   * Enable or disable pointer events on the CSS3D layer
   * Note: We keep the CSS3D renderer with pointerEvents: "none"
   * and individual window elements have pointerEvents: "auto"
   */
  const setPointerEvents = useCallback((enabled: boolean) => {
    // CSS3D renderer always has pointerEvents: "none" to avoid blocking background
    // Individual window elements control their own pointer events
    if (css3dRendererRef.current) {
      css3dRendererRef.current.domElement.style.pointerEvents = "none";
    }
  }, []);

  // Handle window resize events
  useEffect(() => {
    const handleResize = () => {
      updateSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateSize]);

  return {
    css3dRenderer: css3dRendererRef.current,
    css3dScene: css3dSceneRef.current,
    orthoCamera: orthoCameraRef.current,
    renderCSS3D,
    updateSize,
    setPointerEvents,
  };
};

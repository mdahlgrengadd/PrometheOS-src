import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import { applyRandom3DMesh, desktopIcons } from '../data/iconData';
import { useDualRenderer } from '../hooks/useDualRenderer';
import { useWindowStore } from '../stores/windowStore';
import { WindowData } from '../types/Window';
import { IconInstances, IconSize, LayoutType } from './IconInstances';
import { WindowLayer } from './WindowLayer';

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

// Temporary Plugin interface to match Desktop3D
interface SimplePlugin {
  id: string;
  manifest: {
    name: string;
    frameless?: boolean;
  };
  render: () => React.ReactNode;
}

interface DesktopCanvasProps {
  /** Window management */
  windows: WindowData[];
  onWindowCreate: (title: string, content: React.ReactNode) => void;
  onWindowDrag: (
    id: string,
    position: { x: number; y: number; z: number }
  ) => void;
  onWindowClose: (id: string) => void;
  onWindowMinimize: (id: string) => void;
  onWindowMaximize: (id: string) => void;
  onWindowFocus: (id: string) => void;
  /** Layout and animation controls */
  currentLayout: LayoutType;
  iconSize?: IconSize;
  animationRandomness: {
    maxRandomDelay: number;
    speedVariation: number;
  };
  cameraControls: CameraControlOptions;

  /** Background configuration */
  use3DBackground?: boolean;
  environmentPreset?: string;

  /** 3D Mesh configuration for icons */
  enable3DMeshIcons?: boolean;
  meshIconPercentage?: number; // 0-1, percentage of icons to convert to 3D meshes
  randomSeed?: number; // Optional seed for reproducible randomization

  /** Plugin integration */
  plugins?: SimplePlugin[];
  onPluginLaunch?: (pluginId: string, initFromUrl?: string) => void;
}

/**
 * Render loop component that handles the dual renderer system
 * Renders WebGL first, then CSS3D layer on top
 */
const RenderLoop: React.FC<{
  renderCSS3D: () => void;
}> = ({ renderCSS3D }) => {
  useFrame(() => {
    // CSS3D render is called after WebGL render automatically
    renderCSS3D();
  });

  return null;
};

/**
 * Placeholder for 3D Background Effects - currently unused
 */
const Background3DEffects: React.FC = () => {
  return null;
};

/**
 * Background scene component for the WebGL canvas
 */
const BackgroundScene: React.FC<{
  use3DBackground: boolean;
  environmentPreset: string;
}> = ({ use3DBackground, environmentPreset }) => {
  if (use3DBackground) {
    return (
      <>
        <Environment
          preset={
            environmentPreset as
              | "sunset"
              | "dawn"
              | "night"
              | "warehouse"
              | "forest"
              | "apartment"
              | "studio"
              | "city"
              | "park"
              | "lobby"
          }
          background
          blur={0.6}
        />
        <fog attach="fog" args={["#1a1a2e", 1000, 8000]} />
      </>
    );
  }
  return (
    <>
      {/* Remove background color so CSS gradient shows through */}
      <fog attach="fog" args={["#1a1a2e", 2000, 8000]} />
    </>
  );
};

/**
 * Camera controls component with customizable restrictions
 */
const CameraController: React.FC<{
  controls: CameraControlOptions;
}> = ({ controls }) => {
  const {
    enabled = true,
    enableRotate = true,
    enablePan = true,
    enableZoom = true,
    minDistance = 500,
    maxDistance = 6000,
    rotateSpeed = 1.0,
    zoomSpeed = 1.2,
    panSpeed = 0.8,
  } = controls;

  return (
    <OrbitControls
      enabled={enabled}
      enableRotate={enableRotate}
      enablePan={enablePan}
      enableZoom={enableZoom}
      minDistance={minDistance}
      maxDistance={maxDistance}
      rotateSpeed={rotateSpeed}
      zoomSpeed={zoomSpeed}
      panSpeed={panSpeed}
      // Lock Z rotation by default for desktop-like experience
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
    />
  );
};

/**
 * DesktopCanvas - Main component that orchestrates the dual renderer system
 *
 * Combines react-three-fiber Canvas (WebGL) for 3D icons and background with
 * CSS3DRenderer for HTML windows. Manages render order and input coordination.
 */
export const DesktopCanvas: React.FC<DesktopCanvasProps> = ({
  windows,
  onWindowCreate,
  onWindowDrag,
  onWindowClose,
  onWindowMinimize,
  onWindowMaximize,
  onWindowFocus,
  currentLayout,
  iconSize = "large",
  animationRandomness,
  cameraControls,
  use3DBackground = false,
  environmentPreset = "sunset",
  enable3DMeshIcons = true,
  meshIconPercentage = 0.25, // 25% of icons will be 3D meshes by default
  randomSeed,
  plugins = [],
  onPluginLaunch,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Create icon data from plugins
  const pluginIconData = useMemo(() => {
    return plugins.map((plugin) => ({
      id: plugin.id,
      title: plugin.manifest.name,
      description: `Launch ${plugin.manifest.name}`,
      iconPath: `/icons/34737_logo_beos_logo_beos.png`, // Default icon for now
      color: "#4A90E2",
      is3DMesh: false,
      meshType: "cube" as const,
    }));
  }, [plugins]);

  // Memoize the icon data with 3D mesh configuration
  const iconData = useMemo(() => {
    // Use plugin icons if available, otherwise fall back to static icons
    const baseIcons = pluginIconData.length > 0 ? pluginIconData : desktopIcons;

    if (!enable3DMeshIcons) {
      return baseIcons;
    }

    // Set random seed if provided for reproducible results
    if (randomSeed !== undefined) {
      // Simple seeded random function
      let seed = randomSeed;
      Math.random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    }

    const meshIcons = applyRandom3DMesh(baseIcons, meshIconPercentage);

    // Reset Math.random if we used a seed
    if (randomSeed !== undefined) {
      // Restore the original Math.random (this is a simplified approach)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (Math as any).random;
    }

    return meshIcons;
  }, [pluginIconData, enable3DMeshIcons, meshIconPercentage, randomSeed]);

  // Memoize onReady callback to prevent CSS3D renderer recreation
  const onReady = useCallback(() => setIsReady(true), []);

  // Initialize dual renderer system
  const {
    css3dRenderer,
    css3dScene,
    orthoCamera,
    renderCSS3D,
    setPointerEvents,
  } = useDualRenderer({
    containerRef,
    onReady,
  });

  /**
   * Handle icon clicks - create new windows
   */
  const handleIconClick = useCallback(
    (title: string, content: React.ReactNode) => {
      onWindowCreate(title, content);
    },
    [onWindowCreate]
  );

  /**
   * Performance optimization - only render when needed
   */
  const [needsRender, setNeedsRender] = useState(true);

  useEffect(() => {
    if (needsRender) {
      setNeedsRender(false);
    }
  }, [needsRender]);
  /**
   * Trigger re-render when windows change
   */
  useEffect(() => {
    setNeedsRender(true);
  }, [windows]);

  /**
   * Enable CSS3D pointer events only when there are windows to interact with
   */
  useEffect(() => {
    if (setPointerEvents) {
      setPointerEvents(windows.length > 0);
    }
  }, [windows.length, setPointerEvents]);

  if (!isReady) {
    return (
      <div
        ref={containerRef}
        className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900"
      >
        <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
          Initializing 3D Desktop...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen relative overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {" "}
      {/* React Three Fiber Canvas - WebGL layer (z-index: 1) */}
      <Canvas
        camera={{
          position: [0, 0, 2000],
          fov: 35, // Changed from 75 to 35 for 75mm lens equivalent (more portrait-like view)
          near: 1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={window.devicePixelRatio}
        frameloop={needsRender ? "always" : "demand"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: "auto",
        }}
      >
        {/* Background scene */}
        <BackgroundScene
          use3DBackground={use3DBackground}
          environmentPreset={environmentPreset}
        />
        {/* Lighting for 3D icons */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[1000, 1000, 1000]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-1000, -1000, 1000]} intensity={0.4} />
        {/* Camera controls */}
        <CameraController controls={cameraControls} />{" "}
        {/* Desktop icons as instanced meshes */}
        <IconInstances
          layout={currentLayout}
          iconSize={iconSize}
          onIconClick={handleIconClick}
          maxRandomDelay={animationRandomness.maxRandomDelay}
          speedVariation={animationRandomness.speedVariation}
          animationDuration={2.0}
          iconData={iconData}
        />
        {/* Render loop coordination */}
        <RenderLoop renderCSS3D={renderCSS3D} />
      </Canvas>
      {/* CSS3D Windows Layer (z-index: 2) - managed by useDualRenderer */}
      {css3dRenderer && orthoCamera && css3dScene && (
        <WindowLayer
          windows={windows}
          css3dRenderer={css3dRenderer}
          orthoCamera={orthoCamera}
          css3dScene={css3dScene}
          onWindowDrag={onWindowDrag}
          onWindowClose={onWindowClose}
          onWindowMinimize={onWindowMinimize}
          onWindowMaximize={onWindowMaximize}
          onWindowFocus={onWindowFocus}
          renderCSS3D={renderCSS3D}
        />
      )}
    </div>
  );
};

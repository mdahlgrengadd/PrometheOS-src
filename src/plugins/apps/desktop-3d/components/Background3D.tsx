import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { Box, Environment, Sphere, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

interface Background3DProps {
  containerRef: React.RefObject<HTMLDivElement>;
  use3D?: boolean;
  environmentFiles?: string[];
  environmentPath?: string;
}

const Background3D: React.FC<Background3DProps> = ({
  containerRef,
  use3D = false,
  environmentFiles,
  environmentPath,
}) => {
  const bgSceneRef = useRef<THREE.Scene | null>(null);
  const bgRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bgCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number>();
  const gridRef = useRef<THREE.GridHelper | null>(null);
  useEffect(() => {
    // Manual Three.js renderer is disabled - we use R3F Canvas instead
    return;

    // Capture container ref to avoid stale closure warnings
    const container = containerRef.current;

    // Create perspective scene for 3D background
    const bgScene = new THREE.Scene();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bgCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 5000);
    bgCamera.position.set(0, 0, 1200);

    const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    gl.setSize(w, h);
    gl.domElement.style.position = "absolute";
    gl.domElement.style.top = "0";
    gl.domElement.style.zIndex = "0";
    gl.domElement.style.pointerEvents = "none";
    container.appendChild(gl.domElement);

    // Add grid for visual depth
    const grid = new THREE.GridHelper(4000, 40, 0x444444, 0x222222);
    bgScene.add(grid);
    gridRef.current = grid;

    bgSceneRef.current = bgScene;
    bgRendererRef.current = gl;
    bgCameraRef.current = bgCamera;

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Subtle animation
      if (gridRef.current) {
        gridRef.current.rotation.y += 0.001;
      }

      if (bgRendererRef.current && bgSceneRef.current && bgCameraRef.current) {
        gl.render(bgScene, bgCamera);
      }
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (bgCameraRef.current && bgRendererRef.current) {
        bgCameraRef.current.aspect = w / h;
        bgCameraRef.current.updateProjectionMatrix();
        bgRendererRef.current.setSize(w, h);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (bgRendererRef.current && container) {
        try {
          if (bgRendererRef.current.domElement.parentNode === container) {
            container.removeChild(bgRendererRef.current.domElement);
          }
        } catch (error) {
          console.warn("Error removing background renderer:", error);
        }
      }

      bgSceneRef.current = null;
      bgRendererRef.current = null;
      bgCameraRef.current = null;
    };
  }, [containerRef, use3D]); // For R3F environments, render with Canvas
  if (use3D) {
    return (
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 1200], fov: 60 }}>
          {" "}
          {environmentFiles && environmentPath ? (
            <Environment
              background
              files={environmentFiles}
              path={environmentPath}
            />
          ) : (
            <>
              <Environment background preset="sunset" blur={0.5} />
            </>
          )}
        </Canvas>
      </div>
    );
  }

  // Default gradient background
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600 -z-10" />
  );
};

export default Background3D;

// Example usage of the Desktop 3D module
// Copy this into your main App.tsx or create a new component

// Import the required CSS styles
import "./desktop-3d/styles/index.css";
import "./desktop-3d/styles/App.css";

import React from "react";

import { Desktop3D } from "./desktop-3d";

/**
 * Basic Desktop 3D integration
 */
export function BasicDesktop3DExample() {
  return (
    <div className="w-full h-screen">
      <Desktop3D />
    </div>
  );
}

/**
 * Advanced Desktop 3D integration with custom configuration
 */
export function AdvancedDesktop3DExample() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600">
      <Desktop3D />
    </div>
  );
}

/**
 * Desktop 3D with custom background
 */
export function Desktop3DWithCustomBackground() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen relative overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* Custom background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />{" "}
      {/* Desktop 3D Component */}
      <Desktop3D />
    </div>
  );
}

/**
 * Desktop 3D with 3D mesh geometries instead of icons
 */
export function Desktop3DWith3DMeshes() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      {/* Add some ambient lighting for better 3D mesh visibility */}
      <div className="absolute inset-0">
        <Desktop3D
          // Enable 3D mesh mode
          use3DMesh={true}
          // Choose geometry type (dodecahedron, icosahedron, octahedron, tetrahedron, cube)
          meshType="dodecahedron"
          // Enable spinning animation
          enableMeshRotation={true}
          // Start with sphere layout to show off the 3D effect
          initialLayout="sphere"
        />
      </div>

      {/* Instructions overlay */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="font-semibold mb-2">3D Mesh Mode</h3>
        <p className="text-sm text-gray-300 mb-2">
          Icons are now spinning 3D dodecahedrons with colorful materials.
        </p>
        <p className="text-xs text-gray-400">
          Try different layouts: 1=Grid, 2=Table, 3=Sphere, 4=Helix, 5=Columns
        </p>
      </div>
    </div>
  );
}

/**
 * Usage in your main App component
 */
export function App() {
  const [activeExample, setActiveExample] = React.useState<
    "basic" | "advanced" | "custom" | "3d-meshes"
  >("basic");

  const renderExample = () => {
    switch (activeExample) {
      case "basic":
        return <BasicDesktop3DExample />;
      case "advanced":
        return <AdvancedDesktop3DExample />;
      case "custom":
        return <Desktop3DWithCustomBackground />;
      case "3d-meshes":
        return <Desktop3DWith3DMeshes />;
      default:
        return <BasicDesktop3DExample />;
    }
  };

  return (
    <div className="w-full h-screen">
      {/* Example switcher (remove in production) */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setActiveExample("basic")}
          className={`px-3 py-1 rounded text-sm ${
            activeExample === "basic"
              ? "bg-blue-500 text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveExample("advanced")}
          className={`px-3 py-1 rounded text-sm ${
            activeExample === "advanced"
              ? "bg-blue-500 text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          Advanced
        </button>
        <button
          onClick={() => setActiveExample("custom")}
          className={`px-3 py-1 rounded text-sm ${
            activeExample === "custom"
              ? "bg-blue-500 text-white"
              : "bg-white/20 text-white hover:bg-white/30"
          }`}
        >
          Custom
        </button>
      </div>

      {renderExample()}
    </div>
  );
}

export default App;

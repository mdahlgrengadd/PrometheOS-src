import React from "react";

const SkeumorphicGridBackground = ({
  className = "",
  gridSize = 20,
  gridOpacity = 0.08,
  textureOpacity = 0.02,
  textureSize = 100,
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.3)",
      }}
    >
      {/* Textured Grid Overlay */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.3,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${gridOpacity}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,${textureOpacity}) 0%, transparent 70%)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, ${textureSize}px ${textureSize}px`,
        }}
      />
    </div>
  );
};

// Example usage component
const BackgroundDemo = () => {
  return (
    <div className="w-full h-screen">
      <SkeumorphicGridBackground className="w-full h-full">
        {/* Your content goes here */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div
            className="text-white text-2xl font-bold"
            style={{
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            Skeumorphic Grid Background
          </div>
        </div>
      </SkeumorphicGridBackground>
    </div>
  );
};

export default BackgroundDemo;

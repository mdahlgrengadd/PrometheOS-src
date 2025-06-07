import React from 'react';

// Camera control options interface
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

// Icon size options
export type IconSize = "small" | "medium" | "large";

interface LayoutControlsProps {
  onLayoutChange: (
    layout: "table" | "sphere" | "helix" | "grid" | "columns"
  ) => void;
  currentLayout: "table" | "sphere" | "helix" | "grid" | "columns";
  animationRandomness?: {
    maxRandomDelay: number;
    speedVariation: number;
  };
  onRandomnessChange?: (randomness: {
    maxRandomDelay: number;
    speedVariation: number;
  }) => void;
  iconSize?: IconSize;
  onIconSizeChange?: (size: IconSize) => void;
  isPopup?: boolean;
  side?: "left" | "right";
  cameraControls?: CameraControlOptions;
  onCameraControlsChange?: (controls: CameraControlOptions) => void;
}

const LayoutControls: React.FC<LayoutControlsProps> = ({
  onLayoutChange,
  currentLayout,
  animationRandomness = { maxRandomDelay: 0, speedVariation: 0 },
  onRandomnessChange,
  iconSize = "large",
  onIconSizeChange,
  isPopup = false,
  side = "left",
  cameraControls,
  onCameraControlsChange,
}) => {
  const layouts = [
    { key: "grid", label: "TABLET", shortcut: "1" },
    { key: "helix", label: "TASKBAR", shortcut: "2" },
    { key: "columns", label: "DESKTOP", shortcut: "3" },
  ] as const;

  // Hidden layouts (still available programmatically but not shown in UI)
  // { key: "table", label: "TABLE", shortcut: "2" },
  // { key: "sphere", label: "SPHERE", shortcut: "3" },

  // Custom CSS for range sliders
  const sliderStyles = `
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    }
    .slider::-moz-range-thumb {
      height: 16px;
      width: 16px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      border: none;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    }
  `;
  return (
    <div
      className={`${
        isPopup ? "" : "fixed z-20 bottom-8 left-0 right-0 flex justify-center"
      }`}
    >
      <div
        className="flex flex-col gap-3 rounded-lg p-4 border border-white/20 min-w-96 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.85) 0%, rgba(20, 20, 30, 0.9) 50%, rgba(0, 0, 0, 0.85) 100%)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Frosted glass effect overlay */}
        <div
          className="absolute inset-0 rounded-lg opacity-30 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)",
          }}
        />
        {/* Layout Controls */}
        <div className="flex gap-2">
          {layouts.map((layout) => (
            <button
              key={layout.key}
              onClick={() => onLayoutChange(layout.key)}
              className={`
                flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${
                  currentLayout === layout.key
                    ? "bg-accent/20 text-white shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-accent/10"
                }
              `}
              title={`Press ${layout.shortcut} for ${layout.label}`}
            >
              {layout.label}
            </button>
          ))}{" "}
        </div>

        {/* Desktop Icons Size Control */}
        {onIconSizeChange && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="text-white/80 text-sm font-medium">
              Desktop Icons Size
            </div>
            <div className="flex gap-2">
              {[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => onIconSizeChange(size.value as IconSize)}
                  className={`
                    flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200
                    ${
                      iconSize === size.value
                        ? "bg-accent/20 text-white shadow-md"
                        : "text-white/70 hover:text-white hover:bg-accent/10"
                    }
                  `}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Randomness Controls */}
        {onRandomnessChange && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="text-white/80 text-sm font-medium">
              Animation Randomness
            </div>
            {/* Random Delay Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Random Delay</span>
                <span>{animationRandomness.maxRandomDelay}ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={animationRandomness.maxRandomDelay}
                onChange={(e) =>
                  onRandomnessChange({
                    ...animationRandomness,
                    maxRandomDelay: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            {/* Speed Variation Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Speed Variation</span>
                <span>
                  {Math.round(animationRandomness.speedVariation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={animationRandomness.speedVariation}
                onChange={(e) =>
                  onRandomnessChange({
                    ...animationRandomness,
                    speedVariation: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />{" "}
            </div>{" "}
          </div>
        )}

        {/* Camera Controls */}
        {onCameraControlsChange && cameraControls && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="text-white/80 text-sm font-medium">
              Camera Controls
            </div>

            {/* Enable/Disable All Controls */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">
                Enable Camera Controls
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cameraControls.enabled}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      enabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Control Type Toggles */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id="enableRotate"
                  checked={cameraControls.enableRotate}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      enableRotate: e.target.checked,
                    })
                  }
                  className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                />
                <label htmlFor="enableRotate" className="text-xs text-white/60">
                  Rotate
                </label>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id="enablePan"
                  checked={cameraControls.enablePan}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      enablePan: e.target.checked,
                    })
                  }
                  className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                />
                <label htmlFor="enablePan" className="text-xs text-white/60">
                  Pan
                </label>
              </div>
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id="enableZoom"
                  checked={cameraControls.enableZoom}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      enableZoom: e.target.checked,
                    })
                  }
                  className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                />
                <label htmlFor="enableZoom" className="text-xs text-white/60">
                  Zoom
                </label>
              </div>
            </div>

            {/* Rotation Locks */}
            <div className="space-y-1">
              <div className="text-xs text-white/60 font-medium">
                Lock Rotation Axes
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="lockRotationX"
                    checked={cameraControls.lockRotationX}
                    onChange={(e) =>
                      onCameraControlsChange({
                        ...cameraControls,
                        lockRotationX: e.target.checked,
                      })
                    }
                    className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                  />
                  <label
                    htmlFor="lockRotationX"
                    className="text-xs text-white/70"
                  >
                    X
                  </label>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="lockRotationY"
                    checked={cameraControls.lockRotationY}
                    onChange={(e) =>
                      onCameraControlsChange({
                        ...cameraControls,
                        lockRotationY: e.target.checked,
                      })
                    }
                    className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                  />
                  <label
                    htmlFor="lockRotationY"
                    className="text-xs text-white/70"
                  >
                    Y
                  </label>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="lockRotationZ"
                    checked={cameraControls.lockRotationZ}
                    onChange={(e) =>
                      onCameraControlsChange({
                        ...cameraControls,
                        lockRotationZ: e.target.checked,
                      })
                    }
                    className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                  />
                  <label
                    htmlFor="lockRotationZ"
                    className="text-xs text-white/70"
                  >
                    Z
                  </label>
                </div>
              </div>
            </div>

            {/* Pan Locks */}
            <div className="space-y-1">
              <div className="text-xs text-white/70 font-medium">
                Lock Pan Axes
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="lockPanX"
                    checked={cameraControls.lockPanX}
                    onChange={(e) =>
                      onCameraControlsChange({
                        ...cameraControls,
                        lockPanX: e.target.checked,
                      })
                    }
                    className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                  />
                  <label htmlFor="lockPanX" className="text-xs text-white/70">
                    X
                  </label>
                </div>
                <div className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    id="lockPanY"
                    checked={cameraControls.lockPanY}
                    onChange={(e) =>
                      onCameraControlsChange({
                        ...cameraControls,
                        lockPanY: e.target.checked,
                      })
                    }
                    className="w-3 h-3 text-blue-600 bg-transparent border-gray-300 rounded"
                  />
                  <label htmlFor="lockPanY" className="text-xs text-white/70">
                    Y
                  </label>
                </div>
              </div>
            </div>

            {/* Speed Controls */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Rotation Speed</span>
                  <span>{cameraControls.rotateSpeed?.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={cameraControls.rotateSpeed}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      rotateSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Zoom Speed</span>
                  <span>{cameraControls.zoomSpeed?.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={cameraControls.zoomSpeed}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      zoomSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Pan Speed</span>
                  <span>{cameraControls.panSpeed?.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={cameraControls.panSpeed}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      panSpeed: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Distance Controls */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Min Distance</span>
                  <span>{cameraControls.minDistance}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={cameraControls.minDistance}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      minDistance: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-white/70">
                  <span>Max Distance</span>
                  <span>{cameraControls.maxDistance}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="10000"
                  step="500"
                  value={cameraControls.maxDistance}
                  onChange={(e) =>
                    onCameraControlsChange({
                      ...cameraControls,
                      maxDistance: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>{" "}
      {!isPopup && (
        <div className="text-center text-white/60 text-xs mt-2">
          Press 1-3 for quick layout switching
        </div>
      )}
    </div>
  );
};

export default LayoutControls;
